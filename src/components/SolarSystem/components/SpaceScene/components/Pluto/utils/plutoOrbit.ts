export const PLUTO = { radius: 2.86, orbitRadius: 512, phase: 1.3, speed: 0.012 } as const;
// Where Pluto is on its orbit (radians) after `time` seconds of the scene clock.
export function getPlutoAngle(time: number) {
  return PLUTO.phase + PLUTO.speed * time;
}
