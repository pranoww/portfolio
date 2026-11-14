import { render, screen, fireEvent } from '@testing-library/react';
import ContactForm from '@/components/contact/ContactForm';

function fillContactForm({ name = 'Asha', email = 'asha@example.com', message = 'I need a website for my bakery.' } = {}) {
  fireEvent.change(screen.getByLabelText('Your name'), { target: { value: name } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } });
  fireEvent.change(screen.getByLabelText('Message'), { target: { value: message } });
}

test('empty submit shows an error under every field', () => {
  render(<ContactForm />);
  fireEvent.click(screen.getByRole('button', { name: /send message/i }));
  expect(screen.getByText('Please add your name.')).toBeInTheDocument();
  expect(screen.getByText('Please add your email.')).toBeInTheDocument();
  expect(screen.getByText('Please write a short message (at least 10 characters).')).toBeInTheDocument();
});

test('an invalid email is flagged on its field', () => {
  render(<ContactForm />);
  fillContactForm({ email: 'asha@' });
  fireEvent.click(screen.getByRole('button', { name: /send message/i }));
  expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByText('That email doesn’t look right.')).toBeInTheDocument();
});

test('a message over 5000 characters is rejected', () => {
  render(<ContactForm />);
  fillContactForm({ message: 'a'.repeat(5001) });
  fireEvent.click(screen.getByRole('button', { name: /send message/i }));
  expect(screen.getByText('Please keep the message under 5000 characters.')).toBeInTheDocument();
});

function mockContactApi(response) {
  const fetchMock = vi.fn(() => (response instanceof Error ? Promise.reject(response) : Promise.resolve(response)));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

test('a valid message is sent to the backend, then one thank-you note replaces the form', async () => {
  const fetchMock = mockContactApi({ ok: true, status: 201, json: async () => ({ status: 'received' }) });
  render(<ContactForm />);
  fillContactForm();
  fireEvent.click(screen.getByRole('button', { name: /send message/i }));
  expect(await screen.findAllByText("Thanks! I'll get back to you soon.")).toHaveLength(1);
  expect(screen.queryByRole('button', { name: /send message/i })).not.toBeInTheDocument();
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ name: 'Asha', email: 'asha@example.com', message: 'I need a website for my bakery.', website: '' });
});

test('an invalid form is never sent', () => {
  const fetchMock = mockContactApi({ ok: true, status: 201, json: async () => ({}) });
  render(<ContactForm />);
  fireEvent.click(screen.getByRole('button', { name: /send message/i }));
  expect(fetchMock).not.toHaveBeenCalled();
});

test('a network failure keeps the form and shows an error', async () => {
  mockContactApi(new Error('offline'));
  render(<ContactForm />);
  fillContactForm();
  fireEvent.click(screen.getByRole('button', { name: /send message/i }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Sorry, that didn’t go through.');
  expect(screen.getByRole('button', { name: /send message/i })).toBeEnabled();
});

test('a rate-limited send shows the backend message', async () => {
  mockContactApi({ ok: false, status: 429, json: async () => ({ detail: 'Too many messages for now.' }) });
  render(<ContactForm />);
  fillContactForm();
  fireEvent.click(screen.getByRole('button', { name: /send message/i }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Too many messages for now.');
});
