// Two thin white wavy lines drawn behind the flying plane on a 2D canvas, fading out as they age
const waveLineList = [
  { amplitude: 11, phase: 0, width: 3 },
  { amplitude: 6, phase: Math.PI, width: 1.6 },
];

export function createWaveTrail(context, fadeSeconds) {
  const trailPointList = [];

  function addPoint(screenPoint, time) {
    trailPointList.push({ ...screenPoint, time });
  }

  function draw(time, width, height) {
    context.clearRect(0, 0, width, height);
    while (trailPointList.length && time - trailPointList[0].time > fadeSeconds) trailPointList.shift();
    if (trailPointList.length < 3) return;
    context.lineCap = "round";
    for (const waveLine of waveLineList) {
      let travelledDistance = 0;
      let previousPoint = null;
      for (let index = 1; index < trailPointList.length; index++) {
        const from = trailPointList[index - 1];
        const to = trailPointList[index];
        const segmentLength = Math.hypot(to.x - from.x, to.y - from.y) || 1;
        travelledDistance += segmentLength;
        const freshness = 1 - (time - to.time) / fadeSeconds;
        const waveOffset = waveLine.amplitude * Math.sin(travelledDistance * 0.032 + waveLine.phase) * freshness;
        const currentPoint = { x: to.x - (to.y - from.y) / segmentLength * waveOffset, y: to.y + (to.x - from.x) / segmentLength * waveOffset };
        if (previousPoint) {
          context.beginPath();
          context.moveTo(previousPoint.x, previousPoint.y);
          context.lineTo(currentPoint.x, currentPoint.y);
          context.strokeStyle = `rgba(255, 255, 255, ${0.95 * freshness ** 1.2})`;
          context.lineWidth = waveLine.width * (0.4 + 0.6 * freshness);
          context.stroke();
        }
        previousPoint = currentPoint;
      }
    }
  }

  return { addPoint, draw };
}
