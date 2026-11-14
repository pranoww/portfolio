// Camera positions for the About room (whole-room overview plus one close-up per object) and where each numbered dot goes on screen

const closeUpPullBack = 1.75;
const dotEdgeGap = 30;

const rawCloseUpPoseList = [
  { position: [-3.2, 12.5, 8.5], lookAt: [-5.5, 10, -6.7] },
  { position: [3.4, 10.6, 7.6], lookAt: [1.3, 6.4, -4.2] },
  { position: [4.6, 12.6, 6.2], lookAt: [6.5, 10.4, -6.6] },
  { position: [-1.2, 12.4, 3.8], lookAt: [9.6, 10.4, -2] },
  { position: [2.4, 7.6, 15], lookAt: [7.6, 1.6, 4.5] },
  { position: [-1.6, 8.4, 15], lookAt: [-7, 1.2, 3.5] },
];

export const closeUpPoseList = rawCloseUpPoseList.map(({ position, lookAt }) => ({
  position: position.map((value, axis) => lookAt[axis] + (value - lookAt[axis]) * closeUpPullBack),
  lookAt,
}));

export function getOverviewPose(width, height) {
  const isWideScreen = width / height > 1.2 && width >= 900;
  const viewAngle = -0.16;
  const distance = width < 520 ? 52 : 38;
  const sideShift = isWideScreen ? -3.6 : 0;
  return {
    position: [Math.sin(viewAngle) * distance + sideShift, 17, Math.cos(viewAngle) * distance],
    lookAt: [1.6 + sideShift, 6.4, -1.6],
  };
}

export function placeDotOnScreen(projectedPoint, width, height) {
  const isBehindCamera = projectedPoint.z > 1;
  const screenX = ((isBehindCamera ? -projectedPoint.x : projectedPoint.x) + 1) / 2 * width;
  const screenY = (1 - (isBehindCamera ? -projectedPoint.y : projectedPoint.y)) / 2 * height;
  const isInView = !isBehindCamera && screenX > dotEdgeGap && screenX < width - dotEdgeGap && screenY > dotEdgeGap && screenY < height - dotEdgeGap;

  const left = Math.min(width - dotEdgeGap, Math.max(dotEdgeGap, screenX));
  let top = Math.min(height - dotEdgeGap, Math.max(dotEdgeGap, screenY));
  if (left > width - 240 && top > height - 280) top = height - 280;
  if (left < 150 && top > height - 80) top = height - 80;
  return { left, top, isInView };
}
