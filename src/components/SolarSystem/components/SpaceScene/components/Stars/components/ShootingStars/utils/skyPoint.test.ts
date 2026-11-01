import { Matrix4, PerspectiveCamera, Vector3 } from "three";
import { describe, expect, it } from "vitest";

import { createSkyView, setSkyView, toSkyPoint } from "./skyPoint";

const VIEWPORT = { width: 1440, height: 900 };
const SHELL = 8000;

function createCamera() {
  const camera = new PerspectiveCamera(45, VIEWPORT.width / VIEWPORT.height, 1, 20000);
  camera.position.set(0, 800, 700);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  return camera;
}

function toPixel({ point, camera }: { point: Vector3; camera: PerspectiveCamera }) {
  const projected = point.clone().project(camera);
  return {
    x: ((projected.x + 1) / 2) * VIEWPORT.width,
    y: ((1 - projected.y) / 2) * VIEWPORT.height,
  };
}

describe("toSkyPoint", () => {
  it("puts a pixel on the star shell, right where it showed when launched", () => {
    const camera = createCamera();
    const view = createSkyView();
    setSkyView({ view, camera, skyMatrixWorld: new Matrix4() });

    const point = toSkyPoint({ x: 300, y: 200, viewport: VIEWPORT, view, distance: SHELL });

    expect(point.distanceTo(camera.position)).toBeCloseTo(SHELL, 0);
    const pixel = toPixel({ point, camera });
    expect(pixel.x).toBeCloseTo(300, 1);
    expect(pixel.y).toBeCloseTo(200, 1);
  });

  it("stays put in the sky as the camera turns away, and turns with a turning sky", () => {
    const camera = createCamera();
    const view = createSkyView();
    const sky = new Matrix4().makeRotationY(0.3);
    setSkyView({ view, camera, skyMatrixWorld: sky });
    const local = toSkyPoint({ x: 720, y: 450, viewport: VIEWPORT, view, distance: SHELL });

    // Back in the world, through the sky's turn: still where it showed.
    const world = local.clone().applyMatrix4(sky);
    expect(toPixel({ point: world, camera }).x).toBeCloseTo(720, 1);

    camera.position.set(700, 800, 0);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    expect(toPixel({ point: world, camera }).x).not.toBeCloseTo(720, 0);
  });
});
