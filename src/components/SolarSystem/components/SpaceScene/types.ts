// Shared, mutable state the scene's frame loop reads and writes without re-rendering.
export type SceneState = {
  // Each planet's current angle on its orbit (radians).
  planetAngles: Map<string, number>;
};
