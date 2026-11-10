import { EXPLORER_NAME } from "#/utils/explorer";

export const messages = {
  planetsLabel: "planets",
  marsMoons: { phobos: "phobos · resolve", deimos: "deimos · reject" },
  brainAgents: {
    implementer: "implementer",
    researcher: "researcher",
    verifier: "verifier",
    reviewer: "reviewer",
  },
  companyMoon: ({ company, title }: { company: string; title: string }) => `${company} · ${title}`,
  appRing: (app: string) => `gh44 for ${app}`,
  shipName: EXPLORER_NAME,
  shipAction: "open cockpit",
  sunScold: "floki: please don't poke the sun.",
  // What Floki says out loud.
  sunScoldSpoken: "Please don't poke the sun!",
  fetchBall: "floki's ball",
  endurance: "endurance",
  // Kept short: these sit near the edges of the screen, where a long name would be cut off.
  voyagers: {
    voyager1: "voyager 1 · since 1977",
    voyager2: "voyager 2 · since 1977",
  },
  millersPlanet: "miller's planet · one hour here, seven years on earth.",
  avalon: "avalon · to homestead ii",
  homestead: "homestead ii · 90 years from the avalon",
  blackHole: "gargantua",
  blackHoleUnknown: "???",
  pluto: "pluto · still a planet",
} as const;
