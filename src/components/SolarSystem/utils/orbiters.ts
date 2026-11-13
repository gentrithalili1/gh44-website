import type { PaletteColor } from "#/utils/palette";
import type { PlanetBody } from "#/utils/planets";
import { isCurrentRole, ROLES } from "#/utils/roles";

import { messages } from "../messages";
import type { Shade } from "../types";

// A darker spot on a rock moon, in system units from the rock's center (`y` down).
export type OrbiterCrater = { x: number; y: number; radius: number };

type OrbiterBase = {
  id: string;
  // Named on hover; Earth's moon stays unnamed.
  label?: string;
  color: PaletteColor;
  shade: Shade;
  isHighlighted: boolean;
  radius: number;
  orbitRadius: number;
  // Starting angle (radians) and angular speed (radians per second).
  phase: number;
  speed: number;
};

// How much a rock is drawn out along each axis: 1 everywhere is round, like Neptune's.
export type OrbiterStretch = { x: number; y: number; z: number };

// A moon, or a gray cratered rock, on a tilted orbit around its planet.
export type Orbiter =
  | (OrbiterBase & { kind: "moon" })
  | (OrbiterBase & { kind: "rock"; craters: OrbiterCrater[]; stretch: OrbiterStretch });

const MOON_GAP = 12;
const COMPANY_GAP = 10;
const COMPANY_STEP = 5;
const ANGLE_STEP = 0.79;
const MOON_SPEED = 0.18;
const COMPANY_SPEED = 0.9;
const ROCK_SPEED = 0.7;
const ROUND: OrbiterStretch = { x: 1, y: 1, z: 1 };
const AGENT_IDS = ["implementer", "researcher", "verifier", "reviewer"] as const;
const ROCK_GAP = 7;
const ROCK_STEP = 4.5;
// Each agent's rock is its own size.
const ROCK_RADII = [2.4, 2, 2.7, 2.2] as const;
// In rock radii: a few craters, turned a little differently on each rock.
const ROCK_CRATERS = [
  { x: -0.35, y: -0.3, radius: 0.28 },
  { x: 0.35, y: 0.05, radius: 0.22 },
  { x: -0.1, y: 0.45, radius: 0.18 },
] as const;
const MARS_MOONS = [
  {
    id: "phobos",
    radius: 2.2,
    stretch: { x: 1.25, y: 0.95, z: 0.8 },
    gap: 6,
    speed: 1.2,
    phase: 1,
    turn: 0.4,
  },
  {
    id: "deimos",
    radius: 1.5,
    stretch: { x: 1.15, y: 0.9, z: 0.85 },
    gap: 13,
    speed: 0.35,
    phase: 1 + Math.PI,
    turn: 2.1,
  },
] as const;

type GetRockCratersParams = { radius: number; turn: number };

function getRockCraters({ radius, turn }: GetRockCratersParams): OrbiterCrater[] {
  const cos = Math.cos(turn);
  const sin = Math.sin(turn);

  return ROCK_CRATERS.map((crater) => ({
    x: (crater.x * cos - crater.y * sin) * radius,
    y: (crater.x * sin + crater.y * cos) * radius,
    radius: crater.radius * radius,
  }));
}

// Outer orbiters move slower, like real ones.
function getSpeed({ base, index }: { base: number; index: number }) {
  return base / (1 + index * 0.45);
}

export function getOrbiters(planet: PlanetBody): Orbiter[] {
  const orbiters = planet.features.orbiters;

  switch (orbiters) {
    case undefined:
      return [];
    case "moon":
      return [
        {
          id: "moon",
          kind: "moon",
          color: "neutral",
          shade: "soft",
          isHighlighted: true,
          radius: 3,
          orbitRadius: planet.size + MOON_GAP,
          phase: 0.9,
          speed: MOON_SPEED,
        },
      ];
    case "companies":
      return ROLES.map((role, index) => {
        const isCurrent = isCurrentRole(role);

        return {
          id: role.id,
          label: messages.companyMoon(role),
          kind: "moon",
          color: isCurrent ? planet.color : "neutral",
          shade: isCurrent ? "vivid" : "soft",
          isHighlighted: isCurrent,
          radius: isCurrent ? 3.2 : 2.3,
          orbitRadius: planet.size + COMPANY_GAP + index * COMPANY_STEP,
          phase: index * ANGLE_STEP,
          speed: getSpeed({ base: COMPANY_SPEED, index }),
        };
      });
    case "probes":
      return MARS_MOONS.map((moon) => ({
        id: moon.id,
        label: messages.marsMoons[moon.id],
        kind: "rock",
        color: "neutral",
        shade: "vivid",
        isHighlighted: false,
        radius: moon.radius,
        craters: getRockCraters({ radius: moon.radius, turn: moon.turn }),
        stretch: moon.stretch,
        orbitRadius: planet.size + moon.gap,
        phase: moon.phase,
        speed: moon.speed,
      }));
    case "agents":
      return AGENT_IDS.map((id, index) => {
        const radius = ROCK_RADII[index];

        return {
          id,
          label: messages.brainAgents[id],
          kind: "rock",
          color: "neutral",
          shade: "vivid",
          isHighlighted: false,
          radius,
          craters: getRockCraters({ radius, turn: index * 1.7 }),
          stretch: ROUND,
          orbitRadius: planet.size + ROCK_GAP + index * ROCK_STEP,
          phase: 0.4 + index * 1.6,
          speed: getSpeed({ base: ROCK_SPEED, index }),
        };
      });
    default: {
      const unknownOrbiters: never = orbiters;
      return unknownOrbiters;
    }
  }
}
