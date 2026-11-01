// A single shooting star every 5 seconds, a meteor shower every 10. A single due inside a
// shower's window is skipped.
export const SINGLE_INTERVAL = 5;
export const SHOWER_INTERVAL = 10;
const SHOWER_CLEARANCE = 2.5;

// One slot for the single, the rest for a shower's meteors.
const MAX_SHOWER_METEORS = 8;
export const METEOR_SLOTS = 1 + MAX_SHOWER_METEORS;
// Floats each meteor's outline takes: four corners of x, y, z.
export const METEOR_OUTLINE_SIZE = 12;

const MIN_SHOWER_METEORS = 5;
// The radiant sits off screen in any direction, this share of the screen's diagonal from its
// middle; meteors start between these shares of the diagonal out of it.
const RADIANT_DISTANCE = 0.6;
const MIN_SHOWER_DISTANCE = 0.2;
const SHOWER_DISTANCE_RANGE = 0.55;
const SHOWER_SPREAD_SECONDS = 1.5;
// Radians: a shower aims near the screen's middle, each meteor a little off.
const SHOWER_AIM_JITTER = 0.5;
const METEOR_HEADING_SPREAD = 0.24;
// Pixels per second, and seconds of flight the tail trails behind the head.
const SINGLE_SPEED = 570;
const SINGLE_TAIL_SECONDS = 0.22;
const MIN_SHOWER_SPEED = 480;
const SHOWER_SPEED_RANGE = 160;
const MIN_SHOWER_TAIL_SECONDS = 0.16;
const SHOWER_TAIL_RANGE = 0.1;
// Each meteor fades out over about a second.
const FADE_PER_SECOND = 0.9;
// Pixels across the head; the tail narrows to a point.
const HEAD_WIDTH = 1.6;
// Singles start anywhere but the screen's outer tenth, so they show before fading.
const SINGLE_MARGIN = 0.1;
const FULL_TURN = Math.PI * 2;

// A shooting star in screen pixels (`y` down). `delay` holds it back; `life` runs 1 to 0.
export type Meteor = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tailSeconds: number;
  delay: number;
  life: number;
};

type Viewport = { width: number; height: number };
type Random = () => number;

export function createMeteors(): Meteor[] {
  return Array.from({ length: METEOR_SLOTS }, () => ({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    tailSeconds: 0,
    delay: 0,
    life: 0,
  }));
}

// Whether a single due at `time` (seconds) would land inside a shower.
export function isInShower(time: number) {
  const nearestShower = Math.round(time / SHOWER_INTERVAL) * SHOWER_INTERVAL;

  return nearestShower > 0 && Math.abs(time - nearestShower) < SHOWER_CLEARANCE;
}

type LaunchSingleParams = { meteor: Meteor; viewport: Viewport; random: Random };

// One shooting star, somewhere on screen, heading any way.
export function launchSingle({ meteor, viewport, random }: LaunchSingleParams) {
  const heading = random() * FULL_TURN;
  meteor.x = viewport.width * (SINGLE_MARGIN + random() * (1 - 2 * SINGLE_MARGIN));
  meteor.y = viewport.height * (SINGLE_MARGIN + random() * (1 - 2 * SINGLE_MARGIN));
  meteor.vx = Math.cos(heading) * SINGLE_SPEED;
  meteor.vy = Math.sin(heading) * SINGLE_SPEED;
  meteor.tailSeconds = SINGLE_TAIL_SECONDS;
  meteor.delay = 0;
  meteor.life = 1;
}

type LaunchShowerParams = { meteors: Meteor[]; viewport: Viewport; random: Random };

// 5 to 8 meteors flying out of one radiant off any side or corner of the screen, toward its
// middle, one after another, each a little faster or slower and longer or shorter. Fills the
// shower slots, after the single's.
export function launchShower({ meteors, viewport, random }: LaunchShowerParams) {
  const count =
    MIN_SHOWER_METEORS + Math.floor(random() * (MAX_SHOWER_METEORS - MIN_SHOWER_METEORS + 1));
  const reach = Math.hypot(viewport.width, viewport.height);
  const side = random() * FULL_TURN;
  const radiant = {
    x: viewport.width / 2 + Math.cos(side) * reach * RADIANT_DISTANCE,
    y: viewport.height / 2 + Math.sin(side) * reach * RADIANT_DISTANCE,
  };
  // Back toward the middle, a little off.
  const heading = side + Math.PI + (random() - 0.5) * SHOWER_AIM_JITTER;

  for (let index = 0; index < count; index++) {
    const meteor = meteors[1 + index];
    if (!meteor) continue;
    const angle = heading + (random() - 0.5) * METEOR_HEADING_SPREAD;
    const distance = reach * (MIN_SHOWER_DISTANCE + random() * SHOWER_DISTANCE_RANGE);
    const speed = MIN_SHOWER_SPEED + random() * SHOWER_SPEED_RANGE;
    meteor.x = radiant.x + Math.cos(angle) * distance;
    meteor.y = radiant.y + Math.sin(angle) * distance;
    meteor.vx = Math.cos(angle) * speed;
    meteor.vy = Math.sin(angle) * speed;
    meteor.tailSeconds = MIN_SHOWER_TAIL_SECONDS + random() * SHOWER_TAIL_RANGE;
    meteor.delay = random() * SHOWER_SPREAD_SECONDS;
    meteor.life = 1;
  }

  return { count, radiant };
}

type StepMeteorParams = { meteor: Meteor; delta: number };

// Moves a meteor `delta` seconds on, in place, once its delay has passed.
export function stepMeteor({ meteor, delta }: StepMeteorParams) {
  if (meteor.life <= 0) return;
  const flight = Math.max(delta - meteor.delay, 0);
  meteor.delay = Math.max(meteor.delay - delta, 0);
  if (flight === 0) return;
  meteor.x += meteor.vx * flight;
  meteor.y += meteor.vy * flight;
  meteor.life = Math.max(meteor.life - FADE_PER_SECOND * flight, 0);
}

type WriteMeteorOutlineParams = { meteor: Meteor; positions: Float32Array; slot: number };

// Writes a meteor's streak into its slot of `positions`: the head's two edges, then the tail's
// point twice. No allocation, so it can run every frame.
export function writeMeteorOutline({ meteor, positions, slot }: WriteMeteorOutlineParams) {
  const speed = Math.hypot(meteor.vx, meteor.vy) || 1;
  const acrossX = (-meteor.vy / speed) * (HEAD_WIDTH / 2);
  const acrossY = (meteor.vx / speed) * (HEAD_WIDTH / 2);
  const tailX = meteor.x - meteor.vx * meteor.tailSeconds;
  const tailY = meteor.y - meteor.vy * meteor.tailSeconds;
  const offset = slot * METEOR_OUTLINE_SIZE;

  positions[offset] = meteor.x + acrossX;
  positions[offset + 1] = meteor.y + acrossY;
  positions[offset + 3] = meteor.x - acrossX;
  positions[offset + 4] = meteor.y - acrossY;
  positions[offset + 6] = tailX;
  positions[offset + 7] = tailY;
  positions[offset + 9] = tailX;
  positions[offset + 10] = tailY;
}
