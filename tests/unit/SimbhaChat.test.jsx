import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SimbhaChat from '@/components/cat/SimbhaChat';

// A fake streamed reply: the panel reads it piece by piece, like the real backend response
function streamedResponse(pieceList) {
  const encoder = new TextEncoder();
  let index = 0;
  return {
    ok: true,
    status: 200,
    body: { getReader: () => ({ read: async () => (index < pieceList.length ? { done: false, value: encoder.encode(pieceList[index++]) } : { done: true }) }) },
  };
}

function mockSimbhaApi(response) {
  const fetchMock = vi.fn(() => Promise.resolve(response));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

beforeEach(() => localStorage.clear());
afterEach(() => vi.unstubAllGlobals());

test('the panel shows when open and Escape asks to close it', () => {
  const onClose = vi.fn();
  const { rerender } = render(<SimbhaChat isOpen={false} onClose={onClose} />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  rerender(<SimbhaChat isOpen onClose={onClose} />);
  expect(screen.getByRole('dialog', { name: 'Chat with Simbha' })).toBeInTheDocument();
  expect(screen.getByLabelText('Your question for Simbha')).toHaveFocus();
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('a suggested question is sent and the streamed reply appears', async () => {
  const fetchMock = mockSimbhaApi(streamedResponse(['jobscout and ', 'Skin Care AI. I QA’d both.']));
  render(<SimbhaChat isOpen onClose={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: 'What has he built?' }));
  expect(await screen.findByText('jobscout and Skin Care AI. I QA’d both.')).toBeInTheDocument();
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ question: 'What has he built?', history: [] });
});

test('earlier messages are sent along as history', async () => {
  const fetchMock = mockSimbhaApi(streamedResponse(['Mrrp.']));
  render(<SimbhaChat isOpen onClose={() => {}} />);
  fireEvent.change(screen.getByLabelText('Your question for Simbha'), { target: { value: 'Hi' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
  await screen.findByText('Mrrp.');
  fireEvent.change(screen.getByLabelText('Your question for Simbha'), { target: { value: 'Is he good?' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
  await screen.findAllByText('Mrrp.');
  expect(JSON.parse(fetchMock.mock.calls[1][1].body).history).toEqual([{ role: 'user', content: 'Hi' }, { role: 'assistant', content: 'Mrrp.' }]);
});

test('the rate-limit message from the backend is shown', async () => {
  mockSimbhaApi({ ok: false, status: 429, json: async () => ({ detail: 'That’s enough questions for now.' }) });
  render(<SimbhaChat isOpen onClose={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: 'Can I hire him?' }));
  expect(await screen.findByText('That’s enough questions for now.')).toBeInTheDocument();
});

test('a network failure shows the napping line', async () => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))));
  render(<SimbhaChat isOpen onClose={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: 'Can I hire him?' }));
  expect(await screen.findByText('Simbha is napping. Try again in a bit.')).toBeInTheDocument();
  expect(screen.queryByText(/Failed to fetch/)).not.toBeInTheDocument();
});

test('an empty reply shows the napping line instead of thinking forever', async () => {
  mockSimbhaApi(streamedResponse([]));
  render(<SimbhaChat isOpen onClose={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: 'Can I hire him?' }));
  expect(await screen.findByText('Simbha is napping. Try again in a bit.')).toBeInTheDocument();
});

test('the warning question gets an attitude line and the next one sends Simbha to sleep, both without calling the backend', async () => {
  const { warningQuestionNumber } = await import('@/components/cat/simbhaChatLimit');
  const answeredCount = warningQuestionNumber - 1;
  const fetchMock = mockSimbhaApi(streamedResponse(['Mrrp.']));
  const onClose = vi.fn();
  render(<SimbhaChat isOpen onClose={onClose} />);
  // Like a real visitor: type, then wait until Send is enabled (it stays disabled while the last answer finishes)
  const ask = async text => {
    fireEvent.change(screen.getByLabelText('Your question for Simbha'), { target: { value: text } });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Send' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
  };
  for (let index = 1; index <= answeredCount; index++) {
    fetchMock.mockImplementationOnce(() => Promise.resolve(streamedResponse([`Answer ${index}.`])));
    await ask(`question ${index}`);
    await screen.findByText(`Answer ${index}.`);
  }
  expect(fetchMock).toHaveBeenCalledTimes(answeredCount);

  await ask('the warning question');
  expect(await screen.findByText(/Chill out, dude|anyone else to talk to|Stop eating my brain/)).toBeInTheDocument();
  await ask('one more');
  const { simbhaChat: chatCopy } = await import('@/content/siteContent');
  expect(await screen.findByText(chatCopy.goingToSleepLine)).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledTimes(answeredCount);
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1), { timeout: 4000 });
});

test('Start over clears the chat with a fresh annoyed line but keeps the question count', async () => {
  mockSimbhaApi(streamedResponse(['Mrrp.']));
  const { simbhaChat } = await import('@/content/siteContent');
  render(<SimbhaChat isOpen onClose={() => {}} />);
  expect(screen.queryByRole('button', { name: 'Start over' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Can I hire him?' }));
  await screen.findByText('Mrrp.');
  const countBefore = JSON.parse(localStorage.getItem('simbha-chat-limit')).questionCount;

  fireEvent.click(screen.getByRole('button', { name: 'Start over' }));
  expect(screen.queryByText('Mrrp.')).not.toBeInTheDocument();
  expect(screen.queryByText(simbhaChat.greeting)).not.toBeInTheDocument();
  expect(simbhaChat.startOverLineList.some(line => screen.queryByText(line))).toBe(true);
  expect(screen.getByRole('button', { name: 'What has he built?' })).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem('simbha-chat-limit')).questionCount).toBe(countBefore);
});

test('waking Simbha after his nap clears the old chat and opens with his wake-up line', async () => {
  mockSimbhaApi(streamedResponse(['Mrrp.']));
  const { rerender } = render(<SimbhaChat isOpen onClose={() => {}} freshStart={null} />);
  fireEvent.click(screen.getByRole('button', { name: 'Can I hire him?' }));
  await screen.findByText('Mrrp.');
  rerender(<SimbhaChat isOpen onClose={() => {}} freshStart={{ line: 'Uhhh, you woke me up! What do you want?', id: 1 }} />);
  expect(screen.getByText('Uhhh, you woke me up! What do you want?')).toBeInTheDocument();
  expect(screen.queryByText('Mrrp.')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'What has he built?' })).toBeInTheDocument();
});
