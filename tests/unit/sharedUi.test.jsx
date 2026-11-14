import { render, screen, act } from '@testing-library/react';
import PillButton from '@/components/ui/PillButton';
import TagPill from '@/components/ui/TagPill';
import SectionHeading from '@/components/ui/SectionHeading';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

let observerCallback;
beforeEach(() => {
  globalThis.IntersectionObserver = class {
    constructor(callback) { observerCallback = callback; }
    observe() {}
    disconnect() {}
  };
});

test('PillButton renders a link with its href and optional download', () => {
  render(<PillButton href="/resume.pdf" download>Resume</PillButton>);
  const link = screen.getByRole('link', { name: 'Resume' });
  expect(link).toHaveAttribute('href', '/resume.pdf');
  expect(link).toHaveAttribute('download');
});

test('PillButton renders a button when given a type instead of an href', () => {
  render(<PillButton type="submit">Send message</PillButton>);
  expect(screen.getByRole('button', { name: 'Send message' })).toHaveAttribute('type', 'submit');
});

test('TagPill shows its text', () => {
  render(<TagPill>FastAPI</TagPill>);
  expect(screen.getByText('FastAPI')).toBeInTheDocument();
});

test('SectionHeading renders the title as a level 2 heading with its lead', () => {
  render(<SectionHeading title="Experience" lead="One Health Assist, Mumbai." />);
  expect(screen.getByRole('heading', { level: 2, name: 'Experience' })).toBeInTheDocument();
  expect(screen.getByText('One Health Assist, Mumbai.')).toBeInTheDocument();
});

test('RevealOnScroll becomes visible once it enters the viewport', () => {
  render(<RevealOnScroll><p>Hello</p></RevealOnScroll>);
  const wrapper = screen.getByText('Hello').parentElement;
  expect(wrapper).toHaveAttribute('data-revealed', 'false');
  act(() => observerCallback([{ isIntersecting: true }]));
  expect(wrapper).toHaveAttribute('data-revealed', 'true');
});

test('TextLink opens outside links in a new tab', async () => {
  const { default: TextLink } = await import('@/components/ui/TextLink');
  render(<TextLink href="https://github.com/pranoww">GitHub</TextLink>);
  expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('target', '_blank');
});
