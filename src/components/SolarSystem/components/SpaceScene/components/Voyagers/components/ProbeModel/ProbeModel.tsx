import { DoubleSide } from "three";

import { PALETTE } from "#/utils/palette";

// The probe in its own units, its dish opening toward +z: the big white dish with its feed, the
// ten-sided bus behind it, the long magnetometer boom to one side, the power source on a short
// boom to the other, the instrument boom, and two whip antennas.
const QUARTER_TURN = Math.PI / 2;
const DISH = { radius: 3.7, depth: 1.2 } as const;
const BUS = { radius: 1.5, length: 1, sides: 10, z: -1 } as const;
const DISH_TOP = DISH.radius * 1.4;
const ROUND = 20;
const THIN = 6;
// Drawn far larger than life, or it would be lost among the stars.
export const PROBE_SCALE = 3.2;
// From its middle to the end of its longest boom, and to the top of its dish, as drawn.
export const PROBE_REACH = 9 * PROBE_SCALE;
export const PROBE_TOP = DISH_TOP * PROBE_SCALE;

const WHITE = PALETTE.neutral.soft;
const GOLD = PALETTE.ochre.soft;
const GREY = PALETTE.neutral.vivid;

// Every strut: where its middle is, how it leans, how long and thick it is, and its color.
const STRUTS = [
  // The magnetometer boom, by far the longest.
  {
    id: "magnetometer",
    position: [7.4, -1.9, BUS.z],
    lean: QUARTER_TURN + 0.25,
    length: 13,
    radius: 0.1,
    color: GREY,
  },
  {
    id: "powerBoom",
    position: [-2.7, -0.8, BUS.z],
    lean: QUARTER_TURN - 0.3,
    length: 3,
    radius: 0.12,
    color: GREY,
  },
  {
    id: "power",
    position: [-4.9, -1.5, BUS.z],
    lean: QUARTER_TURN - 0.3,
    length: 2.4,
    radius: 0.5,
    color: GREY,
  },
  {
    id: "instrumentBoom",
    position: [-1.5, 2.3, BUS.z],
    lean: 0.6,
    length: 3.6,
    radius: 0.12,
    color: GOLD,
  },
  {
    id: "whipLeft",
    position: [-1.3, -5.2, BUS.z - 0.4],
    lean: 0.24,
    length: 9,
    radius: 0.05,
    color: GOLD,
  },
  {
    id: "whipRight",
    position: [0.9, -5.3, BUS.z - 0.6],
    lean: -0.16,
    length: 9,
    radius: 0.05,
    color: GOLD,
  },
] as const;

// A Voyager probe. Decorative: whoever flies it adds the pointer target and the name.
export function ProbeModel() {
  return (
    <group scale={PROBE_SCALE}>
      <mesh rotation-x={-QUARTER_TURN} position-z={DISH.depth / 2}>
        <coneGeometry args={[DISH.radius, DISH.depth, ROUND, 1, true]} />
        <meshLambertMaterial color={WHITE} side={DoubleSide} />
      </mesh>
      <mesh rotation-x={QUARTER_TURN} position-z={DISH.depth + 0.3}>
        <cylinderGeometry args={[0.28, 0.4, 0.9, THIN * 2]} />
        <meshLambertMaterial color={WHITE} />
      </mesh>
      <mesh rotation-x={QUARTER_TURN} position-z={BUS.z}>
        <cylinderGeometry args={[BUS.radius, BUS.radius, BUS.length, BUS.sides]} />
        <meshLambertMaterial color={GOLD} />
      </mesh>
      <mesh position={[-2.6, 3.9, BUS.z]}>
        <boxGeometry args={[1.3, 1.1, 1]} />
        <meshLambertMaterial color={GOLD} />
      </mesh>
      {STRUTS.map((strut) => (
        <mesh key={strut.id} position={[...strut.position]} rotation-z={strut.lean}>
          <cylinderGeometry args={[strut.radius, strut.radius, strut.length, THIN]} />
          <meshLambertMaterial color={strut.color} />
        </mesh>
      ))}
    </group>
  );
}
