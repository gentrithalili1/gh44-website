import { Euler, Vector3 } from "three";

export const CELL = 6;
export const BEAM = { thickness: 1.5, length: 44 } as const;
// How the whole lattice is turned (radians, x then y then z).
export const LATTICE_TILT = [0.34, 0.6, 0.12] as const;

export type BeamAxis = "x" | "y" | "z";
export type LatticeBeam = { id: string; axis: BeamAxis; position: [number, number, number] };

const OFFSETS = [-1.5, -0.5, 0.5, 1.5].map((steps) => steps * CELL);
const AXIS_DIRECTIONS: Record<BeamAxis, [number, number, number]> = {
  x: [1, 0, 0],
  y: [0, 1, 0],
  z: [0, 0, 1],
};

function place({ axis, a, b }: { axis: BeamAxis; a: number; b: number }): [number, number, number] {
  switch (axis) {
    case "x":
      return [0, a, b];
    case "y":
      return [a, 0, b];
    case "z":
      return [a, b, 0];
    default: {
      const unknownAxis: never = axis;
      return unknownAxis;
    }
  }
}

// The line the camera looks along, from behind Floki out to the camera: nothing may cross it.
export type Sightline = {
  from: [number, number, number];
  to: [number, number, number];
  // How far a beam's middle must stay from it.
  clearance: number;
};

const SIGHT_STEPS = 24;

// The closest a tilted beam's middle line comes to the sightline.
function getClearance({ beam, sightline }: { beam: LatticeBeam; sightline: Sightline }) {
  const tilt = new Euler(...LATTICE_TILT);
  const point = new Vector3(...beam.position).applyEuler(tilt);
  const direction = new Vector3(...AXIS_DIRECTIONS[beam.axis]).applyEuler(tilt);
  const from = new Vector3(...sightline.from);
  const to = new Vector3(...sightline.to);
  const sample = new Vector3();
  const toSample = new Vector3();
  let closest = Infinity;
  for (let step = 0; step <= SIGHT_STEPS; step++) {
    sample.lerpVectors(from, to, step / SIGHT_STEPS);
    toSample.subVectors(sample, point);
    // The part of the way to the sample that is not along the beam.
    const distance = toSample.addScaledVector(direction, -toSample.dot(direction)).length();
    closest = Math.min(closest, distance);
  }

  return closest;
}

export function getLatticeBeams(sightline: Sightline): LatticeBeam[] {
  const axes: readonly BeamAxis[] = ["x", "y", "z"];

  return axes
    .flatMap((axis) =>
      OFFSETS.flatMap((a) =>
        OFFSETS.map((b) => ({ id: `${axis}:${a}:${b}`, axis, position: place({ axis, a, b }) })),
      ),
    )
    .filter((beam) => getClearance({ beam, sightline }) >= sightline.clearance);
}
