import type { PaletteColor } from "./palette";
import { ROLES } from "./roles";
import { THEME_TOOLS } from "./themeTools";

export type PlanetDecoration = "signal" | "ring" | "bands" | "rocket";

export type PlanetFeatures = {
  decoration?: PlanetDecoration;
  moons?: "roles" | "tools";
};

export type Planet = {
  id: string;
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

export const PLANETS = [
  {
    id: "me",
    name: "me",
    title: "gentrit halili",
    sub: "who, where, how to reach",
    lede: "senior frontend engineer in pristina, kosovo. occasionally in orbit.",
    color: "sand",
    size: 13,
    orbit: { radius: 105, phase: 3.6 },
    features: { decoration: "signal" },
    seo: {
      title: "Contact Gentrit Halili | gh44.dev",
      description:
        "Gentrit Halili, senior frontend engineer in Pristina, Kosovo. Reach him by email, GitHub, LinkedIn or Instagram.",
    },
  },
  {
    id: "work",
    name: "work",
    title: "work",
    sub: `${ROLES.length} moons · 2016 → now`,
    lede: "where i've worked. companies and roles, most recent first.",
    color: "sage",
    size: 22,
    orbit: { radius: 185, phase: 2.2 },
    features: { moons: "roles" },
    seo: {
      title: "Work: Gentrit Halili's Roles Since 2016 | gh44.dev",
      description:
        "Where Gentrit Halili has worked: JOIN, Belt Software, Povio and more, most recent first.",
    },
  },
  {
    id: "gh44-brain",
    name: "gh44-brain",
    title: "gh44-brain",
    sub: "claude code, my way",
    lede: "clone it once and every claude code session works the way i do.",
    color: "lavender",
    size: 18,
    orbit: { radius: 265, phase: 0.6 },
    features: { decoration: "ring" },
    seo: {
      title: "gh44-brain: Claude Code, Gentrit's Way | gh44.dev",
      description:
        "gh44-brain is Gentrit Halili's Claude Code setup: rules, skills, agents and hooks. Clone it once and every session works his way.",
    },
  },
  {
    id: "gh44-theme",
    name: "gh44-theme",
    title: "gh44-theme",
    sub: `one theme, ${THEME_TOOLS.length} tools`,
    lede: "one palette for every tool i open. zed, warp, slack, linear, chrome, github, shadcn.",
    color: "ochre",
    size: 34,
    orbit: { radius: 350, phase: 4.1 },
    features: { decoration: "bands", moons: "tools" },
    seo: {
      title: "gh44-theme: One Theme, 7 Tools | gh44.dev",
      description:
        "One color palette for Zed, Warp, Slack, Linear, Chrome, GitHub and shadcn/ui, in dark and light.",
    },
  },
  {
    id: "confirm",
    name: "confirm()",
    title: "confirm()",
    sub: "npm · v1.1.3",
    lede: "react confirmation dialogs you can await. resolve means yes.",
    color: "terracotta",
    size: 12,
    orbit: { radius: 430, phase: 5.4 },
    features: { decoration: "rocket" },
    seo: {
      title: "confirm(): React Confirmation Dialogs You Can Await | gh44.dev",
      description:
        "react-promise-confirmation-dialog: await confirm() in React. Resolve means yes, reject means no. v1.1.3 on npm.",
    },
  },
] as const satisfies readonly Planet[];

export type PlanetId = (typeof PLANETS)[number]["id"];

export function findPlanet(id: string | undefined) {
  return PLANETS.find((planet) => planet.id === id);
}
