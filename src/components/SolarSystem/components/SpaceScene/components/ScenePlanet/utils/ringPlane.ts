// Saturn's rings lie flat on the orbit plane, then tip away from the home view: seen about as
// open as the 2D drawing's tilted rings, the far half behind the planet and the near half
// across it.
export const RING_TILT = -Math.PI / 2 - 0.45;

// The direction the tipped rings face, in the scene: what their shadow on the planet follows.
export const RING_NORMAL = [0, -Math.sin(RING_TILT), Math.cos(RING_TILT)] as const;
