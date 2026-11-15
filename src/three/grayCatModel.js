// Builds the voxel gray cat and the little mouse she chases, returning the parts that get animated
import * as THREE from "three";

const GRAY = "#8c9097", GRAY_DARK = "#6c7077", GRAY_LIGHT = "#b4b8be", WHITE = "#e9e7e3", PINK = "#e8a3a3";
const AMBER = "#e8a53a", PUPIL = "#111111", COLLAR_BLUE = "#1a2ffb", BELL_RED = "#e0362a";
const MOUSE_BROWN = "#9a8f86", MOUSE_LIGHT = "#c9bfb5";

export function buildGrayCat(addVoxel) {
  const catRoot = new THREE.Group();
  catRoot.rotation.x = 0.28;

  const shadow = new THREE.Mesh(new THREE.CircleGeometry(5.2, 40), new THREE.MeshBasicMaterial({ color: "#000000", transparent: true, opacity: 0.16, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.05;
  catRoot.add(shadow);

  const facingGroup = new THREE.Group();
  const bodyGroup = new THREE.Group();
  catRoot.add(facingGroup);
  facingGroup.add(bodyGroup);

  addVoxel(bodyGroup, [-5, 4.2, -3], [5, 9.6, 3], GRAY);
  addVoxel(bodyGroup, [-4, 4, -2.6], [4, 4.8, 2.6], WHITE);
  addVoxel(bodyGroup, [4.4, 4.6, -2.2], [5.7, 8.2, 2.2], WHITE);
  for (const stripeX of [-3, -0.6, 1.8]) addVoxel(bodyGroup, [stripeX, 9.4, -3.1], [stripeX + 1, 9.8, 3.1], GRAY_DARK);
  addVoxel(bodyGroup, [4.6, 7.4, -3.1], [6.2, 8.4, 3.1], COLLAR_BLUE);
  const bell = addVoxel(bodyGroup, [6.1, 6.5, -0.5], [6.9, 7.5, 0.5], BELL_RED);

  const legList = [[3.2, 1.7, 0], [3.2, -1.7, Math.PI], [-3.2, 1.7, Math.PI], [-3.2, -1.7, 0]].map(([legX, legZ, stepPhase]) => {
    const legGroup = new THREE.Group();
    legGroup.position.set(legX, 5, legZ);
    bodyGroup.add(legGroup);
    addVoxel(legGroup, [-0.9, -5, -0.9], [0.9, 0, 0.9], GRAY);
    addVoxel(legGroup, [-1, -5, -1], [1.1, -4, 1], WHITE);
    return { legGroup, stepPhase, isFrontLeg: legX > 0 };
  });

  const tail = new THREE.Group();
  tail.position.set(-5, 8.4, 0);
  bodyGroup.add(tail);
  addVoxel(tail, [-1.8, -0.6, -0.9], [0.2, 1.2, 0.9], GRAY);
  addVoxel(tail, [-2.8, 0.6, -1], [-1.2, 3.8, 1], GRAY);
  addVoxel(tail, [-2.6, 3.4, -1.1], [-0.9, 5.8, 1.1], GRAY_LIGHT);

  const head = new THREE.Group();
  head.position.set(6.4, 9.2, 0);
  head.rotation.order = "YZX";
  bodyGroup.add(head);
  addVoxel(head, [-2.4, -1, -3], [2.6, 4, 3], GRAY);
  addVoxel(head, [-1.5, -0.6, -3.7], [1.5, 1.8, 3.7], GRAY_LIGHT);
  addVoxel(head, [2.5, -0.6, -1.4], [3.3, 1, 1.4], WHITE);
  addVoxel(head, [3.2, 0.6, -0.4], [3.6, 1.1, 0.4], PINK);
  addVoxel(head, [-1, 3.9, -1], [1, 4.3, 1], GRAY_DARK);
  for (const side of [-1, 1]) {
    addVoxel(head, [-0.8, 4, side > 0 ? 1.2 : -2.8], [1, 5.9, side > 0 ? 2.8 : -1.2], GRAY);
    addVoxel(head, [1, 4.2, side > 0 ? 1.5 : -2.5], [1.15, 5.5, side > 0 ? 2.5 : -1.5], PINK);
  }

  const eyes = new THREE.Group();
  eyes.position.set(2.6, 1.9, 0);
  head.add(eyes);
  for (const side of [-1, 1]) {
    addVoxel(eyes, [0, -0.5, side * 1.2 - 0.6], [0.2, 0.5, side * 1.2 + 0.6], AMBER);
    addVoxel(eyes, [0.15, -0.45, side * 1.2 - 0.18], [0.3, 0.45, side * 1.2 + 0.18], PUPIL);
  }

  const napParts = buildNapParts(addVoxel, bodyGroup, head);
  return { catRoot, shadow, facingGroup, bodyGroup, legList, tail, head, eyes, bell, napParts };
}

// Extra pieces for the nap pose, hidden until she sleeps: tucked front paws, a tail wrapped round her side,
// closed eyelids, and a see-through bubble on her nose that pops into droplets
function buildNapParts(addVoxel, bodyGroup, head) {
  const loafParts = new THREE.Group();
  loafParts.visible = false;
  bodyGroup.add(loafParts);
  for (const side of [-1, 1]) addVoxel(loafParts, [5.0, 4.2, side > 0 ? 0.5 : -2.3], [7.9, 5.3, side > 0 ? 2.3 : -0.5], WHITE);
  addVoxel(loafParts, [-5.2, 4.2, 2.9], [3.2, 5.3, 4.1], GRAY);
  addVoxel(loafParts, [2.6, 4.2, 2.2], [5.4, 5.35, 3.9], GRAY);
  addVoxel(loafParts, [4.8, 4.2, 1.6], [6.6, 5.4, 3.3], GRAY_LIGHT);

  const lids = new THREE.Group();
  lids.visible = false;
  lids.position.set(2.62, 1.75, 0);
  head.add(lids);
  for (const side of [-1, 1]) addVoxel(lids, [0, -0.12, side * 1.2 - 0.65], [0.25, 0.12, side * 1.2 + 0.65], GRAY_DARK);

  const bubbleGeometry = new THREE.SphereGeometry(1, 32, 24);
  const bubbleMaterial = new THREE.MeshPhysicalMaterial({ color: "#bfe4ff", transparent: true, opacity: 0.62, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.05, depthWrite: false });
  const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
  bubble.visible = false;
  const shineGeometry = new THREE.SphereGeometry(0.22, 12, 10);
  const shineMaterial = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.85 });
  const shine = new THREE.Mesh(shineGeometry, shineMaterial);
  shine.position.set(0.35, 0.45, 0.55);
  bubble.add(shine);
  head.add(bubble);

  const dropletGeometry = new THREE.SphereGeometry(0.22, 10, 8);
  const dropletList = Array.from({ length: 10 }, (_, index) => {
    const droplet = new THREE.Mesh(dropletGeometry, new THREE.MeshBasicMaterial({ color: "#bfe6ff", transparent: true, opacity: 0 }));
    const angle = (index / 10) * Math.PI * 2;
    droplet.userData.direction = new THREE.Vector3(Math.cos(angle), Math.sin(angle), ((index % 3) - 1) * 0.5).normalize();
    droplet.visible = false;
    head.add(droplet);
    return droplet;
  });

  function dispose() {
    [bubbleGeometry, bubbleMaterial, shineGeometry, shineMaterial, dropletGeometry].forEach(item => item.dispose());
    dropletList.forEach(droplet => droplet.material.dispose());
  }

  return { loafParts, lids, bubble, dropletList, nosePosition: new THREE.Vector3(3.6, 0.85, 0), dispose };
}

export function buildMouse(addVoxel) {
  const mouseRoot = new THREE.Group();
  mouseRoot.rotation.x = 0.28;
  mouseRoot.visible = false;
  const mouseFacingGroup = new THREE.Group();
  mouseRoot.add(mouseFacingGroup);

  addVoxel(mouseFacingGroup, [-1.7, 0.5, -1], [1.5, 2.3, 1], MOUSE_BROWN);
  addVoxel(mouseFacingGroup, [1.3, 0.6, -0.85], [2.9, 2, 0.85], MOUSE_BROWN);
  addVoxel(mouseFacingGroup, [2.85, 1.05, -0.25], [3.25, 1.4, 0.25], "#222222");
  addVoxel(mouseFacingGroup, [2.3, 1.45, -0.75], [2.5, 1.7, -0.45], PUPIL);
  addVoxel(mouseFacingGroup, [2.3, 1.45, 0.45], [2.5, 1.7, 0.75], PUPIL);
  for (const side of [-1, 1]) {
    addVoxel(mouseFacingGroup, [1.2, 1.9, side * 0.55 - 0.45], [1.9, 2.8, side * 0.55 + 0.45], MOUSE_LIGHT);
    addVoxel(mouseFacingGroup, [1.85, 2, side * 0.55 - 0.3], [1.95, 2.65, side * 0.55 + 0.3], PINK);
  }

  const mouseTail = new THREE.Group();
  mouseTail.position.set(-1.7, 1, 0);
  mouseFacingGroup.add(mouseTail);
  addVoxel(mouseTail, [-3, -0.12, -0.12], [0, 0.12, 0.12], PINK);

  const mouseLegList = [[1, 0.6], [1, -0.6], [-1, 0.6], [-1, -0.6]].map(([legX, legZ]) => {
    const legGroup = new THREE.Group();
    legGroup.position.set(legX, 0.6, legZ);
    mouseFacingGroup.add(legGroup);
    addVoxel(legGroup, [-0.25, -0.6, -0.2], [0.25, 0, 0.2], MOUSE_LIGHT);
    return legGroup;
  });

  return { mouseRoot, mouseFacingGroup, mouseTail, mouseLegList };
}
