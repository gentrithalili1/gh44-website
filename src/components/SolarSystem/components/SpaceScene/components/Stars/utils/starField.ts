// One star per this many square pixels, like the preview.
const PIXELS_PER_STAR = 2600;
// Three depth layers: far stars are faint and drift little, near ones bright and drift more.
const STAR_DEPTHS = [0.2, 0.5, 1] as const;

type CreateStarFieldParams = { width: number; height: number; random?: () => number };

// Stars at random spots across a unit square (the screen), each with a depth, size and twinkle.
export function createStarField({ width, height, random = Math.random }: CreateStarFieldParams) {
  const count = Math.round((width * height) / PIXELS_PER_STAR);
  const positions = new Float32Array(count * 3);
  const depths = new Float32Array(count);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const speeds = new Float32Array(count);
  for (let index = 0; index < count; index++) {
    positions[index * 3] = random();
    positions[index * 3 + 1] = random();
    depths[index] = STAR_DEPTHS[Math.floor(random() * STAR_DEPTHS.length)] ?? 1;
    sizes[index] = random() * 1.1 + 0.3;
    phases[index] = random() * Math.PI * 2;
    speeds[index] = random() * 1.5 + 0.5;
  }

  return { positions, depths, sizes, phases, speeds };
}
