// A white paper dart: two raised wings and a keel with grey fold lines, nose pointing +x and tail at the origin
import * as THREE from "three";

export function buildPaperPlane(length) {
  const point = (x, y, z) => new THREE.Vector3(x * length, y * length, z * length);
  const nose = point(1, 0, 0);
  const tail = point(0, 0, 0);
  const leftWingTip = point(0, 0.26, -0.36);
  const rightWingTip = point(0, 0.26, 0.36);
  const keelBottom = point(0.02, -0.15, 0);

  const surfaceGeometry = new THREE.BufferGeometry().setFromPoints([nose, leftWingTip, tail, nose, tail, rightWingTip, nose, tail, keelBottom]);
  surfaceGeometry.computeVertexNormals();
  const surfaceMaterial = new THREE.MeshStandardMaterial({ color: 0xfbfbf8, roughness: 0.85, side: THREE.DoubleSide, flatShading: true });
  const foldLineGeometry = new THREE.BufferGeometry().setFromPoints([nose, tail, nose, leftWingTip, nose, rightWingTip, tail, leftWingTip, tail, rightWingTip, nose, keelBottom]);
  const foldLineMaterial = new THREE.LineBasicMaterial({ color: 0xb9bccc });

  const bankGroup = new THREE.Group();
  bankGroup.add(new THREE.Mesh(surfaceGeometry, surfaceMaterial), new THREE.LineSegments(foldLineGeometry, foldLineMaterial));
  const headingGroup = new THREE.Group();
  headingGroup.add(bankGroup);

  function dispose() {
    surfaceGeometry.dispose();
    surfaceMaterial.dispose();
    foldLineGeometry.dispose();
    foldLineMaterial.dispose();
  }

  return { headingGroup, bankGroup, dispose };
}
