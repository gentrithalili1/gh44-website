// Shared, mutable state the scene's frame loop reads and writes without re-rendering.
export type SceneState = {
  // The shared clock: the seconds this frame moves everything forward.
  frameStep: number;
  // Each planet's current angle on its orbit (radians).
  planetAngles: Map<string, number>;
};
