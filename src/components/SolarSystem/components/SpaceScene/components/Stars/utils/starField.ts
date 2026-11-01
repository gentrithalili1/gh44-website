// Stars sit on a shell this far from the sun, past the farthest the camera goes, all around.
export const STAR_DISTANCE = 8000;
// Spread over the whole sky: about 500 show on a desktop screen at once, like the 2D field.
export const STAR_COUNT = 7000;
// Three depth layers: far stars are faint, near ones bright.
const STAR_DEPTHS = [0.2, 0.5, 1] as const;

type CreateStarFieldParams = { random?: () => number };

// Stars at random spots all over a sphere around the system, each with a depth, size and twinkle.
export function createStarField({ random = Math.random }: CreateStarFieldParams = {}) {
  const positions = new Float32Array(STAR_COUNT * 3);
  const depths = new Float32Array(STAR_COUNT);
  const sizes = new Float32Array(STAR_COUNT);
  const phases = new Float32Array(STAR_COUNT);
  const speeds = new Float32Array(STAR_COUNT);
  for (let index = 0; index < STAR_COUNT; index++) {
    // Even over the sphere: an even height, and an even turn around it.
    const height = random() * 2 - 1;
    const turn = random() * Math.PI * 2;
    const ring = Math.sqrt(1 - height ** 2) * STAR_DISTANCE;
    positions[index * 3] = Math.cos(turn) * ring;
    positions[index * 3 + 1] = height * STAR_DISTANCE;
    positions[index * 3 + 2] = Math.sin(turn) * ring;
    depths[index] = STAR_DEPTHS[Math.floor(random() * STAR_DEPTHS.length)] ?? 1;
    sizes[index] = random() * 1.1 + 0.3;
    phases[index] = random() * Math.PI * 2;
    speeds[index] = random() * 1.5 + 0.5;
  }

  return { positions, depths, sizes, phases, speeds };
}
