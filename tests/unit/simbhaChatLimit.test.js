import { isSimbhaSleeping, quietResetMinutes, recordQuestion, sleepMaxMinutes, sleepMinMinutes, sleepQuestionNumber, warningQuestionNumber } from '@/components/cat/simbhaChatLimit';

const minute = 60_000;
beforeEach(() => localStorage.clear());

test('questions 1 to 13 are answered, 14 gets a warning, 15 puts Simbha to sleep', () => {
  expect([warningQuestionNumber, sleepQuestionNumber]).toEqual([14, 15]);
  const start = 1_000_000;
  const decisionList = Array.from({ length: sleepQuestionNumber }, (_, index) => recordQuestion(start + index * 1000));
  expect(decisionList.slice(0, warningQuestionNumber - 1).every(decision => decision === 'answer')).toBe(true);
  expect(decisionList[warningQuestionNumber - 1]).toBe('warn');
  expect(decisionList[sleepQuestionNumber - 1]).toBe('sleep');
  expect(isSimbhaSleeping(start + sleepQuestionNumber * 1000)).toBe(true);
});

test('his nap lasts 3 to 4 minutes', () => {
  expect([sleepMinMinutes, sleepMaxMinutes]).toEqual([3, 4]);
  for (const [roll, napMinutes] of [[0, 3], [0.999, 4]]) {
    localStorage.clear();
    const start = 1_000_000;
    for (let index = 0; index < sleepQuestionNumber; index++) recordQuestion(start + index * 1000, () => roll);
    const sleptAt = start + (sleepQuestionNumber - 1) * 1000;
    expect(isSimbhaSleeping(sleptAt + (napMinutes - 0.05) * minute)).toBe(true);
    expect(isSimbhaSleeping(sleptAt + (napMinutes + 0.05) * minute)).toBe(false);
  }
});

test('Simbha wakes up after the nap and the count starts again', () => {
  const start = 1_000_000;
  for (let index = 0; index < sleepQuestionNumber; index++) recordQuestion(start + index * 1000);
  const afterSleep = start + sleepQuestionNumber * 1000 + sleepMaxMinutes * minute + 1;
  expect(isSimbhaSleeping(afterSleep)).toBe(false);
  expect(recordQuestion(afterSleep)).toBe('answer');
});

test('a long quiet break also resets the count', () => {
  const start = 1_000_000;
  for (let index = 0; index < warningQuestionNumber - 1; index++) recordQuestion(start + index * 1000);
  expect(recordQuestion(start + warningQuestionNumber * 1000 + (quietResetMinutes + 1) * minute)).toBe('answer');
});

test('broken storage never breaks the chat', () => {
  localStorage.setItem('simbha-chat-limit', 'not json');
  expect(recordQuestion()).toBe('answer');
});
