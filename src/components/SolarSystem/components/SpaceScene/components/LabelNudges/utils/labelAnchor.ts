import { type Camera, Vector3 } from "three";

import type { Point } from "#/components/SolarSystem/types";

import { toPlanePosition } from "../../../utils/sceneMath";

const anchor = new Vector3();
const screenUp = new Vector3();

type GetLabelAnchorParams = {
  // The planet's center (system units) and radius.
  position: Point;
  size: number;
  camera: Camera;
  viewport: { width: number; height: number };
};

// Where a planet's label hangs on screen, in pixels from the top left: under the planet as the
// camera sees it, one radius below its center along the screen's up, as the label's own
// camera-facing anchor puts it.
export function getLabelAnchor({ position, size, camera, viewport }: GetLabelAnchorParams) {
  screenUp.set(0, 1, 0).applyQuaternion(camera.quaternion);
  anchor
    .set(...toPlanePosition(position))
    .addScaledVector(screenUp, -size)
    .project(camera);

  return {
    x: ((anchor.x + 1) / 2) * viewport.width,
    y: ((1 - anchor.y) / 2) * viewport.height,
  };
}
