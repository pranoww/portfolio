import createGrayCatBehaviour from '@/three/grayCatBehaviour';

const viewport = { viewportWidth: 1440, viewportHeight: 900, isMobile: false, isCalm: false, catHeight: 200, catUnit: 200 / 17 };
const frameSeconds = 1 / 60;

function runFor(cat, seconds, onFrame = () => {}) {
  for (let elapsed = 0; elapsed < seconds; elapsed += frameSeconds) {
    cat.update(frameSeconds);
    onFrame(cat);
  }
}

const bottomEdgeModes = ['sit', 'walk', 'chase', 'still'];

test('starts sitting in the bottom-right corner', () => {
  const cat = createGrayCatBehaviour(viewport);
  expect(cat.state.mode).toBe('sit');
  expect(cat.state.x).toBe(1440 - 120);
  expect(cat.state.y).toBe(900 - 14);
});

test('first activity starts between 45 and 55 seconds after load', () => {
  const cat = createGrayCatBehaviour(viewport);
  let firstActivityAt = null;
  let elapsed = 0;
  runFor(cat, 60, () => {
    elapsed += frameSeconds;
    if (firstActivityAt === null && cat.state.mode !== 'sit') firstActivityAt = elapsed;
  });
  expect(firstActivityAt).toBeGreaterThanOrEqual(45);
  expect(firstActivityAt).toBeLessThanOrEqual(55.1);
});

test('during a chase the cat waits for the mouse to pass and never gets ahead of it', () => {
  const cat = createGrayCatBehaviour(viewport);
  cat.startChase();
  let catStartedRunningWhileMouseBehind = false;
  let catAheadOfMouse = false;
  const startX = cat.state.x;
  runFor(cat, 6, () => {
    const direction = cat.mouse.direction;
    if (!cat.mouse.isRunning) return;
    const mouseAheadDistance = (cat.mouse.x - cat.state.x) * direction;
    if (cat.state.x !== startX && mouseAheadDistance < 0) catStartedRunningWhileMouseBehind = true;
    if (cat.state.isRunningAfterMouse && mouseAheadDistance < 0) catAheadOfMouse = true;
  });
  expect(catStartedRunningWhileMouseBehind).toBe(false);
  expect(catAheadOfMouse).toBe(false);
});

test('after chasing off-screen the cat comes back home and sits', () => {
  const cat = createGrayCatBehaviour({ ...viewport, random: () => 0.5 });
  cat.startChase();
  runFor(cat, 30);
  expect(cat.state.mode).toBe('sit');
  expect(Math.abs(cat.state.x - (1440 - 120))).toBeLessThan(24);
});

test('stays on the bottom edge whenever it is walking, sitting or chasing', () => {
  const cat = createGrayCatBehaviour(viewport);
  const offEdgeModes = new Set();
  runFor(cat, 240, () => {
    if (bottomEdgeModes.includes(cat.state.mode) && Math.abs(cat.state.y - (900 - 14)) > 0.5) offEdgeModes.add(cat.state.mode);
  });
  expect([...offEdgeModes]).toEqual([]);
});

test('pausing sends the cat home and stops all activities', () => {
  const cat = createGrayCatBehaviour(viewport);
  cat.startChase();
  runFor(cat, 1);
  cat.pause();
  expect(cat.mouse.isRunning).toBe(false);
  runFor(cat, 200);
  expect(cat.state.mode).toBe('still');
  expect(cat.state.x).toBe(1440 - 120);
});

test('clicking the cat makes her hop and say something', () => {
  const spokenKinds = [];
  const cat = createGrayCatBehaviour({ ...viewport, onSpeak: lineKind => spokenKinds.push(lineKind) });
  cat.handleCatClick();
  expect(cat.state.hopAmount).toBe(1);
  expect(spokenKinds).toContain('click');
});

test('clicking her three times in a row gets an annoyed reply, and she calms down after a pause', () => {
  const spokenKinds = [];
  const cat = createGrayCatBehaviour({ ...viewport, onSpeak: lineKind => spokenKinds.push(lineKind) });
  cat.handleCatClick();
  cat.handleCatClick();
  cat.handleCatClick();
  expect(spokenKinds).toEqual(['click', 'click', 'clickAnnoyed']);
  runFor(cat, 5);
  cat.handleCatClick();
  expect(spokenKinds.at(-1)).toBe('click');
});

test('after losing the mouse off screen, the first thing she says on her way back is an excuse', () => {
  const spokenKinds = [];
  const cat = createGrayCatBehaviour({ ...viewport, onSpeak: lineKind => spokenKinds.push(lineKind) });
  cat.startChase();
  runFor(cat, 20, () => {});
  expect(spokenKinds).toContain('missedMouse');
  const spokenAfterChase = spokenKinds.slice(spokenKinds.indexOf('chase') + 1);
  expect(spokenAfterChase[0]).toBe('missedMouse');
});
