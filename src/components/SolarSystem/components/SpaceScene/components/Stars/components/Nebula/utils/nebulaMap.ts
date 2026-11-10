import { PALETTE } from "#/utils/palette";

// The sky's faint band of far-off stars and dust, baked once into a map that wraps the star
// shell: twice as wide as tall, like any globe's.
export const NEBULA_MAP_WIDTH = 512;
export const NEBULA_MAP_HEIGHT = 256;
// The band's thickest spot is this opaque: it stays behind the stars, never a surface.
const MAX_ALPHA = 0.3;
// Below this share of the band's density a pixel stays empty, and skips the noise.
const EMPTY_BELOW = 0.02;
// The band circles the sky at a slant: this direction points away from its plane.
const BAND_AXIS = normalize({ x: 0.35, y: 0.8, z: 0.48 });
// How thin the band is: higher is thinner.
const BAND_TIGHTNESS = 9;
const OCTAVES = 4;
const CHANNELS = 4;
const BAND_COLORS = [PALETTE.lavender.soft, PALETTE.sky.soft, PALETTE.rose.soft] as const;

type Vector = { x: number; y: number; z: number };

function normalize({ x, y, z }: Vector): Vector {
  const length = Math.hypot(x, y, z);

  return { x: x / length, y: y / length, z: z / length };
}

function getFraction(value: number) {
  return value - Math.floor(value);
}

// A fixed pseudo-random number from 0 to 1 for a grid corner.
function getCornerValue({ x, y, z }: Vector) {
  return getFraction(Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453);
}

function ease(amount: number) {
  return amount * amount * (3 - 2 * amount);
}

function mix({ from, to, amount }: { from: number; to: number; amount: number }) {
  return from + (to - from) * amount;
}

// Smooth noise from 0 to 1: the eight grid corners around a point, blended.
function getNoise({ x, y, z }: Vector) {
  const cell = { x: Math.floor(x), y: Math.floor(y), z: Math.floor(z) };
  const blend = { x: ease(x - cell.x), y: ease(y - cell.y), z: ease(z - cell.z) };
  const corner = (dx: number, dy: number, dz: number) =>
    getCornerValue({ x: cell.x + dx, y: cell.y + dy, z: cell.z + dz });
  const near = mix({
    from: mix({ from: corner(0, 0, 0), to: corner(1, 0, 0), amount: blend.x }),
    to: mix({ from: corner(0, 1, 0), to: corner(1, 1, 0), amount: blend.x }),
    amount: blend.y,
  });
  const far = mix({
    from: mix({ from: corner(0, 0, 1), to: corner(1, 0, 1), amount: blend.x }),
    to: mix({ from: corner(0, 1, 1), to: corner(1, 1, 1), amount: blend.x }),
    amount: blend.y,
  });

  return mix({ from: near, to: far, amount: blend.z });
}

// Cloudy noise from 0 to 1: finer and fainter layers of noise, summed.
function getClouds({ point, scale, offset }: { point: Vector; scale: number; offset: number }) {
  let sum = 0;
  let weight = 0.5;
  let frequency = scale;
  for (let octave = 0; octave < OCTAVES; octave++) {
    sum +=
      weight *
      getNoise({
        x: point.x * frequency + offset,
        y: point.y * frequency + offset,
        z: point.z * frequency + offset,
      });
    frequency *= 2.03;
    weight *= 0.5;
  }

  return sum / (1 - 0.5 ** OCTAVES);
}

function getStep({ from, to, value }: { from: number; to: number; value: number }) {
  return ease(Math.max(0, Math.min(1, (value - from) / (to - from))));
}

function getChannels(hex: string) {
  return [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255);
}

// How dense the band is toward a direction (0 to 1), and which way its color leans (0 to 1).
export function getNebulaAt(direction: Vector) {
  const offPlane =
    direction.x * BAND_AXIS.x + direction.y * BAND_AXIS.y + direction.z * BAND_AXIS.z;
  const band = Math.exp(-BAND_TIGHTNESS * offPlane ** 2);
  if (band < EMPTY_BELOW) return { density: 0, lean: 0 };
  const clumps = getStep({
    from: 0.3,
    to: 0.75,
    value: getClouds({ point: direction, scale: 2.2, offset: 0 }),
  });
  const wisps = getClouds({ point: direction, scale: 5.5, offset: 11 });
  // Dark dust lanes cut through the band.
  const lanes = getStep({
    from: 0.38,
    to: 0.56,
    value: getClouds({ point: direction, scale: 3.6, offset: 31 }),
  });

  return { density: band * clumps * (0.45 + 0.55 * wisps) * (0.25 + 0.75 * lanes), lean: wisps };
}

// The band as RGBA pixels from 0 to 1, row by row from the shell's south pole up, as three's
// sphere wraps them. Fractions, not bytes: a glow this faint shows its steps in 8 bits. Colors
// are palette hues, sRGB as written.
export function createNebulaMap() {
  const pixels = new Float32Array(NEBULA_MAP_WIDTH * NEBULA_MAP_HEIGHT * CHANNELS);
  const colors = BAND_COLORS.map(getChannels);
  for (let row = 0; row < NEBULA_MAP_HEIGHT; row++) {
    const fromPole = (1 - (row + 0.5) / NEBULA_MAP_HEIGHT) * Math.PI;
    for (let column = 0; column < NEBULA_MAP_WIDTH; column++) {
      const around = ((column + 0.5) / NEBULA_MAP_WIDTH) * Math.PI * 2;
      const { density, lean } = getNebulaAt({
        x: -Math.cos(around) * Math.sin(fromPole),
        y: Math.cos(fromPole),
        z: Math.sin(around) * Math.sin(fromPole),
      });
      if (density === 0) continue;
      // Along the color list: lavender through sky to rose.
      const spot = Math.max(0, Math.min(0.999, getStep({ from: 0.3, to: 0.7, value: lean })));
      const index = Math.floor(spot * (colors.length - 1));
      const amount = spot * (colors.length - 1) - index;
      const pixel = (row * NEBULA_MAP_WIDTH + column) * CHANNELS;
      for (let channel = 0; channel < 3; channel++) {
        pixels[pixel + channel] = mix({
          from: colors[index]?.[channel] ?? 0,
          to: colors[index + 1]?.[channel] ?? 0,
          amount,
        });
      }
      pixels[pixel + 3] = density * MAX_ALPHA;
    }
  }

  return pixels;
}
