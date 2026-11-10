// The flag waves from its pole: still at the pole, swinging more toward its free end. Scene
// units and seconds.
const WAVE = { length: 0.9, speed: 3.2, depth: 0.3 } as const;

type GetFlagWaveParams = {
  // How far along the flag from the pole, 0 to 1.
  along: number;
  time: number;
};

// How far out of its plane the flag is at a point along it.
export function getFlagWave({ along, time }: GetFlagWaveParams) {
  return Math.sin((along / WAVE.length) * Math.PI * 2 - time * WAVE.speed) * WAVE.depth * along;
}
