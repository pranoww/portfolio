import * as THREE from 'three';
import createVoxelBuilder from '@/three/voxelBuilder';

test('a voxel spans exactly the box between its two corners', () => {
  const { addVoxel } = createVoxelBuilder({ rounded: false });
  const group = new THREE.Group();
  const voxel = addVoxel(group, [0, 0, 0], [2, 4, 6], '#8c9097');
  const bounds = new THREE.Box3().setFromObject(voxel);
  expect(bounds.min.toArray()).toEqual([0, 0, 0]);
  expect(bounds.max.toArray()).toEqual([2, 4, 6]);
  expect(group.children).toContain(voxel);
});

test('voxels of the same colour share one material', () => {
  const { addVoxel } = createVoxelBuilder({ rounded: true });
  const group = new THREE.Group();
  const first = addVoxel(group, [0, 0, 0], [1, 1, 1], '#1a2ffb');
  const second = addVoxel(group, [3, 0, 0], [5, 2, 1], '#1a2ffb');
  expect(first.material).toBe(second.material);
});

test('a glowing voxel gets an emissive colour', () => {
  const { addVoxel } = createVoxelBuilder({ rounded: true });
  const lampBulb = addVoxel(new THREE.Group(), [0, 0, 0], [1, 1, 1], '#ffe9b0', '#ffcf6b');
  expect(lampBulb.material.emissive.getHexString()).toBe('ffcf6b');
});
