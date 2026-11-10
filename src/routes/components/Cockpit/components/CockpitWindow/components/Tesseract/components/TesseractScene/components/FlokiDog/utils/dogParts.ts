// Floki, sitting, facing +z, in his own units (about 2.2 tall), the ground under him at y 0.
// His body is built from stretched balls and rounded rods; his head hangs off a pivot at the top
// of his neck so it can turn.
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
export type DogPart = Ball | Rod;

const QUARTER_TURN = Math.PI / 2;
// How far each side sits from his middle: mirrored for the other side.
const SIDES = [
  { id: "left", sign: -1 },
  { id: "right", sign: 1 },
] as const;

// Everything covered in fur below the neck: haunches, back, chest, neck and legs.
export const BODY_PARTS: readonly DogPart[] = [
  { id: "haunch", shape: "ball", position: [0, 0.45, -0.3], scale: [0.42, 0.42, 0.5] },
  {
    id: "back",
    shape: "ball",
    position: [0, 0.74, -0.06],
    scale: [0.35, 0.5, 0.42],
    rotation: [-0.5, 0, 0],
  },
  { id: "chest", shape: "ball", position: [0, 1.02, 0.2], scale: [0.33, 0.44, 0.35] },
  // The ruff of longer fur down the front of his neck.
  { id: "ruff", shape: "ball", position: [0, 1.24, 0.34], scale: [0.2, 0.26, 0.16] },
  {
    id: "neck",
    shape: "rod",
    position: [0, 1.38, 0.27],
    radius: 0.2,
    length: 0.36,
    rotation: [0.25, 0, 0],
  },
  ...SIDES.flatMap(({ id, sign }): DogPart[] => [
    {
      id: `${id}FrontLeg`,
      shape: "rod",
      position: [sign * 0.17, 0.5, 0.3],
      radius: 0.085,
      length: 0.74,
    },
    {
      id: `${id}FrontPaw`,
      shape: "ball",
      position: [sign * 0.17, 0.07, 0.38],
      scale: [0.11, 0.07, 0.16],
    },
    {
      id: `${id}Thigh`,
      shape: "ball",
      position: [sign * 0.36, 0.36, -0.2],
      scale: [0.2, 0.33, 0.36],
    },
    {
      id: `${id}HindPaw`,
      shape: "ball",
      position: [sign * 0.38, 0.06, 0.12],
      scale: [0.1, 0.06, 0.2],
    },
  ]),
];

// The top of his neck, where his head turns.
export const HEAD_PIVOT: Triple = [0, 1.56, 0.32];

// His head, from that pivot: skull, the top of his muzzle and his lower jaw, a little open.
export const HEAD_PARTS: readonly DogPart[] = [
  { id: "skull", shape: "ball", position: [0, 0.17, 0.02], scale: [0.25, 0.235, 0.29] },
  // The flat of his forehead, sloping down to the muzzle.
  { id: "brow", shape: "ball", position: [0, 0.2, 0.2], scale: [0.17, 0.13, 0.17] },
  {
    id: "muzzle",
    shape: "rod",
    position: [0, 0.09, 0.4],
    radius: 0.098,
    length: 0.32,
    rotation: [QUARTER_TURN - 0.08, 0, 0],
  },
  {
    id: "jaw",
    shape: "rod",
    position: [0, -0.03, 0.34],
    radius: 0.066,
    length: 0.24,
    rotation: [QUARTER_TURN + 0.3, 0, 0],
  },
];

export const NOSE = { position: [0, 0.115, 0.66], radius: 0.056 } as const;
export const TONGUE = {
  position: [0, -0.09, 0.47],
  radius: 0.055,
  length: 0.17,
  lean: 0.35,
} as const;
export const EYES = SIDES.map(({ id, sign }) => ({
  id,
  position: [sign * 0.112, 0.225, 0.275] as const,
  radius: 0.046,
}));
// Tall, pointed and broad at the base, set apart on top of his skull and leaning out a little.
export const EARS = SIDES.map(({ id, sign }) => ({
  id,
  position: [sign * 0.15, 0.33, -0.02] as const,
  lean: -sign * 0.2,
  radius: 0.155,
  height: 0.42,
}));

// His tail lies on the ground behind him, curling to one side; it swings from where it starts.
export const TAIL = { base: [0.12, 0.12, -0.62], radius: 0.07, length: 0.72, swing: 0.75 } as const;

// The harness: a collar, a plate across his chest with his name, a strap round his ribs, a
// plate on his back, and small lights.
export const HARNESS = {
  collar: { position: [0, 1.3, 0.26], radius: 0.235, tube: 0.045, lean: QUARTER_TURN + 0.25 },
  chestPlate: { position: [0, 1.0, 0.5], size: [0.5, 0.34, 0.1], lean: -0.15 },
  strap: { position: [0, 0.96, 0.1], radius: 0.4, tube: 0.05, stretch: 1.14 },
  backPlate: { position: [0, 1.2, -0.14], size: [0.4, 0.1, 0.5], lean: -0.5 },
  namePlate: { position: [0, 1.0, 0.557], size: [0.36, 0.11], lean: -0.15 },
} as const;

export const HARNESS_LIGHTS: readonly { id: string; position: Triple }[] = SIDES.flatMap(
  ({ id, sign }) => [
    { id: `${id}Upper`, position: [sign * 0.21, 1.14, 0.545] },
    { id: `${id}Lower`, position: [sign * 0.21, 0.87, 0.565] },
    { id: `${id}Shoulder`, position: [sign * 0.33, 1.18, 0.28] },
  ],
);
