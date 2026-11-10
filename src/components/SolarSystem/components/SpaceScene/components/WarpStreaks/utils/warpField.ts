// Streaks fill a tunnel ahead of the camera, in the camera's own space: each has an angle round
// the view axis, a distance from it, a starting depth and a speed.
export const STREAK_COUNT = 150;
export const TUNNEL_DEPTH = 1600;
const TUNNEL_RADIUS = { min: 45, max: 420 } as const;
const STREAK_SPEED = { min: 900, max: 1900 } as const;

const FULL_TURN = Math.PI * 2;
const CORNERS = 4;
const SEED_SIZE = 4;
const CORNER_SIZE = 2;
// Each streak's four corners as (tail, side): the head's two edges, then the tail's.
const CORNER_VALUES = [0, -1, 0, 1, 1, -1, 1, 1];
const CORNER_TRIANGLES = [0, 1, 2, 1, 3, 2];

function between({ min, max, share }: { min: number; max: number; share: number }) {
  return min + (max - min) * share;
}

// The buffers for every streak: one seed per streak, repeated on its four corners.
export function createWarpField(random: () => number) {
  const seeds = new Float32Array(STREAK_COUNT * CORNERS * SEED_SIZE);
  const corners = new Float32Array(STREAK_COUNT * CORNERS * CORNER_SIZE);
  const triangles = new Uint16Array(STREAK_COUNT * CORNER_TRIANGLES.length);
  for (let streak = 0; streak < STREAK_COUNT; streak++) {
    const seed = [
      random() * FULL_TURN,
      between({ ...TUNNEL_RADIUS, share: random() }),
      random() * TUNNEL_DEPTH,
      between({ ...STREAK_SPEED, share: random() }),
    ];
    for (let corner = 0; corner < CORNERS; corner++) {
      seeds.set(seed, (streak * CORNERS + corner) * SEED_SIZE);
    }
    corners.set(CORNER_VALUES, streak * CORNERS * CORNER_SIZE);
    triangles.set(
      CORNER_TRIANGLES.map((corner) => streak * CORNERS + corner),
      streak * CORNER_TRIANGLES.length,
    );
  }

  return {
    seeds,
    corners,
    triangles,
    // Three.js sizes the draw from `position`; the shader places every corner itself.
    positions: new Float32Array(STREAK_COUNT * CORNERS * 3),
  };
}
