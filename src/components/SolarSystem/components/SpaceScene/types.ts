import type { ShipPose } from "#/components/SolarSystem/utils/ship";

// Shared, mutable state the scene's frame loop reads and writes without re-rendering.
export type SceneState = {
  // The shared clock: the seconds this frame moves everything forward.
  frameStep: number;
  // Each planet's current angle on its orbit (radians).
  planetAngles: Map<string, number>;
  // Where the gh44 explorer is now, and its heading.
  shipPose: ShipPose;
  // How many pixels one unit spans where the camera looks.
  cameraZoom: number;
  // 0 to 1: how far into a launch's jump the scene is (stars stretch, the view widens). It dips
  // just under 0 as the jump brakes.
  warp: number;
  // 0 to 1: how far into the black hole the ship has flown (an easter egg); 0 the rest of the
  // time.
  jump: number;
};
