// The gray cat that lives in the bottom-right corner of every page: draws her in 3D, follows the cursor with her head,
// shows her speech bubble and offers a "Pause cat" button. three.js loads only after the page is ready.
"use client";
import { useEffect, useRef, useState } from "react";
import { grayCatLines } from "@/content/siteContent";
import SimbhaChat from "@/components/cat/SimbhaChat";

const yawByFaceDirection = { front: -Math.PI / 2, right: 0, left: Math.PI };
const sectionIdList = ["work", "build", "experience", "about", "contact"];
const pickRandom = list => list[Math.floor(Math.random() * list.length)];
const clamp = (value, lowest, highest) => Math.min(highest, Math.max(lowest, value));
const shortestAngle = angle => Math.atan2(Math.sin(angle), Math.cos(angle));

export default function GrayCatOverlay() {
  const canvasRef = useRef(null);
  const bubbleRef = useRef(null);
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
        let lineList = grayCatLines[lineKind];
        if (lineKind === "chatter") {
          lineList = Math.random() < 0.08 ? grayCatLines.name : [...grayCatLines.idle, ...(grayCatLines[currentSection] || grayCatLines.hero)];
        }
        const freshLineList = lineList.filter(line => line !== lastSpokenLine);
        lastSpokenLine = pickRandom(freshLineList.length > 0 ? freshLineList : lineList);
        bubble.textContent = lastSpokenLine;
        bubbleSecondsLeft = lineKind === "chase" ? 1.6 : 2.8;
        bubble.style.opacity = "1";
        bubble.style.transform = "none";
      }

      const behaviour = createGrayCatBehaviour({
        viewportWidth, viewportHeight, isMobile: isMobile(), isCalm: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        catHeight: catHeight(), catUnit: voxelSize, onSpeak: speak,
      });
      behaviourRef.current = behaviour;
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
      function handlePageClick(event) {
        if (event.target.closest("a, button, input, textarea, label, select")) return;
        const { x, y } = behaviour.state;
        if (Math.abs(event.clientX - x) < catHeight() * 0.65 && event.clientY < y + 10 && event.clientY > y - catHeight() - 10) behaviour.handleCatClick();
      }
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("click", handlePageClick);

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
        if (state.isMoving) walkPhase += (deltaSeconds * (state.mode === "chase" ? 495 : 130)) / (3.2 * voxelSize);
        cat.legList.forEach(({ legGroup, stepPhase, isFrontLeg }) => {
          legGroup.rotation.z = isAirborne ? (isFrontLeg ? 0.7 : -0.7) : state.isMoving ? Math.sin(walkPhase + stepPhase) * 0.55 : legGroup.rotation.z * 0.85;
        });
        cat.bodyGroup.position.y = state.isMoving ? Math.abs(Math.sin(walkPhase)) * 0.35 : 0;
        cat.tail.rotation.x = Math.sin(elapsedSeconds * (state.isMoving ? 6 : 1.8)) * (state.isMoving ? 0.25 : 0.35);

        secondsUntilBlink -= deltaSeconds;
        if (secondsUntilBlink < 0) { blinkSecondsLeft = 0.14; secondsUntilBlink = 2.5 + Math.random() * 3; }
        blinkSecondsLeft -= deltaSeconds;
        cat.eyes.scale.y = blinkSecondsLeft > 0 ? 0.15 : 1;
        cat.bell.rotation.x = Math.sin(elapsedSeconds * 30) * 0.6 * state.hopAmount;
        const hopHeight = state.hopAmount > 0 ? Math.sin((1 - state.hopAmount) * Math.PI) * 46 : 0;

        const headX = state.x + Math.cos(catYaw) * 6.4 * voxelSize;
        const headY = state.y - 13 * voxelSize;
        const isWatchingMouse = state.mode === "chase" && mouse.isRunning;
        const lookX = isWatchingMouse ? mouse.x : hasMousePointer ? pointerX : headX + Math.sin(elapsedSeconds * 0.6) * 300;
        const lookY = isWatchingMouse ? mouse.y - 10 : hasMousePointer ? pointerY : headY + Math.sin(elapsedSeconds * 0.37) * 120;
        const wantedHeadYaw = clamp(shortestAngle(-Math.PI / 2 + clamp((lookX - headX) / 420, -1, 1) * 1.15 - catYaw), -1.35, 1.35);
        cat.head.rotation.y += (wantedHeadYaw - cat.head.rotation.y) * (1 - Math.exp(-deltaSeconds * 7));
        cat.head.rotation.z += (clamp((headY - lookY) / 360, -1, 1) * 0.45 - cat.head.rotation.z) * (1 - Math.exp(-deltaSeconds * 7));

        cat.facingGroup.rotation.y = catYaw;
        cat.catRoot.position.set(state.x, -(state.y - hopHeight), 0);
        cat.shadow.material.opacity = isAirborne ? 0.06 : 0.16;

        mouseModel.mouseRoot.visible = mouse.isRunning;
        if (mouse.isRunning) {
          mouseModel.mouseRoot.position.set(mouse.x, -(mouse.y + Math.sin(mouse.elapsed * 9) * 6), 0);
          mouseModel.mouseFacingGroup.rotation.y = mouse.direction > 0 ? 0 : Math.PI;
          mouseModel.mouseLegList.forEach((legGroup, legIndex) => { legGroup.rotation.z = Math.sin(mouse.elapsed * 40 + legIndex * Math.PI) * 0.8; });
          mouseModel.mouseTail.rotation.y = Math.sin(mouse.elapsed * 20) * 0.4;
        }

        if (bubbleSecondsLeft > 0) {
          bubbleSecondsLeft -= deltaSeconds;
          const bubbleWidth = bubble.offsetWidth;
          const bubbleHeight = bubble.offsetHeight;
          bubble.style.left = `${clamp(state.x - bubbleWidth / 2, 8, viewportWidth - bubbleWidth - 8)}px`;
          bubble.style.top = `${clamp(state.y - hopHeight - catHeight() - bubbleHeight - 12, 76, viewportHeight - bubbleHeight - 8)}px`;
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
      setTimeout(() => speak("hero"), document.documentElement.classList.contains("is-loading") ? 3200 : 900);

      cleanUpScene = () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("resize", resizeScene);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("click", handlePageClick);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        sectionObserver.disconnect();
        voxelBuilder.disposeAll();
        environmentGenerator.dispose();
        renderer.dispose();
      };
    }

    startScene();
    return () => { isUnmounted = true; cleanUpScene(); };
  }, []);

  function handlePauseClick() {
    const behaviour = behaviourRef.current;
    if (!behaviour) return;
    isPausedForChatRef.current = false;
    if (isPaused) behaviour.resume(); else behaviour.pause();
    setIsPaused(!isPaused);
  }

  // While the chat is open Simbha sits still in his corner under the panel; closing it only wakes him if the chat paused him
  function handleChatOpenChange(isChatOpen) {
    const behaviour = behaviourRef.current;
    if (!behaviour) return;
    if (isChatOpen && !isPaused) {
      behaviour.pause();
      isPausedForChatRef.current = true;
    } else if (!isChatOpen && isPausedForChatRef.current) {
      behaviour.resume();
      isPausedForChatRef.current = false;
    }
  }

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
      <SimbhaChat onOpenChange={handleChatOpenChange} />
    </>
  );
}
