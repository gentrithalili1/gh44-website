// Floki, sitting, facing +z, in his own units (about 2.3 tall), the ground under him at y 0.
// His body is built from stretched balls, rounded rods and tapered rods; his head hangs off a
// pivot at the top of his neck so it can turn, and his lower jaw off another so it can open.
export type Triple = readonly [number, number, number];

type Ball = { id: string; shape: "ball"; position: Triple; scale: Triple; rotation?: Triple };
type Rod = {
  id: string;
  shape: "rod";
  position: Triple;
  radius: number;
  length: number;
  rotation?: Triple;
};
// A rod that narrows from its near end to its far end.
type Taper = {
  id: string;
  shape: "taper";
  position: Triple;
  radius: number;
  endRadius: number;
  length: number;
  rotation?: Triple;
};
export type DogPart = Ball | Rod | Taper;

const QUARTER_TURN = Math.PI / 2;
// How far each side sits from his middle: mirrored for the other side.
const SIDES = [
  { id: "left", sign: -1 },
  { id: "right", sign: 1 },
] as const;

// Everything covered in fur below the neck: haunches, back, a deep chest, shoulders, the ruff
// of longer fur down his neck, and his legs, the hind ones folded under him.
export const BODY_PARTS: readonly DogPart[] = [
  { id: "haunch", shape: "ball", position: [0, 0.42, -0.34], scale: [0.4, 0.4, 0.5] },
  {
    id: "back",
    shape: "ball",
    position: [0, 0.72, -0.1],
    scale: [0.33, 0.52, 0.4],
    rotation: [-0.55, 0, 0],
  },
  { id: "chest", shape: "ball", position: [0, 1.04, 0.17], scale: [0.31, 0.42, 0.33] },
  { id: "ruff", shape: "ball", position: [0, 1.26, 0.3], scale: [0.22, 0.28, 0.18] },
  {
    id: "nape",
    shape: "ball",
    position: [0, 1.36, 0.06],
    scale: [0.2, 0.26, 0.2],
    rotation: [-0.4, 0, 0],
  },
  {
    id: "neck",
    shape: "taper",
    position: [0, 1.42, 0.25],
    radius: 0.2,
    endRadius: 0.16,
    length: 0.36,
    rotation: [0.3, 0, 0],
  },
  ...SIDES.flatMap(({ id, sign }): DogPart[] => [
    {
      id: `${id}Shoulder`,
      shape: "ball",
      position: [sign * 0.2, 1.06, 0.15],
      scale: [0.15, 0.27, 0.2],
    },
    {
      id: `${id}UpperLeg`,
      shape: "taper",
      position: [sign * 0.18, 0.72, 0.27],
      radius: 0.1,
      endRadius: 0.075,
      length: 0.46,
      rotation: [Math.PI + 0.05, 0, 0],
    },
    {
      id: `${id}LowerLeg`,
      shape: "taper",
      position: [sign * 0.18, 0.3, 0.3],
      radius: 0.072,
      endRadius: 0.058,
      length: 0.44,
      rotation: [Math.PI, 0, 0],
    },
    {
      id: `${id}FrontPaw`,
      shape: "ball",
      position: [sign * 0.18, 0.065, 0.37],
      scale: [0.1, 0.065, 0.16],
    },
    {
      id: `${id}Thigh`,
      shape: "ball",
      position: [sign * 0.34, 0.38, -0.2],
      scale: [0.2, 0.33, 0.36],
    },
    {
      id: `${id}Hock`,
      shape: "rod",
      position: [sign * 0.37, 0.1, 0],
      radius: 0.06,
      length: 0.26,
      rotation: [QUARTER_TURN, 0, 0],
    },
    {
      id: `${id}HindPaw`,
      shape: "ball",
      position: [sign * 0.38, 0.06, 0.2],
      scale: [0.095, 0.06, 0.17],
    },
  ]),
];

// The top of his neck, where his head turns.
export const HEAD_PIVOT: Triple = [0, 1.6, 0.32];

// His head, from that pivot: skull, cheeks, the flat of his forehead, and a long muzzle that
// narrows to the nose.
export const HEAD_PARTS: readonly DogPart[] = [
  { id: "skull", shape: "ball", position: [0, 0.16, 0], scale: [0.235, 0.225, 0.27] },
  { id: "brow", shape: "ball", position: [0, 0.2, 0.18], scale: [0.165, 0.11, 0.15] },
  ...SIDES.map(({ id, sign }): DogPart => ({
    id: `${id}Cheek`,
    shape: "ball",
    position: [sign * 0.115, 0.07, 0.11],
    scale: [0.11, 0.125, 0.16],
  })),
  {
    id: "muzzle",
    shape: "taper",
    position: [0, 0.095, 0.4],
    radius: 0.118,
    endRadius: 0.078,
    length: 0.38,
    rotation: [QUARTER_TURN - 0.05, 0, 0],
  },
  { id: "muzzleTip", shape: "ball", position: [0, 0.088, 0.58], scale: [0.092, 0.082, 0.075] },
];

// His lower jaw swings from the back of his mouth: a little open at rest, wider as he speaks.
export const JAW = {
  pivot: [0, 0.03, 0.18] as const,
  part: {
    id: "jaw",
    shape: "taper",
    position: [0, -0.035, 0.19],
    radius: 0.085,
    endRadius: 0.052,
    length: 0.34,
    rotation: [QUARTER_TURN, 0, 0],
  } satisfies DogPart,
  // A rounded end to the jaw, so its tip is not flat.
  tip: { position: [0, -0.035, 0.36], scale: [0.055, 0.05, 0.05] } as const,
  rest: 0.2,
  open: 0.42,
};
// Inside the jaw: his tongue lolls out over it.
export const TONGUE = {
  position: [0, -0.005, 0.3],
  radius: 0.05,
  length: 0.2,
  lean: QUARTER_TURN + 0.5,
} as const;

export const NOSE = { position: [0, 0.12, 0.63], scale: [0.058, 0.048, 0.05] } as const;
// Amber eyes under the brow, each with a dark pupil and a point of light.
export const EYES = SIDES.map(({ id, sign }) => ({
  id,
  position: [sign * 0.112, 0.215, 0.235] as const,
  radius: 0.042,
  // Which way it looks out of his head.
  facing: [sign * 0.35, 0.1, 0.93] as const,
}));
// Tall, pointed and broad at the base, set apart on top of his skull and leaning out a little.
export const EARS = SIDES.map(({ id, sign }) => ({
  id,
  position: [sign * 0.145, 0.31, -0.03] as const,
  lean: -sign * 0.2,
  radius: 0.15,
  height: 0.44,
}));

// His tail lies on the ground behind him, curling to one side, bushy and narrowing to its tip;
// it swings from where it starts.
export const TAIL = {
  base: [0.1, 0.14, -0.66],
  radius: 0.1,
  endRadius: 0.045,
  length: 0.78,
  swing: 0.75,
} as const;

// The harness: a collar, a plate across his chest with his name, straps from the collar down
// to a girth round his ribs, a plate on his back, and small lights.
export const HARNESS = {
  collar: { position: [0, 1.31, 0.25], radius: 0.225, tube: 0.045, lean: QUARTER_TURN + 0.28 },
  girth: { position: [0, 0.98, 0.1], radius: 0.385, tube: 0.045, stretch: 1.12 },
  chestPlate: { position: [0, 1.01, 0.49], size: [0.46, 0.32, 0.08], lean: -0.14 },
  chestFrame: { position: [0, 1.01, 0.5], size: [0.5, 0.36, 0.05], lean: -0.14 },
  backPlate: { position: [0, 1.2, -0.15], size: [0.38, 0.09, 0.46], lean: -0.52 },
  namePlate: { position: [0, 1.0, 0.535], size: [0.34, 0.105], lean: -0.14 },
} as const;
// Straps from the collar down to the chest plate, one each side.
export const HARNESS_STRAPS = SIDES.map(({ id, sign }) => ({
  id,
  position: [sign * 0.15, 1.2, 0.4] as const,
  rotation: [-0.2, 0, sign * 0.5] as const,
  size: [0.07, 0.3, 0.035] as const,
}));

export const HARNESS_LIGHTS: readonly { id: string; position: Triple }[] = SIDES.flatMap(
  ({ id, sign }) => [
    { id: `${id}Upper`, position: [sign * 0.2, 1.13, 0.535] },
    { id: `${id}Lower`, position: [sign * 0.2, 0.88, 0.555] },
    { id: `${id}Shoulder`, position: [sign * 0.345, 1.16, 0.26] },
  ],
);
