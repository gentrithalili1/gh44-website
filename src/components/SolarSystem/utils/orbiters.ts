import { GMAIL_COMPOSE_URL } from "#/utils/contact";
import type { PaletteColor } from "#/utils/palette";
import type { Planet } from "#/utils/planets";
import { isCurrentRole, ROLES } from "#/utils/roles";

import { messages } from "../messages";
import type { Shade } from "../types";

// A moon or an artificial satellite on a tilted orbit around its planet.
export type Orbiter = {
  id: string;
  label: string;
  kind: "moon" | "satellite";
  color: PaletteColor;
  shade: Shade;
  isHighlighted: boolean;
  radius: number;
  orbitRadius: number;
  // Starting angle (radians) and angular speed (radians per second).
  phase: number;
  speed: number;
  // Opens in a new tab when clicked while its planet is open.
  link?: { href: string; label: string };
};

const MOON_GAP = 12;
const COMPANY_GAP = 10;
const COMPANY_STEP = 5;
const SATELLITE_GAP = 8;
const SATELLITE_STEP = 5;
const ANGLE_STEP = 0.79;
const MOON_SPEED = 0.18;
const COMPANY_SPEED = 0.9;
const SATELLITE_SPEED = 0.7;
const AGENT_IDS = ["implementer", "researcher", "verifier", "reviewer"] as const;
const PROBE_IDS = ["resolve", "reject"] as const;

// Outer orbiters move slower, like real ones.
function getSpeed({ base, index }: { base: number; index: number }) {
  return base / (1 + index * 0.45);
}

export function getOrbiters(planet: Planet): Orbiter[] {
  const orbiters = planet.features.orbiters;

  switch (orbiters) {
    case undefined:
      return [];
    case "moon":
      return [
        {
          id: "moon",
          label: messages.earthMoon,
          kind: "moon",
          color: "neutral",
          shade: "soft",
          isHighlighted: true,
          radius: 3,
          orbitRadius: planet.size + MOON_GAP,
          phase: 0.9,
          speed: MOON_SPEED,
          link: { href: GMAIL_COMPOSE_URL, label: messages.writeInGmail },
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
      return PROBE_IDS.map((id, index) => ({
        id,
        label: messages.marsSatellites[id],
        kind: "satellite",
        color: "neutral",
        shade: "soft",
        isHighlighted: false,
        radius: 1.6,
        orbitRadius: planet.size + SATELLITE_GAP + index * SATELLITE_STEP,
        phase: 1 + index * Math.PI,
        speed: getSpeed({ base: SATELLITE_SPEED, index }),
      }));
    case "agents":
      return AGENT_IDS.map((id, index) => ({
        id,
        label: messages.brainAgents[id],
        kind: "satellite",
        color: "blue",
        shade: "soft",
        isHighlighted: false,
        radius: 1.8,
        orbitRadius: planet.size + SATELLITE_GAP + index * SATELLITE_STEP,
        phase: 0.4 + index * 1.6,
        speed: getSpeed({ base: SATELLITE_SPEED, index }),
      }));
    default: {
      const unknownOrbiters: never = orbiters;
      return unknownOrbiters;
    }
  }
}
