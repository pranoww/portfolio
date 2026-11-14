import { render, screen, act } from '@testing-library/react';
import ExperienceSection from '@/components/experience/ExperienceSection';
import ContactSection from '@/components/contact/ContactSection';

let observerCallbackList = [];
beforeEach(() => {
  observerCallbackList = [];
  globalThis.IntersectionObserver = class {
    constructor(callback) { observerCallbackList.push(callback); }
    observe() {}
    disconnect() {}
  };
});

test('experience lists both roles with their dates', () => {
  render(<ExperienceSection />);
  expect(screen.getByRole('heading', { level: 3, name: 'Software Developer, Full-Stack' })).toBeInTheDocument();
  expect(screen.getByText('Nov 2025 to Jan 2026')).toBeInTheDocument();
});

test('the timeline bar draws once it scrolls into view', () => {
  render(<ExperienceSection />);
  const timeline = screen.getByTestId('experience-timeline');
  expect(timeline).toHaveAttribute('data-drawn', 'false');
  act(() => observerCallbackList.forEach(callback => callback([{ isIntersecting: true }])));
  expect(timeline).toHaveAttribute('data-drawn', 'true');
});

test('contact section has the email link and the form', () => {
  render(<ContactSection />);
  expect(screen.getByRole('link', { name: 'pranavlande555@gmail.com' })).toHaveAttribute('href', 'mailto:pranavlande555@gmail.com');
  expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
});
