import type { PaletteColor } from "#/utils/palette";
import type { Planet } from "#/utils/planets";
import { isCurrentRole, ROLES } from "#/utils/roles";
import { THEME_TOOLS } from "#/utils/themeTools";

// Moon orbits are ellipses tilted away from the viewer.
const MOON_TILT = 0.34;
const MOON_GAP = 12;
const MOON_ANGLE_STEP = 0.79;
const MOON_STEPS = { roles: 6.5, tools: 5 } as const;
const PAST_ROLE_COLOR = "neutral" satisfies PaletteColor;

// A still frame of the preview's pulse: three rings partway out.
const SIGNAL_PROGRESS = [0.15, 0.48, 0.81] as const;
const BAND_OFFSETS = [-0.6, -0.25, 0.1, 0.45] as const;
const ROCKET_ANGLE = 0.6;
const RADIANS_TO_DEGREES = 180 / Math.PI;

type MoonData = { id: string; label: string; color: PaletteColor; isBig: boolean };

function getMoonData(planet: Planet): MoonData[] {
  switch (planet.features.moons) {
    case undefined:
      return [];
    case "roles":
      return ROLES.map((role) => {
        const isCurrent = isCurrentRole(role);

        return {
          id: role.id,
          label: `${role.company} · ${role.title}`,
          color: isCurrent ? planet.color : PAST_ROLE_COLOR,
          isBig: isCurrent,
        };
      });
    case "tools":
      return THEME_TOOLS.map((tool) => ({
        id: tool.id,
        label: `gh44 for ${tool.name}`,
        color: tool.color,
        isBig: true,
      }));
    default: {
      const unknownMoons: never = planet.features.moons;
      return unknownMoons;
    }
  }
}

// Moons on the near side (below the planet's center) draw in front of it.
export function getMoons(planet: Planet) {
  const moons = planet.features.moons;
  const step = moons ? MOON_STEPS[moons] : 0;

  return getMoonData(planet).map((moon, index) => {
    const orbitRadius = planet.size + MOON_GAP + index * step;
    const angle = index * MOON_ANGLE_STEP;
    const y = Math.sin(angle) * orbitRadius * MOON_TILT;

    return {
      ...moon,
      orbitRadius,
      orbitTilt: orbitRadius * MOON_TILT,
      x: Math.cos(angle) * orbitRadius,
      y,
      isInFront: y > 0,
    };
  });
}

export function getSignalRings(planet: Planet) {
  return SIGNAL_PROGRESS.map((progress) => ({
    radius: planet.size * (1 + progress * 2.4),
    opacity: (1 - progress) * 0.55,
  }));
}

export function getBands(planet: Planet) {
  return BAND_OFFSETS.map((offset) => ({
    y: planet.size * offset,
    height: planet.size * 0.18,
  }));
}

export function getRocketTransform(planet: Planet) {
  const distance = planet.size + MOON_GAP;
  const x = Math.cos(ROCKET_ANGLE) * distance;
  const y = Math.sin(ROCKET_ANGLE) * distance;

  return `translate(${x} ${y}) rotate(${ROCKET_ANGLE * RADIANS_TO_DEGREES + 180})`;
}
