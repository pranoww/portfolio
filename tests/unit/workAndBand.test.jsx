import { render, screen, within } from '@testing-library/react';
import SelectedWorkSection from '@/components/work/SelectedWorkSection';
import StatementBand from '@/components/band/StatementBand';

beforeEach(() => {
  globalThis.IntersectionObserver = class { observe() {} disconnect() {} };
});

test('each project card links its case study and GitHub to the repo', () => {
  render(<SelectedWorkSection />);
  const jobscoutCard = screen.getByRole('article', { name: 'jobscout' });
  within(jobscoutCard).getAllByRole('link').forEach(link => {
    expect(link).toHaveAttribute('href', 'https://github.com/pranoww/jobscout');
    expect(link).toHaveAttribute('target', '_blank');
  });
  expect(within(jobscoutCard).getByRole('link', { name: 'Read the case study' })).toBeInTheDocument();
});

test('jobscout shows its screenshot and Skin Care AI shows its chat preview', () => {
  render(<SelectedWorkSection />);
  expect(within(screen.getByRole('article', { name: 'jobscout' })).getByRole('img')).toHaveAttribute('alt', expect.stringMatching(/Scrape screen/));
  expect(within(screen.getByRole('article', { name: 'Skin Care AI' })).getByText(/Voice reply playing/)).toBeInTheDocument();
});

test('statement band shows its three numbers', () => {
  render(<StatementBand />);
  expect(screen.getByText(/gray cat in charge of quality/)).toBeInTheDocument();
  expect(screen.getByText('opens instantly')).toBeInTheDocument();
});
