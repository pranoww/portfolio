// Builds the voxel room for "A bit about me": walls and floor that fill the view, furniture, and the six objects
// (window, laptop, corkboard, shelf, boots, cat bed) in the same order as roomObjectList
import * as THREE from "three";

const WALL = "#f4f5fb", WALL_SHADE = "#e3e6f3", FLOOR = "#d9a873", FLOOR_SHADE = "#c9955f", WOOD = "#b97a45", WOOD_DARK = "#94592c";
const INK = "#2b2e3a", BLUE = "#1a2ffb", LIME = "#c1ff00", WHITE = "#fbfbfd", LAVENDER = "#9aa6ff";

function drawCodeScreen() {
  const screenCanvas = document.createElement("canvas");
  screenCanvas.width = 320;
  screenCanvas.height = 200;
  const context = screenCanvas.getContext("2d");
  context.fillStyle = "#0d0f1a";
  context.fillRect(0, 0, 320, 200);
  context.fillStyle = "#1a1d2b";
  context.fillRect(0, 0, 320, 18);
  ["#ff6b5e", "#ffc94a", "#5fd17a"].forEach((color, index) => { context.fillStyle = color; context.beginPath(); context.arc(12 + index * 14, 9, 4, 0, 7); context.fill(); });
  [["#c1ff00", 24, 70], ["#ffffff", 40, 150], ["#7d8bff", 40, 110], ["#ffffff", 56, 170], ["#7d8bff", 56, 90], ["#c1ff00", 40, 130], ["#ffffff", 24, 190], ["#7d8bff", 40, 100], ["#ffffff", 40, 160]]
    .forEach(([color, lineX, lineWidth], index) => { context.fillStyle = color; context.fillRect(lineX, 30 + index * 18, lineWidth, 8); });
  return screenCanvas;
}

function drawMumbaiSkyline() {
  const skyCanvas = document.createElement("canvas");
  skyCanvas.width = 400;
  skyCanvas.height = 300;
  const context = skyCanvas.getContext("2d");
  const skyGradient = context.createLinearGradient(0, 0, 0, 300);
  skyGradient.addColorStop(0, "#9fb0ff");
  skyGradient.addColorStop(0.6, "#ffd7b0");
  skyGradient.addColorStop(1, "#ffb98a");
  context.fillStyle = skyGradient;
  context.fillRect(0, 0, 400, 300);
  context.fillStyle = "rgba(255,240,200,.95)";
  context.beginPath(); context.arc(300, 170, 26, 0, 7); context.fill();
  context.fillStyle = "#3b3f73";
  [[10, 150, 40], [55, 120, 30], [90, 170, 50], [145, 95, 34], [184, 140, 46], [235, 110, 28], [268, 160, 40], [314, 125, 36], [355, 150, 45]]
    .forEach(([towerX, towerTop, towerWidth]) => context.fillRect(towerX, towerTop, towerWidth, 300 - towerTop));
  context.beginPath(); context.arc(208, 140, 22, Math.PI, 0); context.fill();
  context.fillStyle = "#2b2f5c";
  context.fillRect(0, 248, 400, 52);
  context.fillStyle = "rgba(255,220,160,.6)";
  for (let lightIndex = 0; lightIndex < 40; lightIndex++) context.fillRect((lightIndex * 97) % 400, 120 + ((lightIndex * 53) % 120), 3, 4);
  return skyCanvas;
}

function makeTexturedPlane(sourceCanvas, width, height) {
  const texture = new THREE.CanvasTexture(sourceCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }));
}

export function buildAboutRoom(addVoxel) {
  const roomGroup = new THREE.Group();
  roomGroup.scale.setScalar(0.5);
  const addObjectGroup = () => { const objectGroup = new THREE.Group(); roomGroup.add(objectGroup); return objectGroup; };

  for (let plankIndex = 0; plankIndex < 40; plankIndex++) {
    addVoxel(roomGroup, [-100, -1.2, -14 + plankIndex * 3.2], [21, 0, -14 + (plankIndex + 1) * 3.2 - 0.12], plankIndex % 2 ? FLOOR : FLOOR_SHADE);
  }
  addVoxel(roomGroup, [-100, 0, -15], [22, 80, -13.6], WALL);
  addVoxel(roomGroup, [21, 0, -15], [22.4, 80, 116], WALL_SHADE);
  addVoxel(roomGroup, [-100, 0, -13.7], [21, 1.2, -13.3], WHITE);
  addVoxel(roomGroup, [20.6, 0, -13.6], [21, 1.2, 116], WHITE);
  addVoxel(roomGroup, [-6, 0, -3], [14, 0.3, 9], BLUE);
  addVoxel(roomGroup, [-5, 0.3, -2], [13, 0.36, 8], "#2a3dff");
  addVoxel(roomGroup, [-6, 0.3, 6.6], [14, 0.4, 7.2], LIME);

  // desk, mug, lamp and chair (scenery)
  addVoxel(roomGroup, [-6, 10, -13], [14, 11, -5], WOOD);
  for (const [legX, legZ] of [[-5.6, -12.6], [12.6, -12.6], [-5.6, -6.4], [12.6, -6.4]]) addVoxel(roomGroup, [legX, 0, legZ], [legX + 1, 10, legZ + 1], WOOD_DARK);
  addVoxel(roomGroup, [8, 7, -12.6], [13, 10, -6.4], WOOD_DARK);
  addVoxel(roomGroup, [8.4, 8.2, -6.5], [12.6, 9.6, -6.3], WOOD);
  addVoxel(roomGroup, [10, 8.7, -6.35], [10.8, 9, -6.1], INK);
  addVoxel(roomGroup, [7.4, 11, -9.4], [9, 13, -7.8], WHITE);
  addVoxel(roomGroup, [9, 11.6, -8.9], [9.5, 12.5, -8.3], WHITE);
  addVoxel(roomGroup, [7.6, 12.7, -9.2], [8.8, 12.9, -8], "#7a4a2a");
  addVoxel(roomGroup, [10.5, 11, -12], [13, 11.6, -9.6], INK);
  addVoxel(roomGroup, [11.5, 11.6, -11.2], [12, 18.5, -10.6], INK);
  addVoxel(roomGroup, [9, 18, -11.4], [12.4, 19.2, -9.8], INK);
  addVoxel(roomGroup, [9.2, 17.6, -11.2], [10.6, 18, -10], "#ffe9b0", "#ffcf6b");
  const chair = new THREE.Group();
  chair.position.set(3, 0, -1);
  chair.rotation.y = 0.35;
  roomGroup.add(chair);
  addVoxel(chair, [-0.4, 0, -0.4], [0.4, 6, 0.4], INK);
  for (const legAngle of [0, 1.25, 2.5, 3.75, 5]) {
    const chairLeg = new THREE.Group();
    chairLeg.rotation.y = legAngle;
    chair.add(chairLeg);
    addVoxel(chairLeg, [0, 0, -0.35], [3, 0.6, 0.35], INK);
  }
  addVoxel(chair, [-3, 6, -3], [3, 7.2, 3], BLUE);
  addVoxel(chair, [-3, 7.2, 2.2], [3, 14, 3.2], BLUE);
  addVoxel(chair, [-2.6, 7.6, 2], [2.6, 13.4, 2.3], "#2a3dff");

  // tall plant (scenery)
  addVoxel(roomGroup, [-21, 0, -13], [-17, 4, -9], WHITE);
  addVoxel(roomGroup, [-20.6, 4, -12.6], [-17.4, 4.4, -9.4], "#6b4a2e");
  [[-19, 4, -11, 12, "#5f8f33"], [-20.4, 9, -12, 7, "#6f9f3a"], [-17.8, 8, -10, 6, "#4f7a2a"], [-19.8, 13, -10.4, 5, "#6f9f3a"]]
    .forEach(([stemX, stemY, stemZ, stemHeight, color]) => addVoxel(roomGroup, [stemX - 0.9, stemY, stemZ - 0.9], [stemX + 0.9, stemY + stemHeight, stemZ + 0.9], color));

  // 1 window with the Mumbai skyline
  const windowGroup = addObjectGroup();
  const skylinePane = makeTexturedPlane(drawMumbaiSkyline(), 13, 10);
  skylinePane.position.set(-11, 20, -13.55);
  windowGroup.add(skylinePane);
  addVoxel(windowGroup, [-18, 14.6, -13.6], [-4, 15.4, -12.6], WHITE);
  addVoxel(windowGroup, [-18, 24.6, -13.6], [-4, 25.4, -12.6], WHITE);
  addVoxel(windowGroup, [-18, 15, -13.6], [-17.2, 25, -12.6], WHITE);
  addVoxel(windowGroup, [-4.8, 15, -13.6], [-4, 25, -12.6], WHITE);
  addVoxel(windowGroup, [-11.4, 15, -13.55], [-10.6, 25, -13.1], WHITE);
  addVoxel(windowGroup, [-18.6, 14, -13.6], [-3.4, 14.6, -11.8], WHITE);

  // 2 laptop
  const laptopGroup = addObjectGroup();
  addVoxel(laptopGroup, [-1.5, 11, -10.5], [6.5, 11.45, -6], "#3a3e4c");
  addVoxel(laptopGroup, [-0.9, 11.45, -9], [5.9, 11.5, -6.8], INK);
  const laptopLid = new THREE.Group();
  laptopLid.position.set(2.5, 11.45, -10.4);
  laptopLid.rotation.x = -0.22;
  laptopGroup.add(laptopLid);
  addVoxel(laptopLid, [-4, 0, -0.4], [4, 5.6, 0], "#3a3e4c");
  const codeScreen = makeTexturedPlane(drawCodeScreen(), 7.3, 4.9);
  codeScreen.position.set(0, 2.85, 0.02);
  laptopLid.add(codeScreen);

  // 3 corkboard with sticky notes
  const corkboardGroup = addObjectGroup();
  addVoxel(corkboardGroup, [7, 17, -13.6], [19, 25, -13.1], "#c99a6a");
  addVoxel(corkboardGroup, [7.4, 17.4, -13.2], [18.6, 24.6, -13], "#d8ae80");
  [[8.2, 20.6, LIME], [11, 21, "#ffd23f"], [13.8, 20.4, LAVENDER], [16.4, 21, WHITE], [9.4, 17.9, "#ff8a5c"], [12.8, 17.8, LIME], [15.6, 18, "#ffd23f"]]
    .forEach(([noteX, noteY, color]) => addVoxel(corkboardGroup, [noteX, noteY, -13.05], [noteX + 2.2, noteY + 2.2, -12.85], color));

  // 4 wall shelf with books
  const shelfGroup = addObjectGroup();
  addVoxel(shelfGroup, [17.6, 18, -9], [21, 18.8, 1], WOOD);
  [[BLUE, 3.4], [LIME, 2.8], [INK, 3.8], ["#ff8a5c", 3], [LAVENDER, 3.6], [WHITE, 2.6]]
    .forEach(([color, bookHeight], bookIndex) => addVoxel(shelfGroup, [18.4, 18.8, -8.4 + bookIndex * 1.3], [20.8, 18.8 + bookHeight, -7.3 + bookIndex * 1.3], color));
  addVoxel(shelfGroup, [18.6, 18.8, -0.4], [20.6, 19.6, 0.8], "#5f8f33");
  addVoxel(shelfGroup, [18.8, 19.6, -0.2], [20.4, 21.6, 0.6], "#6f9f3a");

  // 5 hiking boots
  const bootsGroup = addObjectGroup();
  for (const [bootX, bootAngle] of [[13.5, -0.15], [17, 0.1]]) {
    const boot = new THREE.Group();
    boot.position.set(bootX, 0, 9);
    boot.rotation.y = bootAngle;
    bootsGroup.add(boot);
    addVoxel(boot, [-1.2, 0, -1.4], [1.2, 1.2, 3], "#4a2f1d");
    addVoxel(boot, [-1.2, 1.2, -1.4], [1.2, 4.6, 1.2], "#7a4e2e");
    addVoxel(boot, [-1.25, 4.4, -1.45], [1.25, 5, 1.25], LIME);
    addVoxel(boot, [-1, 1.2, 1.2], [1, 2.2, 2.8], "#7a4e2e");
  }

  // 6 empty cat bed
  const catBedGroup = addObjectGroup();
  addVoxel(catBedGroup, [-19, 0, 2], [-9, 1.4, 12], INK);
  addVoxel(catBedGroup, [-19, 1.4, 2], [-9, 4, 3.6], LAVENDER);
  addVoxel(catBedGroup, [-19, 1.4, 10.4], [-9, 4, 12], LAVENDER);
  addVoxel(catBedGroup, [-19, 1.4, 3.6], [-17.4, 4, 10.4], LAVENDER);
  addVoxel(catBedGroup, [-10.6, 1.4, 3.6], [-9, 4, 10.4], LAVENDER);
  addVoxel(catBedGroup, [-17.4, 1.4, 3.6], [-10.6, 2.2, 10.4], WHITE);
  addVoxel(catBedGroup, [-14.6, 2.2, 6.2], [-13.6, 2.6, 7.2], "#8c9097");
  addVoxel(catBedGroup, [-12.6, 2.2, 7.8], [-12, 2.5, 8.4], "#8c9097");
  addVoxel(catBedGroup, [-8, 0, 9], [-6.6, 1.4, 10.4], LIME);

  return {
    roomGroup,
    objectGroupList: [windowGroup, laptopGroup, corkboardGroup, shelfGroup, bootsGroup, catBedGroup],
    objectAnchorList: [[-11, 27, -13.2], [2.5, 18.6, -10], [13, 26.5, -13.2], [19.3, 23.5, -4], [16, 7.5, 9], [-14, 6, 7]].map(anchor => new THREE.Vector3(...anchor).multiplyScalar(0.5)),
    lampLightPosition: new THREE.Vector3(9.9 * 0.5, 17 * 0.5, -10.6 * 0.5),
  };
}
