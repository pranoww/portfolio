import { closeUpPoseList, getOverviewPose, placeDotOnScreen } from '@/three/aboutRoomCameraPoses';
import { roomObjectList } from '@/content/siteContent';

test('there is one close-up camera pose for every room object', () => {
  expect(closeUpPoseList).toHaveLength(roomObjectList.length);
});

test('the overview shifts the room right on wide screens to leave space for the caption', () => {
  const wideOverview = getOverviewPose(1440, 830);
  const phoneOverview = getOverviewPose(390, 780);
  expect(wideOverview.lookAt[0]).toBeLessThan(phoneOverview.lookAt[0]);
});

test('a dot inside the view sits right on its object', () => {
  expect(placeDotOnScreen({ x: 0, y: 0, z: 0.5 }, 1000, 800)).toEqual({ left: 500, top: 400, isInView: true });
});

test('a dot for an object off to the right is pinned to the right edge', () => {
  const placement = placeDotOnScreen({ x: 1.6, y: 0.5, z: 0.5 }, 1000, 800);
  expect(placement.isInView).toBe(false);
  expect(placement.left).toBe(1000 - 30);
});

test('a pinned dot stays clear of the gray cat corner and the pause button', () => {
  expect(placeDotOnScreen({ x: 1.6, y: -1.6, z: 0.5 }, 1000, 800).top).toBe(800 - 280);
  expect(placeDotOnScreen({ x: -1.6, y: -1.6, z: 0.5 }, 1000, 800).top).toBe(800 - 80);
});

test('an object behind the camera points the opposite way', () => {
  expect(placeDotOnScreen({ x: 0.2, y: 3, z: 1.2 }, 1000, 800)).toEqual({ left: 400, top: 800 - 30, isInView: false });
});
