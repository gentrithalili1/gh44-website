import type { PaletteColor } from "./palette";
import { ROLES } from "./roles";
import { THEME_TOOLS } from "./themeTools";

export type PlanetFeatures = {
  // Drawn on the body: Earth's landmasses, Jupiter's bands and red spot, Neptune's haze.
  surface?: "continents" | "storms" | "haze";
  // Earth's moon, Jupiter's company moons, Mars' satellites, Neptune's agent satellites.
  orbiters?: "moon" | "companies" | "probes" | "agents";
  // Saturn's rings: one band per app.
  rings?: "apps";
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

export type Planet = {
  id: string;
  // The real planet this one stands for: it sets how fast it orbits and spins.
  realPlanet: RealPlanet;
  name: string;
  // The panel heading; the name unless the planet stands for something else.
  title: string;
  sub: string;
  lede: string;
  color: PaletteColor;
  // Planet radius, orbit radius and starting angle (radians), in system units.
  size: number;
  orbit: { radius: number; phase: number };
  features: PlanetFeatures;
  seo: { title: string; description: string };
};

// Earth, Mars, Jupiter, Saturn and Neptune, in real order outward from the sun. Not to scale: the gaps grow outward and the
// whole system fits the screen.
export const PLANETS = [
  {
    id: "me",
    realPlanet: "earth",
    name: "me",
    title: "gentrit halili",
    sub: "who, where, how to reach",
    lede: "senior frontend engineer in pristina, kosovo. occasionally in orbit.",
    color: "blue",
    size: 12,
    orbit: { radius: 105, phase: 3.6 },
    features: { surface: "continents", orbiters: "moon" },
    seo: {
      title: "Contact Gentrit Halili | gh44.dev",
      description:
        "Gentrit Halili, senior frontend engineer in Pristina, Kosovo. Reach him by email, GitHub, LinkedIn or Instagram.",
    },
  },
  {
    id: "confirm",
    realPlanet: "mars",
    name: "gh44-confirm",
    title: "gh44-confirm",
    sub: "promise based react dialogs",
    lede: "react confirmation dialogs you can await. resolve means yes.",
    color: "terracotta",
    size: 10,
    orbit: { radius: 160, phase: 5.4 },
    features: { orbiters: "probes", hasRocket: true },
    seo: {
      title: "gh44-confirm: Promise Based React Dialogs | gh44.dev",
      description:
        "gh44-confirm (react-promise-confirmation-dialog): promise based React dialogs. Await confirm(): resolve means yes, reject means no. v1.1.3 on npm.",
    },
  },
  {
    id: "work",
    realPlanet: "jupiter",
    name: "work",
    title: "work",
    sub: `${ROLES.length} moons · 2016 → now`,
    lede: "where i've worked. companies and roles, most recent first.",
    color: "ochre",
    size: 30,
    orbit: { radius: 245, phase: 2.2 },
    features: { surface: "storms", orbiters: "companies" },
    seo: {
      title: "Work: Gentrit Halili's Roles Since 2016 | gh44.dev",
      description:
        "Where Gentrit Halili has worked: JOIN, Belt Software, Povio and more, most recent first.",
    },
  },
  {
    id: "gh44-theme",
    realPlanet: "saturn",
    name: "gh44-theme",
    title: "gh44-theme",
    sub: `one theme, ${THEME_TOOLS.length} tools`,
    lede: "one palette for every tool i open. zed, warp, slack, linear, chrome, github, shadcn.",
    color: "sand",
    size: 22,
    orbit: { radius: 340, phase: 4.1 },
    features: { rings: "apps" },
    seo: {
      title: "gh44-theme: One Theme, 7 Tools | gh44.dev",
      description:
        "One color palette for Zed, Warp, Slack, Linear, Chrome, GitHub and shadcn/ui, in dark and light.",
    },
  },
  {
    id: "gh44-brain",
    realPlanet: "neptune",
    name: "gh44-brain",
    title: "gh44-brain",
    sub: "claude code, my way",
    lede: "clone it once and every claude code session works the way i do.",
    color: "lavender",
    size: 17,
    orbit: { radius: 445, phase: 0.6 },
    features: { surface: "haze", orbiters: "agents" },
    seo: {
      title: "gh44-brain: Claude Code, Gentrit's Way | gh44.dev",
      description:
        "gh44-brain is Gentrit Halili's Claude Code setup: rules, skills, agents and hooks. Clone it once and every session works his way.",
    },
  },
] as const satisfies readonly Planet[];

export type PlanetId = (typeof PLANETS)[number]["id"];

export function findPlanet(id: string | undefined) {
  return PLANETS.find((planet) => planet.id === id);
}
