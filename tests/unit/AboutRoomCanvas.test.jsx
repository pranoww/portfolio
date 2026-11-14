import { render, screen, fireEvent } from '@testing-library/react';
import AboutRoomCanvas from '@/components/about/AboutRoomCanvas';
import { roomObjectList } from '@/content/siteContent';

beforeEach(() => {
  globalThis.IntersectionObserver = class { observe() {} disconnect() {} };
  globalThis.ResizeObserver = class { observe() {} disconnect() {} };
});

test('shows six numbered dots and the intro caption', () => {
  render(<AboutRoomCanvas />);
  expect(screen.getAllByRole('button', { pressed: false })).toHaveLength(6);
  expect(screen.getByText('Have a look around.')).toBeInTheDocument();
});

test('clicking a dot shows that object\'s story and a way back', () => {
  render(<AboutRoomCanvas />);
  fireEvent.click(screen.getByRole('button', { name: /^Weekends/ }));
  expect(screen.getByText(roomObjectList[4].title)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Back to the whole room' }));
  expect(screen.getByText('Have a look around.')).toBeInTheDocument();
});

test('Escape returns to the whole room', () => {
  render(<AboutRoomCanvas />);
  fireEvent.click(screen.getByRole('button', { name: /^Studied/ }));
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(screen.getByText('Have a look around.')).toBeInTheDocument();
});
