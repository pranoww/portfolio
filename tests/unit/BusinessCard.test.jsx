import { render, screen, fireEvent } from '@testing-library/react';
import BusinessCard from '@/components/hero/BusinessCard';

test('clicking the card flips it', () => {
  render(<BusinessCard />);
  const card = screen.getByRole('button', { name: /business card/i });
  expect(card).toHaveAttribute('aria-pressed', 'false');
  fireEvent.click(card);
  expect(card).toHaveAttribute('aria-pressed', 'true');
});

test('Enter key flips the card', () => {
  render(<BusinessCard />);
  const card = screen.getByRole('button', { name: /business card/i });
  fireEvent.keyDown(card, { key: 'Enter' });
  expect(card).toHaveAttribute('aria-pressed', 'true');
});

test('clicking a link on the back does not flip the card', () => {
  render(<BusinessCard />);
  const card = screen.getByRole('button', { name: /business card/i });
  fireEvent.click(screen.getByRole('link', { name: 'GitHub' }));
  expect(card).toHaveAttribute('aria-pressed', 'false');
});

test('shows the local Mumbai time', () => {
  render(<BusinessCard />);
  expect(screen.getByTestId('mumbai-clock').textContent).toMatch(/^\d{2}:\d{2}$/);
});
