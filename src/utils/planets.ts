import type { PaletteColor } from "./palette";
import { ROLES } from "./roles";
import { THEME_TOOLS } from "./themeTools";

export type PlanetFeatures = {
  // Drawn on the body: Mercury's craters, Venus' clouds, Earth's landmasses, Mars' dust,
  // Jupiter's bands and red spot, Neptune's haze.
  surface?: "craters" | "clouds" | "continents" | "dust" | "storms" | "haze";
  // Earth's moon, Jupiter's company moons, Mars' satellites, Neptune's agent satellites.
  orbiters?: "moon" | "companies" | "probes" | "agents";
  // Saturn's rings, one band per app; Uranus' thin ring, standing almost upright.
  rings?: "apps" | "upright";
  hasRocket?: boolean;
};

// The planets of the real solar system, from the sun outward.
export type RealPlanet =
  | "mercury"
  | "venus"
  | "earth"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune";

// How a planet looks and moves in the system.
export type PlanetBody = {
  id: string;
  // The real planet this one stands for: it sets how fast it orbits and spins.
  realPlanet: RealPlanet;
  name: string;
  color: PaletteColor;
  // Planet radius, orbit radius and starting angle (radians), in system units.
  size: number;
  orbit: { radius: number; phase: number };
  features: PlanetFeatures;
};

// A planet that holds a part of the site: it links to its own page.
export type Planet = PlanetBody & {
  kind: "site";
  // The panel heading; the name unless the planet stands for something else.
  title: string;
  sub: string;
  lede: string;
  seo: { title: string; description: string };
};

// A planet that only completes the system: no link and no page, until a project moves in.
export type DecorativePlanet = PlanetBody & { kind: "decorative" };

export type SolarPlanet = Planet | DecorativePlanet;

// The site's planets: Earth, Mars, Jupiter, Saturn and Neptune, in real order outward from the
// sun. Not to scale: the gaps grow outward and the whole system fits the screen.
export const PLANETS = [
  {
    kind: "site",
    id: "me",
    realPlanet: "earth",
    name: "me",
    title: "gentrit halili",
    sub: "who, where, how to reach",
    lede: "senior frontend engineer in pristina, kosovo. occasionally in orbit.",
    color: "blue",
    size: 12,
    orbit: { radius: 148, phase: 3.6 },
    features: { surface: "continents", orbiters: "moon" },
    seo: {
      title: "Contact Gentrit Halili | gh44.dev",
      description:
        "Gentrit Halili, senior frontend engineer in Pristina, Kosovo. Reach him by email, GitHub, LinkedIn or Instagram.",
    },
  },
  {
    kind: "site",
    id: "confirm",
    realPlanet: "mars",
    name: "gh44-confirm",
    title: "gh44-confirm",
    sub: "promise based react dialogs",
    lede: "react confirmation dialogs you can await. resolve means yes.",
    color: "terracotta",
    size: 10,
    orbit: { radius: 200, phase: 5.4 },
    features: { surface: "dust", orbiters: "probes", hasRocket: true },
    seo: {
      title: "gh44-confirm: Promise Based React Dialogs | gh44.dev",
      description:
        "gh44-confirm (react-promise-confirmation-dialog): promise based React dialogs. Await confirm(): resolve means yes, reject means no. v1.1.3 on npm.",
    },
  },
  {
    kind: "site",
    id: "work",
    realPlanet: "jupiter",
    name: "work",
    title: "work",
    sub: `${ROLES.length} moons · 2016 → now`,
    lede: "where i've worked. companies and roles, most recent first.",
    color: "ochre",
    size: 28,
    orbit: { radius: 280, phase: 2.2 },
    features: { surface: "storms", orbiters: "companies" },
    seo: {
      title: "Work: Gentrit Halili's Roles Since 2016 | gh44.dev",
      description:
        "Where Gentrit Halili has worked: JOIN, Belt Software, Povio and more, most recent first.",
    },
  },
  {
    kind: "site",
    id: "gh44-theme",
    realPlanet: "saturn",
    name: "gh44-theme",
    title: "gh44-theme",
    sub: `one theme, ${THEME_TOOLS.length} tools`,
    lede: "one palette for every tool i open. zed, warp, slack, linear, chrome, github, shadcn.",
    color: "sand",
    size: 21,
    orbit: { radius: 370, phase: 4.1 },
    features: { rings: "apps" },
    seo: {
      title: "gh44-theme: One Theme, 7 Tools | gh44.dev",
      description:
        "One color palette for Zed, Warp, Slack, Linear, Chrome, GitHub and shadcn/ui, in dark and light.",
    },
  },
  {
    kind: "site",
    id: "gh44-brain",
    realPlanet: "neptune",
    name: "gh44-brain",
    title: "gh44-brain",
    sub: "claude code, my way",
    lede: "clone it once and every claude code session works the way i do.",
    color: "blue",
    size: 16,
    orbit: { radius: 478, phase: 0.6 },
    features: { surface: "haze", orbiters: "agents" },
    seo: {
      title: "gh44-brain: Claude Code, Gentrit's Way | gh44.dev",
      description:
        "gh44-brain is Gentrit Halili's Claude Code setup: rules, skills, agents and hooks. Clone it once and every session works his way.",
    },
  },
] as const satisfies readonly Planet[];

// The planets with no page yet, between the site's own. Move one into PLANETS, with its copy, to
// attach a project to it.
export const DECORATIVE_PLANETS = [
  {
    kind: "decorative",
    id: "mercury",
    realPlanet: "mercury",
    name: "mercury",
    color: "terracotta",
    size: 6,
    orbit: { radius: 82, phase: 2.6 },
    features: { surface: "craters" },
  },
  {
    kind: "decorative",
    id: "venus",
    realPlanet: "venus",
    name: "venus",
    color: "sand",
    size: 9,
    orbit: { radius: 112, phase: 0.2 },
    features: { surface: "clouds" },
  },
  {
    kind: "decorative",
    id: "uranus",
    realPlanet: "uranus",
    name: "uranus",
    color: "seafoam",
    size: 13,
    orbit: { radius: 428, phase: 5.6 },
    features: { rings: "upright" },
  },
] as const satisfies readonly DecorativePlanet[];

// Every planet in the scene, from the sun outward.
export const SOLAR_SYSTEM: readonly SolarPlanet[] = [...PLANETS, ...DECORATIVE_PLANETS].sort(
  (planet, other) => planet.orbit.radius - other.orbit.radius,
);

export type PlanetId = (typeof PLANETS)[number]["id"];

export function findPlanet(id: string | undefined) {
  return PLANETS.find((planet) => planet.id === id);
}
