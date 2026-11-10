// Pluto keeps to itself past Neptune's orbit (478), near the edge of the system: a speck, one
// lap in about nine minutes.
export const PLUTO = { radius: 2.6, orbitRadius: 512, phase: 1.3, speed: 0.012 } as const;
// The page it opens: not a planet's, so the lost page answers.
export const PLUTO_ID = "pluto";

// Where Pluto is on its orbit (radians) after `time` seconds of the scene clock.
export function getPlutoAngle(time: number) {
  return PLUTO.phase + PLUTO.speed * time;
}
