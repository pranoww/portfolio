// Send animation over the page: the form crumples into a ball that rides a paper plane away, or smooths back into the form if sending fails
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { drawFormSnapshotTexture, drawRoundedCornerMask } from "@/three/formSnapshotTexture";
import { buildCrumpledPaperSheet } from "@/three/crumpledPaperSheet";
import { buildPaperPlane } from "@/three/paperPlaneModel";
import { createWaveTrail } from "@/three/waveTrail";
import { cubicBezierHeading, cubicBezierPoint, easeInOutCubic, easeInQuad, easeOutCubic, progressBetween } from "@/three/paperFlightMath";

const timeline = { crumpleEnd: 0.95, planeArriveStart: 0.3, tossStart: 1, catchTime: 1.55, dipEnd: 1.8, exitDuration: 1.25, showSuccessAfterExitStart: 1.05, returnDuration: 0.85, trailFade: 1.6 };
const bankAngle = 0.62;

function createFlightLayer() {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:60";
  document.body.append(canvas);
  return canvas;
}

// Resolves when the result can be shown: after the plane leaves on success, or once the form is smoothed back on failure
export function playPaperPlaneSend(formElement, isSentPromise) {
  return new Promise(resolveWhenResultCanShow => {
    const trailCanvas = createFlightLayer();
    const paperCanvas = createFlightLayer();
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: paperCanvas, alpha: true, antialias: true });
    } catch {
      trailCanvas.remove();
      paperCanvas.remove();
      resolveWhenResultCanShow();
      return;
    }

    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const trailContext = trailCanvas.getContext("2d");
    const waveTrail = createWaveTrail(trailContext, timeline.trailFade);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 1, 20000);
    renderer.setPixelRatio(pixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const environmentGenerator = new THREE.PMREMGenerator(renderer);
    const environmentTexture = environmentGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environmentTexture;
    const keyLight = new THREE.DirectionalLight(0xfff6ea, 2.2);
    keyLight.position.set(-400, 700, 900);
    scene.add(keyLight);

    // One world unit is one CSS pixel on the z = 0 plane, origin at the viewport centre, y pointing up
    function resizeFlightLayer() {
      viewport.width = window.innerWidth;
      viewport.height = window.innerHeight;
      trailCanvas.width = viewport.width * pixelRatio;
      trailCanvas.height = viewport.height * pixelRatio;
      trailContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      renderer.setSize(viewport.width, viewport.height, false);
      camera.aspect = viewport.width / viewport.height;
      camera.position.set(0, 0, viewport.height / 2 / Math.tan(THREE.MathUtils.degToRad(15)));
      camera.updateProjectionMatrix();
    }
    resizeFlightLayer();
    window.addEventListener("resize", resizeFlightLayer);

    const toWorld = (screenX, screenY) => new THREE.Vector2(screenX - viewport.width / 2, viewport.height / 2 - screenY);
    const formCentreInWorld = () => {
      const rectangle = formElement.getBoundingClientRect();
      return toWorld(rectangle.left + rectangle.width / 2, rectangle.top + rectangle.height / 2);
    };
    const toScreen = worldPosition => {
      const projected = worldPosition.clone().project(camera);
      return { x: (projected.x + 1) / 2 * viewport.width, y: (1 - projected.y) / 2 * viewport.height };
    };

    const { texture, formRectangle } = drawFormSnapshotTexture(formElement, pixelRatio * 1.5, renderer.capabilities.getMaxAnisotropy());
    const sheet = buildCrumpledPaperSheet(formRectangle.width, formRectangle.height, texture, drawRoundedCornerMask(formRectangle.width, formRectangle.height));
    const formCentre = formCentreInWorld();
    const ballRestingPoint = formCentre.clone().add(new THREE.Vector2(0, 24));
    sheet.paperGroup.position.set(formCentre.x, formCentre.y, 0);
    scene.add(sheet.paperGroup);

    const planeLength = THREE.MathUtils.clamp(formRectangle.width * 0.36, 120, 190);
    const plane = buildPaperPlane(planeLength);
    const seatOnPlane = new THREE.Vector3(planeLength * 0.36, planeLength * 0.02 + sheet.ballRadius * 0.8, 0);
    plane.bankGroup.rotation.x = bankAngle;
    scene.add(plane.headingGroup);

    const planeCatchPoint = ballRestingPoint.clone().add(new THREE.Vector2(-planeLength * 0.36, -96));
    const arrivalPath = [
      new THREE.Vector2(-viewport.width / 2 - planeLength * 1.6, planeCatchPoint.y - 150),
      new THREE.Vector2(-viewport.width * 0.2, planeCatchPoint.y - 170),
      planeCatchPoint.clone().add(new THREE.Vector2(-220, -20)),
      planeCatchPoint,
    ];

    let sendOutcome = null;
    isSentPromise.then(isSent => { sendOutcome = { isSent }; });
    let outcomeStart = null;
    let exitPath = null;
    let isBallSeated = false;
    let isBallReturned = false;
    let hasResolved = false;
    let isFormHidden = false;
    const ballTossStart = new THREE.Vector3();
    const ballReturnStart = new THREE.Vector3();
    const ballReturnStartRotation = new THREE.Quaternion();
    const animationStart = performance.now();

    function resolveOnce() {
      if (hasResolved) return;
      hasResolved = true;
      resolveWhenResultCanShow();
    }

    function startOutcome(elapsed) {
      outcomeStart = elapsed;
      const exitStart = new THREE.Vector2(plane.headingGroup.position.x, plane.headingGroup.position.y);
      exitPath = [
        exitStart,
        exitStart.clone().add(new THREE.Vector2(160, -36)),
        new THREE.Vector2(viewport.width * 0.3, exitStart.y + 40),
        new THREE.Vector2(viewport.width / 2 + planeLength * 2, viewport.height / 2 + planeLength * 1.4),
      ];
      if (sendOutcome.isSent) return;
      scene.attach(sheet.paperGroup);
      ballReturnStart.copy(sheet.paperGroup.position);
      ballReturnStartRotation.copy(sheet.paperGroup.quaternion);
    }

    function updatePaper(elapsed) {
      if (outcomeStart !== null && !sendOutcome.isSent) {
        if (isBallReturned) return;
        const returnProgress = easeInOutCubic(progressBetween(elapsed, outcomeStart, outcomeStart + timeline.returnDuration));
        const formCentreNow = formCentreInWorld();
        sheet.paperGroup.position.set(
          THREE.MathUtils.lerp(ballReturnStart.x, formCentreNow.x, returnProgress),
          THREE.MathUtils.lerp(ballReturnStart.y, formCentreNow.y, returnProgress) + Math.sin(Math.PI * returnProgress) * 60,
          THREE.MathUtils.lerp(ballReturnStart.z, 0, returnProgress),
        );
        sheet.paperGroup.quaternion.slerpQuaternions(ballReturnStartRotation, new THREE.Quaternion(), returnProgress);
        sheet.setCrumpleProgress(1 - returnProgress);
        if (returnProgress >= 1) {
          isBallReturned = true;
          scene.remove(sheet.paperGroup);
          formElement.style.visibility = "";
          resolveOnce();
        }
        return;
      }

      const crumpleProgress = progressBetween(elapsed, 0, timeline.crumpleEnd);
      sheet.setCrumpleProgress(crumpleProgress);
      if (isBallSeated) return;
      if (elapsed < timeline.tossStart) {
        const lift = easeInOutCubic(crumpleProgress);
        sheet.paperGroup.position.set(formCentre.x, THREE.MathUtils.lerp(formCentre.y, ballRestingPoint.y, lift), 0);
        sheet.paperGroup.rotation.set(0.5 * lift, 0.9 * lift, -0.7 * lift);
        ballTossStart.copy(sheet.paperGroup.position);
        return;
      }
      const tossProgress = progressBetween(elapsed, timeline.tossStart, timeline.catchTime);
      const seatInWorld = plane.bankGroup.localToWorld(seatOnPlane.clone());
      sheet.paperGroup.position.set(
        THREE.MathUtils.lerp(ballTossStart.x, seatInWorld.x, tossProgress),
        THREE.MathUtils.lerp(ballTossStart.y, seatInWorld.y, tossProgress) + Math.sin(Math.PI * tossProgress) * 80,
        THREE.MathUtils.lerp(ballTossStart.z, seatInWorld.z, tossProgress),
      );
      sheet.paperGroup.rotation.x += 0.09;
      sheet.paperGroup.rotation.z -= 0.06;
      if (tossProgress >= 1) {
        plane.bankGroup.attach(sheet.paperGroup);
        sheet.paperGroup.position.copy(seatOnPlane);
        isBallSeated = true;
      }
    }

    function updatePlane(elapsed) {
      if (outcomeStart === null) {
        const arrivalProgress = progressBetween(elapsed, timeline.planeArriveStart, timeline.catchTime);
        const planePosition = cubicBezierPoint(arrivalPath, easeOutCubic(arrivalProgress));
        const landingDip = elapsed > timeline.catchTime ? Math.sin(Math.PI * progressBetween(elapsed, timeline.catchTime, timeline.dipEnd)) * 9 : 0;
        const hoverWhileWaiting = elapsed > timeline.dipEnd ? Math.sin((elapsed - timeline.dipEnd) * 2.6) * 5 : 0;
        plane.headingGroup.position.set(planePosition.x, planePosition.y - landingDip + hoverWhileWaiting, 0);
        plane.headingGroup.rotation.z = cubicBezierHeading(arrivalPath, easeOutCubic(arrivalProgress)) * (1 - arrivalProgress);
        plane.bankGroup.rotation.x = bankAngle + Math.sin(elapsed * 6) * 0.06 * (1 - arrivalProgress);
        return;
      }
      const exitProgress = easeInQuad(progressBetween(elapsed, outcomeStart, outcomeStart + timeline.exitDuration));
      const planePosition = cubicBezierPoint(exitPath, exitProgress);
      plane.headingGroup.position.set(planePosition.x, planePosition.y, 0);
      plane.headingGroup.rotation.z = cubicBezierHeading(exitPath, exitProgress);
      plane.headingGroup.scale.setScalar(1 - 0.3 * exitProgress);
      plane.bankGroup.rotation.x = bankAngle + 0.25 * Math.sin(Math.PI * exitProgress);
      plane.headingGroup.updateMatrixWorld(true);
      waveTrail.addPoint(toScreen(plane.headingGroup.localToWorld(new THREE.Vector3())), elapsed);
    }

    function cleanUp() {
      window.removeEventListener("resize", resizeFlightLayer);
      sheet.dispose();
      plane.dispose();
      environmentTexture.dispose();
      environmentGenerator.dispose();
      renderer.dispose();
      trailCanvas.remove();
      paperCanvas.remove();
    }

    function renderFrame(now) {
      const elapsed = (now - animationStart) / 1000;
      if (outcomeStart === null && sendOutcome && elapsed >= timeline.dipEnd) startOutcome(elapsed);

      updatePlane(elapsed);
      plane.headingGroup.updateMatrixWorld(true);
      updatePaper(elapsed);
      if (outcomeStart !== null && sendOutcome.isSent && elapsed >= outcomeStart + timeline.showSuccessAfterExitStart) resolveOnce();

      waveTrail.draw(elapsed, viewport.width, viewport.height);
      renderer.render(scene, camera);
      if (!isFormHidden) {
        formElement.style.visibility = "hidden";
        isFormHidden = true;
      }

      const isFinished = outcomeStart !== null && hasResolved && elapsed >= outcomeStart + timeline.exitDuration + timeline.trailFade;
      if (isFinished) cleanUp();
      else requestAnimationFrame(renderFrame);
    }

    requestAnimationFrame(renderFrame);
  });
}
