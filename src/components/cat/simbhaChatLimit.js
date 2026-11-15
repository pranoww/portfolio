// Simbha's own chat limit, played as cat attitude instead of an error: after 9 questions he complains, after 10 he
// "goes to sleep" and closes the chat, and for 30 minutes clicking him only gets a brush-off.
// Kept in localStorage so a page refresh doesn't reset it; the backend's rate limits still apply underneath.
const storageKey = "simbha-chat-limit";
export const warningQuestionNumber = 10;
export const sleepQuestionNumber = 11;
export const sleepMinutes = 30;
const minuteInMs = 60_000;

function readLimitState() {
  try {
    const savedState = JSON.parse(window.localStorage.getItem(storageKey) || "null");
    if (savedState && typeof savedState.questionCount === "number") return savedState;
  } catch {
    // Private windows or blocked storage: the limit just starts fresh
  }
  return { questionCount: 0, lastQuestionAt: 0, sleepingUntil: 0 };
}

function saveLimitState(limitState) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(limitState));
  } catch {
    // Not saved, but the limit still works for this page visit
  }
}

export function isSimbhaSleeping(now = Date.now()) {
  return readLimitState().sleepingUntil > now;
}

// Counts one more question and says what Simbha does with it: "answer", "warn" or "sleep"
export function recordQuestion(now = Date.now()) {
  let limitState = readLimitState();
  const hasSleptItOff = limitState.sleepingUntil > 0 && limitState.sleepingUntil <= now;
  const hasGoneQuiet = now - limitState.lastQuestionAt > sleepMinutes * minuteInMs;
  if (hasSleptItOff || hasGoneQuiet) limitState = { questionCount: 0, lastQuestionAt: 0, sleepingUntil: 0 };

  limitState.questionCount += 1;
  limitState.lastQuestionAt = now;
  if (limitState.questionCount >= sleepQuestionNumber) limitState.sleepingUntil = now + sleepMinutes * minuteInMs;
  saveLimitState(limitState);

  if (limitState.questionCount >= sleepQuestionNumber) return "sleep";
  if (limitState.questionCount === warningQuestionNumber) return "warn";
  return "answer";
}
