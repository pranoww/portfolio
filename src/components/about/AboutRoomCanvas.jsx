// Full-screen 3D room for "A bit about me": numbered dots on six objects; clicking one flies the camera there and shows its story.
// Dots for objects outside the view stay pinned to the screen edge so every object can always be reached. three.js loads lazily.
"use client";
import { useEffect, useRef, useState } from "react";
import { aboutRoomIntro, roomObjectList } from "@/content/siteContent";

const flyDurationSeconds = 1.3;
const easeInOut = progress => (progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2);

export default function AboutRoomCanvas() {
  const roomRef = useRef(null);
  const canvasRef = useRef(null);
  const dotRefList = useRef([]);
  const flyToObjectRef = useRef(() => {});
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    let isUnmounted = false;
    let cleanUpScene = () => {};

    async function startScene() {
      const [THREE, { default: createVoxelBuilder }, { buildAboutRoom }, { closeUpPoseList, getOverviewPose, placeDotOnScreen }] = await Promise.all([
        import("three"), import("@/three/voxelBuilder"), import("@/three/aboutRoomModel"), import("@/three/aboutRoomCameraPoses"),
      ]);
      const { RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js");
      if (isUnmounted) return;

      const roomElement = roomRef.current;
      const canvas = canvasRef.current;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      } catch {
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 760 ? 1.5 : 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      const scene = new THREE.Scene();
      const environmentGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = environmentGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      const sunLight = new THREE.DirectionalLight("#fff3e2", 2.4);
      sunLight.position.set(-14, 34, 22);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.set(2048, 2048);
      Object.assign(sunLight.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 90 });
      sunLight.shadow.radius = 6;
      sunLight.shadow.bias = -0.0006;
      const fillLight = new THREE.DirectionalLight("#c9d0ff", 0.6);
      fillLight.position.set(20, 10, 10);
      const lampLight = new THREE.PointLight("#ffcf8a", 14, 14, 2);
      scene.add(sunLight, fillLight, lampLight);
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 300);

      const voxelBuilder = createVoxelBuilder({ rounded: true });
      const room = buildAboutRoom(voxelBuilder.addVoxel);
      scene.add(room.roomGroup);
      lampLight.position.copy(room.lampLightPosition);

      const brightenedMaterialByOriginal = new Map();
      function setObjectHighlight(objectIndex, isHighlighted) {
        if (objectIndex < 0) return;
        room.objectGroupList[objectIndex].traverse(part => {
          if (!part.isMesh || !part.material.isMeshStandardMaterial) return;
          part.userData.originalMaterial ??= part.material;
          const original = part.userData.originalMaterial;
          if (!brightenedMaterialByOriginal.has(original)) {
            brightenedMaterialByOriginal.set(original, Object.assign(original.clone(), { emissive: original.color.clone(), emissiveIntensity: 0.22 }));
          }
          part.material = isHighlighted ? brightenedMaterialByOriginal.get(original) : original;
        });
      }

      const cameraPosition = new THREE.Vector3();
      const cameraTarget = new THREE.Vector3();
      const flyStart = { position: new THREE.Vector3(), target: new THREE.Vector3() };
      const flyEnd = { position: new THREE.Vector3(), target: new THREE.Vector3() };
      let flyProgress = 1;
      let highlightedIndex = -1;

      flyToObjectRef.current = objectIndex => {
        setObjectHighlight(highlightedIndex, false);
        setObjectHighlight(objectIndex, true);
        highlightedIndex = objectIndex;
        const pose = objectIndex < 0 ? getOverviewPose(roomElement.clientWidth, roomElement.clientHeight) : closeUpPoseList[objectIndex];
        flyStart.position.copy(cameraPosition);
        flyStart.target.copy(cameraTarget);
        flyEnd.position.set(...pose.position);
        flyEnd.target.set(...pose.lookAt);
        flyProgress = 0;
      };

      function resizeScene() {
        const width = roomElement.clientWidth;
        const height = roomElement.clientHeight;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.fov = width < 520 ? 42 : 34;
        camera.updateProjectionMatrix();
        if (highlightedIndex < 0) {
          const overviewPose = getOverviewPose(width, height);
          cameraPosition.set(...overviewPose.position);
          cameraTarget.set(...overviewPose.lookAt);
          flyProgress = 1;
        }
      }
      const resizeObserver = new ResizeObserver(resizeScene);
      resizeObserver.observe(roomElement);
      resizeScene();

      const raycaster = new THREE.Raycaster();
      const pointerPosition = new THREE.Vector2();
      function findObjectUnderPointer(event) {
        const bounds = roomElement.getBoundingClientRect();
        pointerPosition.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
        raycaster.setFromCamera(pointerPosition, camera);
        const firstHit = raycaster.intersectObjects(room.objectGroupList, true)[0];
        if (!firstHit) return -1;
        for (let part = firstHit.object; part; part = part.parent) {
          const objectIndex = room.objectGroupList.indexOf(part);
          if (objectIndex >= 0) return objectIndex;
        }
        return -1;
      }
      function handleCanvasPointerMove(event) { canvas.style.cursor = findObjectUnderPointer(event) >= 0 ? "pointer" : ""; }
      function handleCanvasClick(event) { const objectIndex = findObjectUnderPointer(event); if (objectIndex >= 0) setSelectedIndex(objectIndex); }
      canvas.addEventListener("pointermove", handleCanvasPointerMove);
      canvas.addEventListener("click", handleCanvasClick);

      const projectedAnchor = new THREE.Vector3();
      let isVisible = false;
      let previousTime = performance.now();
      let animationFrameId = 0;

      function renderFrame(now) {
        const deltaSeconds = Math.min(0.05, Math.max(0, (now - previousTime) / 1000));
        previousTime = now;
        if (flyProgress < 1) {
          flyProgress = Math.min(1, flyProgress + deltaSeconds / flyDurationSeconds);
          const easedProgress = easeInOut(flyProgress);
          cameraPosition.lerpVectors(flyStart.position, flyEnd.position, easedProgress);
          cameraTarget.lerpVectors(flyStart.target, flyEnd.target, easedProgress);
        }
        camera.position.copy(cameraPosition);
        camera.lookAt(cameraTarget);
        lampLight.intensity = 14 + Math.sin(now / 500) * 0.6;
        renderer.render(scene, camera);

        room.objectAnchorList.forEach((anchor, objectIndex) => {
          const dot = dotRefList.current[objectIndex];
          if (!dot) return;
          const placement = placeDotOnScreen(projectedAnchor.copy(anchor).project(camera), roomElement.clientWidth, roomElement.clientHeight);
          dot.style.left = `${placement.left}px`;
          dot.style.top = `${placement.top}px`;
          dot.dataset.edge = String(!placement.isInView);
        });
        if (isVisible) animationFrameId = requestAnimationFrame(renderFrame);
      }

      const visibilityObserver = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        cancelAnimationFrame(animationFrameId);
        if (isVisible) { previousTime = performance.now(); animationFrameId = requestAnimationFrame(renderFrame); }
      });
      visibilityObserver.observe(roomElement);

      cleanUpScene = () => {
        cancelAnimationFrame(animationFrameId);
        resizeObserver.disconnect();
        visibilityObserver.disconnect();
        canvas.removeEventListener("pointermove", handleCanvasPointerMove);
        canvas.removeEventListener("click", handleCanvasClick);
        brightenedMaterialByOriginal.forEach(material => material.dispose());
        voxelBuilder.disposeAll();
        environmentGenerator.dispose();
        renderer.dispose();
      };
    }

    startScene();
    return () => { isUnmounted = true; cleanUpScene(); };
  }, []);

  useEffect(() => {
    flyToObjectRef.current(selectedIndex);
  }, [selectedIndex]);

  useEffect(() => {
    function returnToWholeRoomOnEscape(event) { if (event.key === "Escape") setSelectedIndex(-1); }
    window.addEventListener("keydown", returnToWholeRoomOnEscape);
    return () => window.removeEventListener("keydown", returnToWholeRoomOnEscape);
  }, []);

  const caption = selectedIndex < 0 ? aboutRoomIntro : roomObjectList[selectedIndex];
  const isZoomedIn = selectedIndex >= 0;

  return (
    <div ref={roomRef} className="relative h-[calc(100svh-var(--header-height))] min-h-[500px] overflow-hidden bg-[#eceef6] sm:min-h-[520px]">
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 block size-full" />

      <div className="pointer-events-none absolute left-4 top-6 z-[2] w-[calc(100%-32px)] sm:left-[max(28px,calc((100vw-1180px)/2+28px))] sm:top-9 sm:w-[380px]">
        <h2 className={`font-display text-[clamp(34px,4vw,56px)] font-semibold leading-[1.05] tracking-[-0.02em] transition-opacity duration-400 ${isZoomedIn ? "opacity-0" : ""}`}>A bit about me</h2>
        <div key={selectedIndex} aria-live="polite" className="pointer-events-auto mt-[18px] animate-[fade-slide-in_.45s_cubic-bezier(.22,1,.36,1)] rounded-[18px] bg-ink px-4 py-3.5 text-white sm:px-5 sm:py-[18px]">
          <p className="font-mono text-xs text-lime">{caption.label}</p>
          <h3 className="mt-1 font-display text-lg font-bold sm:text-[21px]">{caption.title}</h3>
          <p className="mt-1.5 text-sm text-[#c9cbd8] sm:text-[15px]">{caption.text}</p>
          {isZoomedIn && (
            <button type="button" onClick={() => setSelectedIndex(-1)} className="mt-3.5 min-h-9 rounded-full bg-white/10 px-3.5 py-2 font-mono text-xs text-white hover:bg-white/20">
              Back to the whole room
            </button>
          )}
        </div>
      </div>

      {roomObjectList.map((roomObject, objectIndex) => {
        const isSelected = objectIndex === selectedIndex;
        return (
          <button
            key={roomObject.label}
            ref={dotElement => { dotRefList.current[objectIndex] = dotElement; }}
            type="button"
            aria-label={`${roomObject.label}: ${roomObject.title}`}
            aria-pressed={isSelected}
            onClick={() => setSelectedIndex(isSelected ? -1 : objectIndex)}
            className={`absolute left-[-100px] top-[-100px] z-[1] -ml-[17px] -mt-[17px] size-[34px] rounded-full font-mono text-[13px] font-semibold text-white transition-[transform,background-color,opacity] duration-200 hover:scale-115
              ${isSelected ? "bg-ink shadow-[0_0_0_5px_rgba(193,255,0,.95)]" : "animate-[pulse-blue_2.4s_ease-out_infinite] bg-blue data-[edge=true]:animate-none data-[edge=true]:bg-ink data-[edge=true]:shadow-[0_0_0_3px_rgba(255,255,255,.9)]"}
              ${isZoomedIn && !isSelected ? "opacity-80" : ""}`}
          >
            {objectIndex + 1}
          </button>
        );
      })}
    </div>
  );
}
