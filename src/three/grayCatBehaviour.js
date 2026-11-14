// The gray cat's behaviour as plain data and rules (no drawing): where she is, what she is doing, and when she acts.
// She sits in the bottom-right corner and does one thing every 45-55 seconds: a stroll, a short trip off-screen, or a mouse chase.

const homeOffsetDesktop = 120;
const homeOffsetMobile = 64;
const bottomEdgeGap = 14;

export default function createGrayCatBehaviour({ viewportWidth, viewportHeight, isMobile, isCalm, catHeight, catUnit, onSpeak = () => {}, random = Math.random }) {
  let width = viewportWidth;
  let height = viewportHeight;
  const calmFactor = isCalm ? 0.7 : 1;
  const walkSpeed = (isMobile ? 85 : 130) * calmFactor;
  const runSpeed = (isMobile ? 300 : 430) * calmFactor;
  const mouseSpeed = (isMobile ? 380 : 560) * calmFactor;

  const homeX = () => width - (isMobile ? homeOffsetMobile : homeOffsetDesktop);
  const bottomY = () => height - bottomEdgeGap;
  const isAtHome = () => Math.abs(state.x - homeX()) < 24;
  const pickBetween = (lowest, highest) => lowest + random() * (highest - lowest);
  const nextActivityDelay = () => pickBetween(45, 55);

  const state = {
    mode: "sit", x: 0, y: 0, timer: Infinity,
    targetX: 0, afterWalk: null, jump: null, peekSide: null,
    faceDirection: "front", isMoving: false, isRunningAfterMouse: false, hopAmount: 0, hasMissedMouse: false,
  };
  const mouse = { isRunning: false, x: 0, y: 0, direction: 1, elapsed: 0 };
  let activityTimer = nextActivityDelay();
  let chatterTimer = pickBetween(20, 35);
  let isPaused = false;
  let clickStreak = 0;
  let secondsSinceLastClick = Infinity;

  // After losing the mouse, the first thing she says on the way back is an excuse
  function speak(lineKind) {
    if (state.hasMissedMouse && lineKind !== "click" && lineKind !== "clickAnnoyed") {
      state.hasMissedMouse = false;
      onSpeak("missedMouse");
      return;
    }
    onSpeak(lineKind);
  }

  state.x = homeX();
  state.y = bottomY();

  function walkTo(targetX, afterWalk) {
    Object.assign(state, { mode: "walk", targetX, afterWalk, peekSide: null });
  }

  function sit(seconds, shouldTalk = random() < 0.35) {
    state.mode = "sit";
    state.timer = seconds ?? (isAtHome() ? Infinity : pickBetween(2, 4));
    state.peekSide = null;
    if (shouldTalk) speak("chatter");
  }

  function goHome() {
    walkTo(homeX(), () => sit(undefined, state.hasMissedMouse || undefined));
  }

  function goAway() {
    if (random() < 0.5) speak("exit");
    walkTo(width + 14 * catUnit, () => { state.mode = "away"; state.timer = pickBetween(2, 6); });
  }

  function comeBack() {
    const entranceRoll = random();
    if (entranceRoll < 0.35) {
      state.x = width + 16 * catUnit;
      state.y = bottomY();
      walkTo(width + 5.5 * catUnit, () => peek("right"));
    } else if (entranceRoll < 0.55) {
      Object.assign(state, { mode: "rise", x: homeX(), y: height + catHeight * 1.1 });
    } else if (entranceRoll < 0.8) {
      state.jump = { fromX: homeX() + 110, fromY: height + catHeight, toX: homeX(), toY: bottomY(), progress: 0, arcHeight: 110, duration: 1 };
      Object.assign(state, { mode: "jump", x: state.jump.fromX, y: state.jump.fromY });
    } else {
      state.x = width + 14 * catUnit;
      state.y = bottomY();
      goHome();
    }
  }

  function peek(side) {
    Object.assign(state, { mode: "peek", timer: pickBetween(2.4, 4), peekSide: side });
    speak("peek");
  }

  function finishPeek() {
    if (state.peekSide === "bottom") {
      if (random() < 0.75) {
        state.jump = { fromX: state.x, fromY: state.y, toX: state.x, toY: bottomY(), progress: 0, arcHeight: 70, duration: 0.7 };
        state.mode = "jump";
      } else {
        state.mode = "sink";
      }
    } else if (random() < 0.8) {
      goHome();
    } else {
      walkTo(width + 16 * catUnit, () => { state.mode = "away"; state.timer = pickBetween(2, 6); });
    }
  }

  function startStroll() {
    const strollX = Math.max(80, homeX() - (140 + random() * width * 0.3));
    walkTo(strollX, () => sit(pickBetween(2, 4)));
  }

  function startChase() {
    const direction = random() < 0.5 ? 1 : -1;
    Object.assign(mouse, { isRunning: true, direction, y: bottomY(), x: direction > 0 ? -40 : width + 40, elapsed: 0 });
    const isOnScreen = state.x > -4 * catUnit && state.x < width + 4 * catUnit && state.mode !== "away";
    if (!isOnScreen) {
      state.x = mouse.x - direction * (16 * catUnit + 160);
      state.y = bottomY();
    }
    Object.assign(state, { mode: "chase", isRunningAfterMouse: !isOnScreen, afterWalk: null, jump: null, peekSide: null });
  }

  function startRandomActivity() {
    const activityList = ["stroll", "stroll", "away", "chase", "chase"];
    const chosenActivity = activityList[Math.floor(random() * activityList.length)];
    if (chosenActivity === "chase") startChase();
    else if (chosenActivity === "away") goAway();
    else startStroll();
  }

  function updateWalk(deltaSeconds) {
    const distanceLeft = state.targetX - state.x;
    const stepDistance = walkSpeed * deltaSeconds;
    state.faceDirection = distanceLeft > 0 ? "right" : "left";
    if (Math.abs(distanceLeft) <= stepDistance) {
      state.x = state.targetX;
      const afterWalk = state.afterWalk;
      state.afterWalk = null;
      if (afterWalk) afterWalk(); else sit();
      return;
    }
    state.x += Math.sign(distanceLeft) * stepDistance;
    state.isMoving = true;
  }

  function updateChase(deltaSeconds) {
    const direction = mouse.direction;
    const mouseAheadDistance = mouse.isRunning ? (mouse.x - state.x) * direction : Infinity;
    if (!state.isRunningAfterMouse && mouseAheadDistance < 7 * catUnit + 40) {
      state.faceDirection = mouse.isRunning && Math.abs(mouse.x - state.x) < 7 * catUnit ? "front" : direction > 0 ? "left" : "right";
    } else {
      if (!state.isRunningAfterMouse) { state.isRunningAfterMouse = true; speak("chase"); }
      const nextX = state.x + direction * runSpeed * deltaSeconds;
      state.x = mouse.isRunning && (mouse.x - nextX) * direction < 0 ? mouse.x - direction : nextX;
      state.isMoving = true;
      state.faceDirection = direction > 0 ? "right" : "left";
    }
    const hasLeftScreen = direction > 0 ? state.x > width + 16 * catUnit : state.x < -16 * catUnit;
    if (hasLeftScreen) Object.assign(state, { mode: "away", isRunningAfterMouse: false, hasMissedMouse: true, timer: pickBetween(3, 6) });
  }

  function updateJump(deltaSeconds) {
    const jump = state.jump;
    jump.progress = Math.min(1, jump.progress + deltaSeconds / jump.duration);
    state.x = jump.fromX + (jump.toX - jump.fromX) * jump.progress;
    state.y = jump.fromY + (jump.toY - jump.fromY) * jump.progress - Math.sin(jump.progress * Math.PI) * jump.arcHeight;
    state.faceDirection = jump.toX === jump.fromX ? "front" : jump.toX > jump.fromX ? "right" : "left";
    if (jump.progress >= 1) {
      state.jump = null;
      state.y = bottomY();
      sit(isAtHome() ? undefined : pickBetween(3, 6), false);
      speak("jump");
    }
  }

  function updateMouse(deltaSeconds) {
    if (!mouse.isRunning) return;
    mouse.elapsed += deltaSeconds;
    mouse.x += mouse.direction * mouseSpeed * deltaSeconds;
    if (mouse.x < -80 || mouse.x > width + 80) mouse.isRunning = false;
  }

  function update(deltaSeconds) {
    state.isMoving = false;
    secondsSinceLastClick += deltaSeconds;
    if (state.mode === "walk") updateWalk(deltaSeconds);
    else if (state.mode === "chase") updateChase(deltaSeconds);
    else if (state.mode === "sit") { state.timer -= deltaSeconds; if (state.timer <= 0) { if (isAtHome()) sit(); else goHome(); } }
    else if (state.mode === "away") { state.timer -= deltaSeconds; if (state.timer <= 0) comeBack(); }
    else if (state.mode === "peek") { state.timer -= deltaSeconds; if (state.timer <= 0) finishPeek(); }
    else if (state.mode === "rise") {
      const riseTargetY = height + catHeight * 0.42;
      state.y += (riseTargetY - state.y) * (1 - Math.exp(-deltaSeconds * 7));
      if (Math.abs(state.y - riseTargetY) < 2) peek("bottom");
    }
    else if (state.mode === "sink") { state.y += 260 * deltaSeconds; if (state.y > height + catHeight * 1.2) { state.mode = "away"; state.timer = pickBetween(1.5, 4.5); } }
    else if (state.mode === "jump") updateJump(deltaSeconds);

    if (state.mode === "sit" || state.mode === "still") state.faceDirection = "front";
    if (state.mode === "peek") state.faceDirection = state.peekSide === "right" ? "left" : "front";
    if (state.hopAmount > 0) state.hopAmount = Math.max(0, state.hopAmount - deltaSeconds * 2);

    if (!isPaused && state.mode === "sit" && isAtHome()) {
      activityTimer -= deltaSeconds;
      if (activityTimer <= 0) { activityTimer = nextActivityDelay(); startRandomActivity(); }
      chatterTimer -= deltaSeconds;
      if (chatterTimer <= 0) { chatterTimer = pickBetween(25, 45); if (random() < 0.6) speak("chatter"); }
    }
    updateMouse(deltaSeconds);
  }

  function handleCatClick() {
    state.hopAmount = 1;
    clickStreak = secondsSinceLastClick < 4 ? clickStreak + 1 : 1;
    secondsSinceLastClick = 0;
    speak(clickStreak >= 3 ? "clickAnnoyed" : "click");
  }

  function pause() {
    isPaused = true;
    mouse.isRunning = false;
    Object.assign(state, { mode: "still", x: homeX(), y: bottomY(), jump: null, afterWalk: null, isRunningAfterMouse: false });
  }

  function resume() {
    isPaused = false;
    sit(1.5, false);
  }

  function resize(newWidth, newHeight) {
    width = newWidth;
    height = newHeight;
    if (["sit", "walk", "chase", "still", "away"].includes(state.mode)) state.y = bottomY();
    if (state.mode === "sit" || state.mode === "still") state.x = homeX();
  }

  return { state, mouse, update, startChase, handleCatClick, pause, resume, resize };
}
