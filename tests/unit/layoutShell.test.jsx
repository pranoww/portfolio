import { render, screen, act, fireEvent } from '@testing-library/react';
import HelloLoader from '@/components/layout/HelloLoader';
import SiteHeader from '@/components/layout/SiteHeader';
import { helloWords } from '@/content/siteContent';

describe('HelloLoader', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    document.documentElement.classList.add('is-loading');
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.documentElement.classList.remove('is-loading');
  });

  test('shows each greeting in order, then hides and remembers the visit', () => {
    render(<HelloLoader />);
    expect(screen.getByText(helloWords[0])).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(420));
    expect(screen.getByText(helloWords[1])).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(10_000));
    expect(document.documentElement.classList.contains('is-loading')).toBe(false);
    expect(sessionStorage.getItem('pl-hello')).toBe('1');
  });

  test('Escape skips straight to the page', () => {
    render(<HelloLoader />);
    act(() => { fireEvent.keyDown(window, { key: 'Escape' }); vi.advanceTimersByTime(800); });
    expect(document.documentElement.classList.contains('is-loading')).toBe(false);
  });

  test('still finishes when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    render(<HelloLoader />);
    act(() => vi.advanceTimersByTime(10_000));
    expect(document.documentElement.classList.contains('is-loading')).toBe(false);
  });

  test('does nothing on a return visit', () => {
    document.documentElement.classList.remove('is-loading');
    render(<HelloLoader />);
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.queryByText(helloWords[1])).not.toBeInTheDocument();
  });
});

describe('SiteHeader', () => {
  test('menu button opens the menu and a link click closes it', () => {
    render(<SiteHeader />);
    const menuButton = screen.getByRole('button', { name: /open menu/i });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getAllByRole('link', { name: 'Work' })[0]);
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('has the resume download and the contact button', () => {
    render(<SiteHeader />);
    expect(screen.getByRole('link', { name: 'Resume' })).toHaveAttribute('href', '/resume/Pranav_Kishor_Lande_Resume.pdf');
    expect(screen.getByRole('link', { name: /get in touch/i })).toHaveAttribute('href', '#contact');
  });
});
