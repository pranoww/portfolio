// Layered coloured waves along the bottom of the hero: low under the text on the left, rising behind the business card on the right
const waveLayerList = [
  { fill: "#dfe3ff", path: "M0 290 C 300 240, 520 320, 820 210 S 1240 50, 1440 30 L1440 400 L0 400 Z" },
  { fill: "var(--blue)", path: "M0 330 C 320 290, 560 350, 860 250 S 1260 100, 1440 90 L1440 400 L0 400 Z" },
  { fill: "var(--ink)", path: "M0 365 C 340 335, 600 385, 900 295 S 1280 165, 1440 160 L1440 400 L0 400 Z" },
];

export default function HeroWaves() {
  return (
    <svg aria-hidden="true" viewBox="0 0 1440 400" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[62%] w-full md:h-[78%]">
      {waveLayerList.map(waveLayer => <path key={waveLayer.fill} d={waveLayer.path} fill={waveLayer.fill} />)}
      <path d="M0 350 C 330 315, 580 370, 880 275 S 1270 135, 1440 128" fill="none" stroke="var(--lime)" strokeWidth="5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
