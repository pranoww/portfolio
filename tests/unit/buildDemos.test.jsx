import { render, screen, act } from '@testing-library/react';
import ResponsiveBrowserDemo from '@/components/build/ResponsiveBrowserDemo';
import ApiRequestLogDemo from '@/components/build/ApiRequestLogDemo';
import AiChatDemo from '@/components/build/AiChatDemo';
import SpeedChecklistDemo from '@/components/build/SpeedChecklistDemo';
import WhatIBuildSection from '@/components/build/WhatIBuildSection';
import { aiChatExample, buildItemList, responsiveAppExample } from '@/content/siteContent';

beforeEach(() => {
  vi.useFakeTimers();
  globalThis.IntersectionObserver = class { observe() {} disconnect() {} };
  window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
});
afterEach(() => vi.useRealTimers());

const shownRowCount = () => document.querySelectorAll('[data-shown="true"]').length;

test('API log reveals one request at a time while active, including a refused 403', () => {
  render(<ApiRequestLogDemo isActive />);
  expect(shownRowCount()).toBe(0);
  act(() => vi.advanceTimersByTime(950));
  expect(shownRowCount()).toBe(2);
  act(() => vi.advanceTimersByTime(2400));
  expect(shownRowCount()).toBe(5);
  expect(screen.getByText('403')).toBeInTheDocument();
});

test('API log stays still while inactive', () => {
  render(<ApiRequestLogDemo isActive={false} />);
  act(() => vi.advanceTimersByTime(5000));
  expect(shownRowCount()).toBe(0);
});

test('AI chat types the answer word by word, then shows the safety badges', () => {
  render(<AiChatDemo isActive />);
  expect(screen.queryByText('Safety check passed')).not.toBeVisible();
  act(() => vi.advanceTimersByTime(620));
  expect(screen.getByTestId('ai-answer').textContent).toBe('Yes.');
  act(() => vi.advanceTimersByTime(3000));
  expect(screen.getByTestId('ai-answer').textContent).toBe(aiChatExample.answer);
  expect(screen.getByText('Safety check passed')).toBeVisible();
});

test('speed checklist ticks items off in order', () => {
  render(<SpeedChecklistDemo isActive />);
  act(() => vi.advanceTimersByTime(400));
  expect(shownRowCount()).toBe(1);
  act(() => vi.advanceTimersByTime(2300));
  expect(shownRowCount()).toBe(6);
});

test('section lists all four things with their titles', () => {
  render(<WhatIBuildSection />);
  buildItemList.forEach(item => expect(screen.getAllByText(item.title).length).toBeGreaterThan(0));
});

test('web demo shows a real app with its rows, not empty placeholder blocks', () => {
  render(<ResponsiveBrowserDemo isActive />);
  expect(screen.getByText(responsiveAppExample.heading)).toBeInTheDocument();
  expect(screen.getAllByTestId('app-row')).toHaveLength(responsiveAppExample.rowList.length);
  expect(screen.getByText(responsiveAppExample.rowList[0].role)).toBeInTheDocument();
});
