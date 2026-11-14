// Shared helper for the voxel 3D scenes: adds a box between two corners, reusing geometry and materials
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export default function createVoxelBuilder({ rounded }) {
  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  const geometryBySize = new Map();
  const materialByColor = new Map();

  function getGeometry(width, height, depth) {
    if (!rounded) return unitBox;
    const sizeKey = `${width.toFixed(2)}|${height.toFixed(2)}|${depth.toFixed(2)}`;
    if (!geometryBySize.has(sizeKey)) {
      geometryBySize.set(sizeKey, new RoundedBoxGeometry(width, height, depth, 3, Math.min(0.22, Math.min(width, height, depth) * 0.32)));
    }
    return geometryBySize.get(sizeKey);
  }

  function getMaterial(color, emissiveColor) {
    const materialKey = color + (emissiveColor || "");
    if (!materialByColor.has(materialKey)) {
      materialByColor.set(materialKey, new THREE.MeshStandardMaterial({
        color,
        roughness: rounded ? 0.72 : 0.62,
        emissive: emissiveColor || "#000000",
        emissiveIntensity: emissiveColor ? 1 : 0,
      }));
    }
    return materialByColor.get(materialKey);
  }

  function addVoxel(group, fromCorner, toCorner, color, emissiveColor) {
    const [width, height, depth] = [0, 1, 2].map(axis => toCorner[axis] - fromCorner[axis]);
    const voxel = new THREE.Mesh(getGeometry(width, height, depth), getMaterial(color, emissiveColor));
    if (!rounded) voxel.scale.set(width, height, depth);
    voxel.position.set(...[0, 1, 2].map(axis => (fromCorner[axis] + toCorner[axis]) / 2));
    voxel.castShadow = true;
    voxel.receiveShadow = true;
    group.add(voxel);
    return voxel;
  }

  function disposeAll() {
    unitBox.dispose();
    geometryBySize.forEach(geometry => geometry.dispose());
    materialByColor.forEach(material => material.dispose());
  }

  return { addVoxel, disposeAll };
}
