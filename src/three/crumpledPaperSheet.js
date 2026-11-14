// A sheet of paper the size of the form that can be crumpled into a creased ball and smoothed back out, by progress 0 to 1
import * as THREE from "three";
import { clamp01, easeInOutCubic } from "@/three/paperFlightMath";

const foldWaveList = Array.from({ length: 6 }, () => ({
  frequencyX: (Math.random() - 0.5) * 0.09,
  frequencyY: (Math.random() - 0.5) * 0.09,
  phase: Math.random() * Math.PI * 2,
}));

// A few crossing sine waves give soft folds; a per-vertex jitter adds the sharp creases of real crumpled paper
const foldNoise = (x, y) => foldWaveList.reduce((sum, wave) => sum + Math.sin(x * wave.frequencyX + y * wave.frequencyY + wave.phase), 0) / foldWaveList.length;

export function buildCrumpledPaperSheet(width, height, frontTexture, cornerMask) {
  const geometry = new THREE.PlaneGeometry(width, height, 26, Math.max(14, Math.round(26 * height / width)));
  const flatPositionArray = geometry.attributes.position.array.slice();
  const vertexCount = flatPositionArray.length / 3;
  const halfDiagonal = Math.hypot(width, height) / 2;
  const ballRadius = THREE.MathUtils.clamp(width * 0.075, 24, 36);
  const crumpledPositionArray = new Float32Array(flatPositionArray.length);
  const creaseJitterArray = new Float32Array(vertexCount);
  const startDelayArray = new Float32Array(vertexCount);

  for (let index = 0; index < vertexCount; index++) {
    const x = flatPositionArray[index * 3];
    const y = flatPositionArray[index * 3 + 1];
    const distanceFromCentre = Math.hypot(x, y) / halfDiagonal;
    const polarAngle = distanceFromCentre * Math.PI * 0.96;
    const azimuth = Math.atan2(y, x);
    const lumpyRadius = ballRadius * (1 + 0.22 * foldNoise(x * 1.6, y * 1.6) + (Math.random() - 0.5) * 0.16);
    crumpledPositionArray[index * 3] = lumpyRadius * Math.sin(polarAngle) * Math.cos(azimuth);
    crumpledPositionArray[index * 3 + 1] = lumpyRadius * Math.sin(polarAngle) * Math.sin(azimuth);
    crumpledPositionArray[index * 3 + 2] = lumpyRadius * Math.cos(polarAngle);
    creaseJitterArray[index] = Math.random() - 0.5;
    startDelayArray[index] = (1 - distanceFromCentre) * 0.2;
  }

  const sharedPaperSettings = { alphaMap: cornerMask, alphaTest: 0.5, roughness: 0.92, flatShading: true };
  const frontMaterial = new THREE.MeshStandardMaterial({ ...sharedPaperSettings, map: frontTexture, emissiveMap: frontTexture, emissive: 0xffffff, side: THREE.FrontSide });
  const backMaterial = new THREE.MeshStandardMaterial({ ...sharedPaperSettings, color: 0xf7f7f4, side: THREE.BackSide });
  const paperGroup = new THREE.Group();
  paperGroup.add(new THREE.Mesh(geometry, frontMaterial), new THREE.Mesh(geometry, backMaterial));

  function setCrumpleProgress(progress) {
    const positionArray = geometry.attributes.position.array;
    for (let index = 0; index < vertexCount; index++) {
      const vertexProgress = easeInOutCubic(clamp01((progress - startDelayArray[index]) / 0.62));
      const midFold = Math.sin(Math.PI * vertexProgress);
      const flatX = flatPositionArray[index * 3];
      const flatY = flatPositionArray[index * 3 + 1];
      const squeeze = midFold * width * 0.1;
      const creaseKick = midFold * 12 * creaseJitterArray[index];
      const squeezeScale = 1 - 0.45 * vertexProgress;
      positionArray[index * 3] = THREE.MathUtils.lerp(flatX * squeezeScale, crumpledPositionArray[index * 3], vertexProgress) + squeeze * foldNoise(flatY * 1.7, flatX * 1.3) + creaseKick;
      positionArray[index * 3 + 1] = THREE.MathUtils.lerp(flatY * squeezeScale, crumpledPositionArray[index * 3 + 1], vertexProgress) + squeeze * foldNoise(flatX * 1.4 + 40, flatY * 1.9) - creaseKick;
      positionArray[index * 3 + 2] = THREE.MathUtils.lerp(0, crumpledPositionArray[index * 3 + 2], vertexProgress) + squeeze * 1.3 * foldNoise(flatX, flatY) + creaseKick;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    // Glows white while flat so the first frame matches the real form, then lets the folds catch the light
    frontMaterial.emissiveIntensity = 0.6 * (1 - Math.min(1, progress * 2.5)) + 0.12;
  }

  function dispose() {
    geometry.dispose();
    frontMaterial.dispose();
    backMaterial.dispose();
    frontTexture.dispose();
    cornerMask.dispose();
  }

  return { paperGroup, setCrumpleProgress, ballRadius, dispose };
}
