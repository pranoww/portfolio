// Easing curves and curved-path helpers used by the paper plane send animation
import * as THREE from "three";

export const clamp01 = value => Math.min(1, Math.max(0, value));
export const easeInOutCubic = value => (value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2);
export const easeOutCubic = value => 1 - (1 - value) ** 3;
export const easeInQuad = value => value * value;
export const progressBetween = (time, start, end) => clamp01((time - start) / (end - start));

export function cubicBezierPoint([start, firstControl, secondControl, end], progress) {
  const inverse = 1 - progress;
  const weightList = [inverse ** 3, 3 * inverse ** 2 * progress, 3 * inverse * progress ** 2, progress ** 3];
  return new THREE.Vector2(
    weightList[0] * start.x + weightList[1] * firstControl.x + weightList[2] * secondControl.x + weightList[3] * end.x,
    weightList[0] * start.y + weightList[1] * firstControl.y + weightList[2] * secondControl.y + weightList[3] * end.y,
  );
}

export function cubicBezierHeading(pointList, progress) {
  const ahead = cubicBezierPoint(pointList, Math.min(1, progress + 0.01));
  const behind = cubicBezierPoint(pointList, Math.max(0, progress - 0.01));
  return Math.atan2(ahead.y - behind.y, ahead.x - behind.x);
}
