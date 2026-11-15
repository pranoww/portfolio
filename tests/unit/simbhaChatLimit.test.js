import { isSimbhaSleeping, recordQuestion, sleepMinutes } from '@/components/cat/simbhaChatLimit';

const minute = 60_000;
beforeEach(() => localStorage.clear());

test('questions 1 to 9 are answered, 10 gets a warning, 11 puts Simbha to sleep', () => {
  const start = 1_000_000;
  const decisionList = Array.from({ length: 11 }, (_, index) => recordQuestion(start + index * 1000));
  expect(decisionList.slice(0, 9).every(decision => decision === 'answer')).toBe(true);
  expect(decisionList[9]).toBe('warn');
  expect(decisionList[10]).toBe('sleep');
  expect(isSimbhaSleeping(start + 11_000)).toBe(true);
});

test('Simbha wakes up after the sleep and the count starts again', () => {
  const start = 1_000_000;
  for (let index = 0; index < 11; index++) recordQuestion(start + index * 1000);
  const afterSleep = start + 11_000 + sleepMinutes * minute + 1;
  expect(isSimbhaSleeping(afterSleep)).toBe(false);
  expect(recordQuestion(afterSleep)).toBe('answer');
});

test('a long quiet break also resets the count', () => {
  const start = 1_000_000;
  for (let index = 0; index < 9; index++) recordQuestion(start + index * 1000);
  expect(recordQuestion(start + 9000 + (sleepMinutes + 1) * minute)).toBe('answer');
});

test('broken storage never breaks the chat', () => {
  localStorage.setItem('simbha-chat-limit', 'not json');
  expect(recordQuestion()).toBe('answer');
});
