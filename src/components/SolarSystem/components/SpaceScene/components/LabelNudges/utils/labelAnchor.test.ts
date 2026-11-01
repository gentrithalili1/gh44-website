import { PerspectiveCamera } from "three";
import { describe, expect, it } from "vitest";

import { getLabelAnchor } from "./labelAnchor";

const VIEWPORT = { width: 390, height: 844 };

function createCamera({ position }: { position: [number, number, number] }) {
  const camera = new PerspectiveCamera(45, VIEWPORT.width / VIEWPORT.height, 1, 10000);
  camera.position.set(...position);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  return camera;
}

describe("getLabelAnchor", () => {
  it("hangs the label a planet's radius under its center on screen, from any angle", () => {
    for (const position of [
      [0, 1500, 1300],
      [900, 600, -1500],
    ] as const) {
      const camera = createCamera({ position: [...position] });
      const planet = { position: { x: 0, y: 0 }, size: 20 };
      const distance = Math.hypot(...position);
      const radiusPx = (20 * VIEWPORT.height) / (2 * distance * Math.tan(Math.PI / 8));

      const anchor = getLabelAnchor({ ...planet, camera, viewport: VIEWPORT });

      expect(anchor.x).toBeCloseTo(195, 0);
      expect(anchor.y).toBeCloseTo(422 + radiusPx, 0);
    }
  });
});
