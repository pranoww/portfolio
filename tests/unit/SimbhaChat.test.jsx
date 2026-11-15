import { render, screen, fireEvent } from '@testing-library/react';
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

afterEach(() => vi.unstubAllGlobals());

test('the button opens and closes the chat and reports it', () => {
  const onOpenChange = vi.fn();
  render(<SimbhaChat onOpenChange={onOpenChange} />);
  fireEvent.click(screen.getByRole('button', { name: 'Ask Simbha' }));
  expect(screen.getByRole('dialog', { name: 'Ask Simbha' })).toBeInTheDocument();
  expect(screen.getByLabelText('Your question for Simbha')).toHaveFocus();
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
});

test('a suggested question is sent and the streamed reply appears', async () => {
  const fetchMock = mockSimbhaApi(streamedResponse(['jobscout and ', 'Skin Care AI. I QA’d both.']));
  render(<SimbhaChat />);
  fireEvent.click(screen.getByRole('button', { name: 'Ask Simbha' }));
  fireEvent.click(screen.getByRole('button', { name: 'What has he built?' }));
  expect(await screen.findByText('jobscout and Skin Care AI. I QA’d both.')).toBeInTheDocument();
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ question: 'What has he built?', history: [] });
});

test('earlier messages are sent along as history', async () => {
  const fetchMock = mockSimbhaApi(streamedResponse(['Mrrp.']));
  render(<SimbhaChat />);
  fireEvent.click(screen.getByRole('button', { name: 'Ask Simbha' }));
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
  render(<SimbhaChat />);
  fireEvent.click(screen.getByRole('button', { name: 'Ask Simbha' }));
  fireEvent.click(screen.getByRole('button', { name: 'Can I hire him?' }));
  expect(await screen.findByText('That’s enough questions for now.')).toBeInTheDocument();
});

test('a network failure shows the napping line', async () => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))));
  render(<SimbhaChat />);
  fireEvent.click(screen.getByRole('button', { name: 'Ask Simbha' }));
  fireEvent.click(screen.getByRole('button', { name: 'Can I hire him?' }));
  expect(await screen.findByText('Simbha is napping. Try again in a bit.')).toBeInTheDocument();
  expect(screen.queryByText(/Failed to fetch/)).not.toBeInTheDocument();
});

test('an empty reply shows the napping line instead of thinking forever', async () => {
  mockSimbhaApi(streamedResponse([]));
  render(<SimbhaChat />);
  fireEvent.click(screen.getByRole('button', { name: 'Ask Simbha' }));
  fireEvent.click(screen.getByRole('button', { name: 'Can I hire him?' }));
  expect(await screen.findByText('Simbha is napping. Try again in a bit.')).toBeInTheDocument();
});
