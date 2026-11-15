// The gray cat that lives in the bottom-right corner of every page: draws her in 3D, follows the cursor with her head,
// shows her speech bubble and offers a "Pause cat" button. Clicking the cat opens Simbha's chat. After too many questions he naps
// (curled up, a bubble on his nose): clicking pops the bubble, and once the nap is over a click wakes him and opens a fresh chat.
// three.js loads only after the page is ready.
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { grayCatLines, simbhaChat } from "@/content/siteContent";
import { isSimbhaSleeping } from "@/components/cat/simbhaChatLimit";
import SimbhaChat from "@/components/cat/SimbhaChat";

const yawByFaceDirection = { front: -Math.PI / 2, right: 0, left: Math.PI, nap: -Math.PI / 2 + 0.42 };
// How long he stays grumpy and awake after a pop, how long a new bubble takes to grow, and the wake-up pause before the chat opens
const grumbleSeconds = 2.6;
const bubbleRegrowSeconds = 1.2;
const wakeUpChatDelayMs = 1100;
// How long after the page finishes loading the 3D cat appears if the visitor hasn't scrolled, tapped or typed yet
const catStartDelayMs = 3500;
const easeTowards = (current, target, deltaSeconds, speed) => current + (target - current) * (1 - Math.exp(-deltaSeconds * speed));
const sectionIdList = ["work", "build", "experience", "about", "contact"];
const pickRandom = list => list[Math.floor(Math.random() * list.length)];
const clamp = (value, lowest, highest) => Math.min(highest, Math.max(lowest, value));
const shortestAngle = angle => Math.atan2(Math.sin(angle), Math.cos(angle));

export default function GrayCatOverlay() {
  const canvasRef = useRef(null);
  const bubbleRef = useRef(null);
  const catButtonRef = useRef(null);
  const isChatOpenRef = useRef(false);
  // Lets code outside the 3D scene make the cat say a specific line in his bubble
  const sayRef = useRef(() => {});
  // Nap controls the 3D scene hands to the click handler: pop the bubble now, and how long he has been grumbling
  const napActionsRef = useRef({ popBubble: () => {} });
  const lastNapLineRef = useRef("");
  // The three floating z's shown while he naps
  const zElementsRef = useRef([]);
  const [chatFreshStart, setChatFreshStart] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasCatFailed, setHasCatFailed] = useState(false);
  const behaviourRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedForChatRef = useRef(false);

  useEffect(() => {
    let isUnmounted = false;
    let cleanUpScene = () => {};

    async function startScene() {
      const [THREE, { default: createVoxelBuilder }, { buildGrayCat, buildMouse }, { default: createGrayCatBehaviour }] = await Promise.all([
        import("three"), import("@/three/voxelBuilder"), import("@/three/grayCatModel"), import("@/three/grayCatBehaviour"),
      ]);
      const { RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js");
      if (isUnmounted) return;

      const canvas = canvasRef.current;
      const bubble = bubbleRef.current;
      const isMobile = () => window.innerWidth < 760;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      } catch {
        setHasCatFailed(true);
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile() ? 1.5 : 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;

      const scene = new THREE.Scene();
      const environmentGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = environmentGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      const keyLight = new THREE.DirectionalLight("#ffffff", 2.1);
      keyLight.position.set(400, 900, 1200);
      scene.add(keyLight);
      const camera = new THREE.OrthographicCamera(0, 1, 0, -1, 1, 8000);
      camera.position.set(0, 0, 4000);

      const voxelBuilder = createVoxelBuilder({ rounded: false });
      const cat = buildGrayCat(voxelBuilder.addVoxel);
      const mouseModel = buildMouse(voxelBuilder.addVoxel);
      scene.add(cat.catRoot, mouseModel.mouseRoot);

      let viewportWidth = window.innerWidth;
      let viewportHeight = window.innerHeight;
      let voxelSize = (isMobile() ? 118 : 200) / 17;
      const catHeight = () => 17 * voxelSize;

      let currentSection = "hero";
      let bubbleSecondsLeft = 0;
      let lastSpokenLine = "";
      function speak(lineKind) {
        // Napping means silence: no hints, no chatter, nothing that invites a chat
        if (behaviourRef.current?.state.mode === "nap") return;
        let lineList = grayCatLines[lineKind];
        if (lineKind === "chatter") {
          const roll = Math.random();
          lineList = roll < 0.08 ? grayCatLines.name : roll < 0.28 ? grayCatLines.chatHint : [...grayCatLines.idle, ...(grayCatLines[currentSection] || grayCatLines.hero)];
        }
        // While the chat is open the cat talks in the panel, not in the bubble
        if (isChatOpenRef.current) return;
        const freshLineList = lineList.filter(line => line !== lastSpokenLine);
        showLine(pickRandom(freshLineList.length > 0 ? freshLineList : lineList), lineKind === "chase" ? 1.6 : 2.8);
      }
      function showLine(line, seconds) {
        lastSpokenLine = line;
        bubble.textContent = line;
        bubbleSecondsLeft = seconds;
        bubble.style.opacity = "1";
        bubble.style.transform = "none";
      }
      sayRef.current = (line, { shouldHop = true } = {}) => {
        if (behaviourRef.current && shouldHop) behaviourRef.current.state.hopAmount = 1;
        showLine(line, 3.2);
      };

      const isCalm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const { napParts } = cat;
      let napGrumbleSecondsLeft = 0;
      let napLift = 0;
      let napBubbleAgeSeconds = 0;
      function popBubble() {
        const bubbleScale = napParts.bubble.scale.x;
        napParts.dropletList.forEach(droplet => {
          droplet.position.copy(napParts.nosePosition).add(new THREE.Vector3(bubbleScale * 0.55, 0, -bubbleScale * 0.85));
          droplet.material.opacity = 0.9;
          droplet.visible = true;
        });
        napParts.bubble.visible = false;
        napBubbleAgeSeconds = 0;
      }
      napActionsRef.current = {
        popBubble,
        grumble: () => { popBubble(); napGrumbleSecondsLeft = grumbleSeconds; },
      };

      const behaviour = createGrayCatBehaviour({
        viewportWidth, viewportHeight, isMobile: isMobile(), isCalm,
        catHeight: catHeight(), catUnit: voxelSize, onSpeak: speak, shouldNap: () => isSimbhaSleeping(),
      });
      behaviourRef.current = behaviour;
      // Still mid-nap from before a page refresh: he goes straight back to sleep
      if (isSimbhaSleeping()) behaviour.startNap();

      // The About room tells him when someone opens or leaves his bed: he dashes off to it, then comes back
      function handleBedView(event) {
        if (isChatOpenRef.current) return;
        if (event.detail?.isLookingAtBed) behaviour.goToBed(); else behaviour.leaveBed();
      }
      window.addEventListener("simbha:bed", handleBedView);
      if (new URLSearchParams(window.location.search).has("chase")) behaviour.startChase();

      function resizeScene() {
        viewportWidth = window.innerWidth;
        viewportHeight = window.innerHeight;
        voxelSize = (isMobile() ? 118 : 200) / 17;
        renderer.setSize(viewportWidth, viewportHeight, false);
        Object.assign(camera, { left: 0, right: viewportWidth, top: 0, bottom: -viewportHeight });
        camera.updateProjectionMatrix();
        cat.catRoot.scale.setScalar(voxelSize);
        mouseModel.mouseRoot.scale.setScalar(voxelSize * 0.85);
        behaviour.resize(viewportWidth, viewportHeight);
      }
      resizeScene();
      window.addEventListener("resize", resizeScene);

      const sectionObserver = new IntersectionObserver(entryList => entryList.forEach(entry => {
        if (entry.isIntersecting) currentSection = entry.target.id;
      }), { rootMargin: "-45% 0px -45% 0px" });
      sectionIdList.forEach(sectionId => { const section = document.getElementById(sectionId); if (section) sectionObserver.observe(section); });

      let pointerX = viewportWidth / 2;
      let pointerY = viewportHeight / 2;
      let hasMousePointer = false;
      function handlePointerMove(event) {
        pointerX = event.clientX;
        pointerY = event.clientY;
        hasMousePointer = event.pointerType === "mouse";
      }
      window.addEventListener("pointermove", handlePointerMove, { passive: true });

      let catYaw = yawByFaceDirection.front;
      let walkPhase = 0;
      let blinkSecondsLeft = 0;
      let secondsUntilBlink = 2.5;
      let previousTime = performance.now();
      let animationFrameId = 0;

      function renderFrame(now) {
        const deltaSeconds = Math.min(0.05, Math.max(0, (now - previousTime) / 1000));
        previousTime = now;
        const elapsedSeconds = now / 1000;
        behaviour.update(deltaSeconds);
        const { state, mouse } = behaviour;

        catYaw += shortestAngle(yawByFaceDirection[state.faceDirection] - catYaw) * (1 - Math.exp(-deltaSeconds * 8));
        const isAirborne = state.mode === "jump";
        const isNapping = state.mode === "nap";
        napGrumbleSecondsLeft = isNapping ? Math.max(0, napGrumbleSecondsLeft - deltaSeconds) : 0;
        const isGrumbling = napGrumbleSecondsLeft > 0;
        const breath = (Math.sin(elapsedSeconds * 1.7) + 1) / 2;

        if (state.isMoving) walkPhase += (deltaSeconds * (state.mode === "chase" ? 495 : 130)) / (3.2 * voxelSize);
        cat.legList.forEach(({ legGroup, stepPhase, isFrontLeg }) => {
          legGroup.visible = !isNapping;
          legGroup.rotation.z = isAirborne ? (isFrontLeg ? 0.7 : -0.7) : state.isMoving ? Math.sin(walkPhase + stepPhase) * 0.55 : legGroup.rotation.z * 0.85;
        });
        // Napping: he lies down as a loaf (paws tucked, tail wrapped) and his body rises and falls as he breathes
        cat.tail.visible = !isNapping;
        napParts.loafParts.visible = isNapping;
        const bodyTargetY = isNapping ? -4.2 : state.isMoving ? Math.abs(Math.sin(walkPhase)) * 0.35 : 0;
        cat.bodyGroup.position.y = easeTowards(cat.bodyGroup.position.y, bodyTargetY, deltaSeconds, state.isMoving ? 30 : 7);
        cat.bodyGroup.scale.y = isNapping && !isCalm && !isGrumbling ? 1 + breath * 0.025 : 1;
        cat.tail.rotation.x = Math.sin(elapsedSeconds * (state.isMoving ? 6 : 1.8)) * (state.isMoving ? 0.25 : 0.35);

        secondsUntilBlink -= deltaSeconds;
        if (secondsUntilBlink < 0) { blinkSecondsLeft = 0.14; secondsUntilBlink = 2.5 + Math.random() * 3; }
        blinkSecondsLeft -= deltaSeconds;
        cat.eyes.visible = !isNapping || isGrumbling;
        cat.eyes.scale.y = isGrumbling ? 0.45 : blinkSecondsLeft > 0 ? 0.15 : 1;
        napParts.lids.visible = isNapping && !isGrumbling;
        cat.bell.rotation.x = Math.sin(elapsedSeconds * 30) * 0.6 * state.hopAmount;
        const hopHeight = state.hopAmount > 0 ? Math.sin((1 - state.hopAmount) * Math.PI) * 46 : 0;

        if (isNapping) {
          // Head resting low and tilted while asleep; lifted with a grumpy look right after his bubble pops
          cat.head.position.x = easeTowards(cat.head.position.x, 6.4, deltaSeconds, 6);
          cat.head.position.y = easeTowards(cat.head.position.y, isGrumbling ? 9.3 : 7.4, deltaSeconds, 6);
          cat.head.rotation.z = easeTowards(cat.head.rotation.z, isGrumbling ? 0.08 : -0.1, deltaSeconds, 6);
          cat.head.rotation.y = easeTowards(cat.head.rotation.y, isGrumbling ? -0.25 : 0, deltaSeconds, 6);
          cat.head.rotation.x = easeTowards(cat.head.rotation.x, isGrumbling ? 0 : 0.12, deltaSeconds, 6);
        } else {
          cat.head.position.x = easeTowards(cat.head.position.x, 6.4, deltaSeconds, 6);
          cat.head.position.y = easeTowards(cat.head.position.y, 9.2, deltaSeconds, 6);
          cat.head.rotation.x = easeTowards(cat.head.rotation.x, 0, deltaSeconds, 6);
          const headX = state.x + Math.cos(catYaw) * 6.4 * voxelSize;
          const headY = state.y - 13 * voxelSize;
          const isWatchingMouse = state.mode === "chase" && mouse.isRunning;
          const lookX = isWatchingMouse ? mouse.x : hasMousePointer ? pointerX : headX + Math.sin(elapsedSeconds * 0.6) * 300;
          const lookY = isWatchingMouse ? mouse.y - 10 : hasMousePointer ? pointerY : headY + Math.sin(elapsedSeconds * 0.37) * 120;
          const wantedHeadYaw = clamp(shortestAngle(-Math.PI / 2 + clamp((lookX - headX) / 420, -1, 1) * 1.15 - catYaw), -1.35, 1.35);
          cat.head.rotation.y += (wantedHeadYaw - cat.head.rotation.y) * (1 - Math.exp(-deltaSeconds * 7));
          cat.head.rotation.z += (clamp((headY - lookY) / 360, -1, 1) * 0.45 - cat.head.rotation.z) * (1 - Math.exp(-deltaSeconds * 7));
        }

        // The snot bubble grows on each breath out; after a pop it starts again from tiny
        if (isNapping && !isGrumbling) {
          napBubbleAgeSeconds += deltaSeconds;
          const regrow = Math.min(1, napBubbleAgeSeconds / bubbleRegrowSeconds);
          const bubbleSize = (0.8 + (isCalm ? 1.1 : breath * 2.2)) * regrow;
          napParts.bubble.visible = bubbleSize > 0.05;
          napParts.bubble.scale.setScalar(Math.max(0.01, bubbleSize));
          napParts.bubble.position.copy(napParts.nosePosition).add(new THREE.Vector3(bubbleSize * 0.55, -bubbleSize * 0.2, -bubbleSize * 0.85));
        } else {
          napParts.bubble.visible = false;
        }
        napParts.dropletList.forEach(droplet => {
          if (!droplet.visible) return;
          droplet.position.addScaledVector(droplet.userData.direction, deltaSeconds * 9);
          droplet.material.opacity = Math.max(0, droplet.material.opacity - deltaSeconds * 1.8);
          if (droplet.material.opacity <= 0) droplet.visible = false;
        });

        // z's drifting up from his head while he sleeps
        zElementsRef.current.forEach((zElement, zIndex) => {
          if (!zElement) return;
          const phase = (elapsedSeconds * 0.45 + zIndex / 3) % 1;
          const isShown = isNapping && !isGrumbling;
          zElement.style.opacity = !isShown ? "0" : isCalm ? "0.6" : String(Math.sin(phase * Math.PI) * 0.8);
          const zX = Math.min(viewportWidth - 40, state.x - catHeight() * 0.05 + (isCalm ? 0 : phase * 22) + zIndex * 7);
          const zY = state.y - catHeight() * 0.62 - (isCalm ? 0 : phase * 50) - zIndex * 14;
          zElement.style.transform = `translate(${zX}px, ${zY}px) scale(${0.8 + zIndex * 0.25})`;
        });

        cat.facingGroup.rotation.y = catYaw;
        napLift = easeTowards(napLift, isNapping ? 2.6 * voxelSize : 0, deltaSeconds, 6);
        cat.catRoot.position.set(state.x, -(state.y - hopHeight - napLift), 0);
        cat.shadow.material.opacity = isAirborne ? 0.06 : 0.16;

        mouseModel.mouseRoot.visible = mouse.isRunning;
        if (mouse.isRunning) {
          mouseModel.mouseRoot.position.set(mouse.x, -(mouse.y + Math.sin(mouse.elapsed * 9) * 6), 0);
          mouseModel.mouseFacingGroup.rotation.y = mouse.direction > 0 ? 0 : Math.PI;
          mouseModel.mouseLegList.forEach((legGroup, legIndex) => { legGroup.rotation.z = Math.sin(mouse.elapsed * 40 + legIndex * Math.PI) * 0.8; });
          mouseModel.mouseTail.rotation.y = Math.sin(mouse.elapsed * 20) * 0.4;
        }

        // The invisible chat button sits exactly over the cat wherever she goes
        const catButton = catButtonRef.current;
        if (catButton) {
          const buttonWidth = catHeight() * 1.1;
          catButton.style.width = `${buttonWidth}px`;
          catButton.style.height = `${catHeight()}px`;
          catButton.style.transform = `translate(${state.x - buttonWidth / 2}px, ${state.y - hopHeight - catHeight()}px)`;
        }

        if (bubbleSecondsLeft > 0) {
          bubbleSecondsLeft -= deltaSeconds;
          const bubbleWidth = bubble.offsetWidth;
          const bubbleHeight = bubble.offsetHeight;
          bubble.style.left = `${clamp(state.x - bubbleWidth / 2, 8, viewportWidth - bubbleWidth - 8)}px`;
          const visibleCatHeight = state.mode === "nap" ? catHeight() * 0.65 : catHeight();
          bubble.style.top = `${clamp(state.y - hopHeight - visibleCatHeight - bubbleHeight - 12, 76, viewportHeight - bubbleHeight - 8)}px`;
          if (bubbleSecondsLeft <= 0) { bubble.style.opacity = "0"; bubble.style.transform = "translateY(6px)"; }
        }

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(renderFrame);
      }

      function handleVisibilityChange() {
        cancelAnimationFrame(animationFrameId);
        if (!document.hidden) { previousTime = performance.now(); animationFrameId = requestAnimationFrame(renderFrame); }
      }
      document.addEventListener("visibilitychange", handleVisibilityChange);
      animationFrameId = requestAnimationFrame(renderFrame);
      const firstLineDelay = document.documentElement.classList.contains("is-loading") ? 3200 : 900;
      setTimeout(() => speak("hero"), firstLineDelay);
      setTimeout(() => speak("chatHint"), firstLineDelay + 7000);

      cleanUpScene = () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("resize", resizeScene);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("simbha:bed", handleBedView);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        sectionObserver.disconnect();
        voxelBuilder.disposeAll();
        napParts.dispose();
        environmentGenerator.dispose();
        renderer.dispose();
      };
    }

    // three.js is the heaviest thing on the page, so the cat waits until the page has settled: the visitor's first
    // scroll, tap or key press, or a few quiet seconds after loading, whichever comes first
    let hasStarted = false;
    let idleTimer = 0;
    const wakeEventList = ["pointerdown", "keydown", "wheel", "touchstart", "scroll"];
    function startOnce() {
      if (hasStarted || isUnmounted) return;
      hasStarted = true;
      clearTimeout(idleTimer);
      wakeEventList.forEach(eventName => window.removeEventListener(eventName, startOnce));
      startScene();
    }
    function startWhenQuiet() {
      idleTimer = setTimeout(() => (window.requestIdleCallback ? window.requestIdleCallback(startOnce, { timeout: 1500 }) : startOnce()), catStartDelayMs);
    }
    wakeEventList.forEach(eventName => window.addEventListener(eventName, startOnce, { once: true, passive: true }));
    if (document.readyState === "complete") startWhenQuiet(); else window.addEventListener("load", startWhenQuiet, { once: true });

    return () => {
      isUnmounted = true;
      clearTimeout(idleTimer);
      window.removeEventListener("load", startWhenQuiet);
      wakeEventList.forEach(eventName => window.removeEventListener(eventName, startOnce));
      cleanUpScene();
    };
  }, []);

  function handlePauseClick() {
    const behaviour = behaviourRef.current;
    if (!behaviour) return;
    isPausedForChatRef.current = false;
    if (isPaused) behaviour.resume(); else behaviour.pause();
    setIsPaused(!isPaused);
  }

  function pickNapLine(lineList) {
    const freshLineList = lineList.filter(line => line !== lastNapLineRef.current);
    lastNapLineRef.current = pickRandom(freshLineList.length > 0 ? freshLineList : lineList);
    return lastNapLineRef.current;
  }

  // Clicking the cat: pops his bubble mid-nap, wakes him once the nap is over, otherwise opens or closes the chat
  function handleCatClick() {
    if (isChatOpen) return closeChat();
    const behaviour = behaviourRef.current;
    if (behaviour?.state.mode === "nap") {
      if (isSimbhaSleeping()) {
        napActionsRef.current.grumble();
        sayRef.current(pickNapLine(simbhaChat.napGrumbleLineList), { shouldHop: false });
        return;
      }
      const wakeUpLine = pickNapLine(simbhaChat.wakeUpLineList);
      napActionsRef.current.popBubble();
      behaviour.wakeUp();
      sayRef.current(wakeUpLine);
      setChatFreshStart({ line: wakeUpLine, id: Date.now() });
      setTimeout(() => { if (!isChatOpenRef.current) openChat(); }, wakeUpChatDelayMs);
      return;
    }
    openChat();
  }

  // While the chat is open Simbha sits still in his corner under the panel; closing it only wakes him if the chat paused him
  function openChat() {
    // Mid-nap but up chasing a mouse: the chat stays shut and he brushes the visitor off in his bubble
    if (isSimbhaSleeping()) {
      sayRef.current(simbhaChat.stillSleepingLine);
      return;
    }
    const behaviour = behaviourRef.current;
    if (behaviour) {
      behaviour.state.hopAmount = 1;
      if (!isPaused) {
        behaviour.pause();
        isPausedForChatRef.current = true;
      }
    }
    if (bubbleRef.current) bubbleRef.current.style.opacity = "0";
    isChatOpenRef.current = true;
    setIsChatOpen(true);
  }

  const closeChat = useCallback(() => {
    const behaviour = behaviourRef.current;
    if (behaviour && isPausedForChatRef.current) {
      behaviour.resume();
      isPausedForChatRef.current = false;
    }
    isChatOpenRef.current = false;
    setIsChatOpen(false);
    // The chat closed because he got tired of questions: he curls up for his nap right away
    if (behaviour && isSimbhaSleeping()) behaviour.startNap();
    requestAnimationFrame(() => catButtonRef.current?.focus());
  }, []);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[15] h-screen w-screen" />
      <div
        ref={bubbleRef}
        aria-live="polite"
        className="pointer-events-none fixed left-0 top-0 z-[16] max-w-[230px] translate-y-1.5 rounded-[14px] bg-ink px-[13px] py-[9px] font-mono text-[13px] leading-snug text-white opacity-0 transition-[opacity,transform] duration-200"
      />
      <button
        type="button"
        onClick={handlePauseClick}
        aria-pressed={isPaused}
        className="fixed bottom-4 left-4 z-[17] min-h-10 rounded-full border border-line bg-white/90 px-3.5 py-2 font-mono text-xs text-ink"
      >
        {isPaused ? "Let the cat roam" : "Pause cat"}
      </button>
      {hasCatFailed ? (
        <button
          ref={catButtonRef}
          type="button"
          onClick={() => (isChatOpen ? closeChat() : openChat())}
          aria-expanded={isChatOpen}
          aria-controls="simbha-chat-panel"
          className="fixed bottom-4 right-4 z-[17] min-h-11 rounded-full bg-blue px-4 font-mono text-[13px] text-white hover:bg-blue-d"
        >
          {simbhaChat.fallbackButtonLabel}
        </button>
      ) : (
        <button
          ref={catButtonRef}
          type="button"
          onClick={handleCatClick}
          aria-label={simbhaChat.catButtonLabel}
          aria-expanded={isChatOpen}
          aria-controls="simbha-chat-panel"
          className="fixed left-0 top-0 z-[16] cursor-pointer rounded-[24px] bg-transparent focus-visible:outline-blue"
        />
      )}
      {["z", "z", "Z"].map((zLetter, zIndex) => (
        <span key={zIndex} ref={element => { zElementsRef.current[zIndex] = element; }} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[16] font-display text-xl font-extrabold text-ink opacity-0 [text-shadow:0_0_3px_#fff,0_0_6px_#fff]">
          {zLetter}
        </span>
      ))}
      <SimbhaChat isOpen={isChatOpen} onClose={closeChat} freshStart={chatFreshStart} />
    </>
  );
}
