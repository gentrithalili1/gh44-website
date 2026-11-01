import type { ShipPose } from "#/components/SolarSystem/utils/ship";

// Shared, mutable state the scene's frame loop reads and writes without re-rendering.
export type SceneState = {
  // The shared clock: the seconds this frame moves everything forward.
  frameStep: number;
  // Each planet's current angle on its orbit (radians).
  planetAngles: Map<string, number>;
  // Where the gh44 explorer is now, and its heading.
  shipPose: ShipPose;
};
