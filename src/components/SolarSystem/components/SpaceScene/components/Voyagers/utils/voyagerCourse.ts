// Both probes left the planets behind long ago: each flies straight out from the sun, from just
// past the last orbit until it is out of sight, then is found again where it started. Scene
// units and seconds.
const COURSE = { from: 545, to: 860, speed: 1.1 } as const;
// A probe fades in over this share of its course, and out over the same share at the end.
const FADE_SHARE = 0.08;

export type VoyagerCourse = {
  id: "voyager1" | "voyager2";
  // The way out from the sun, one unit long: left and up on the home view for Voyager 1 (it
  // left above the planets' plane), right and down for Voyager 2 (below it).
  heading: readonly [number, number, number];
  // How far along its course it starts: the two are never level.
  lead: number;
};

export const VOYAGER_COURSES = [
  { id: "voyager1", heading: [-0.819, 0.164, -0.55], lead: 0.35 },
  { id: "voyager2", heading: [0.848, -0.141, 0.511], lead: 0 },
] as const satisfies readonly VoyagerCourse[];

type GetCourseShareParams = { course: VoyagerCourse; time: number };

// 0 to 1: how far along its course a probe is after `time` seconds of the scene clock.
export function getCourseShare({ course, time }: GetCourseShareParams) {
  const share = course.lead + (time * COURSE.speed) / (COURSE.to - COURSE.from);

  return share - Math.floor(share);
}

type GetVoyagerPositionParams = { course: VoyagerCourse; share: number };

export function getVoyagerPosition({
  course,
  share,
}: GetVoyagerPositionParams): [number, number, number] {
  const distance = COURSE.from + (COURSE.to - COURSE.from) * share;
  const [x, y, z] = course.heading;

  return [x * distance, y * distance, z * distance];
}

// 0 to 1: how much of a probe shows, `share` of the way along its course.
export function getVoyagerFade(share: number) {
  return Math.min(1, share / FADE_SHARE, (1 - share) / FADE_SHARE);
}
