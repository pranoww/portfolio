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

test('a valid message shows one thank-you note and the form goes away', () => {
  render(<ContactForm />);
  fillContactForm();
  fireEvent.click(screen.getByRole('button', { name: /send message/i }));
  expect(screen.getAllByText('Thanks! I\'ll get back to you soon.')).toHaveLength(1);
  expect(screen.queryByRole('button', { name: /send message/i })).not.toBeInTheDocument();
});
