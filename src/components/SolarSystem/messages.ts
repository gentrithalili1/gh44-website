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
  voyager: "voyager 1 · launched 1977. still going.",
  blackHole: "gargantua",
  blackHoleUnknown: "???",
  pluto: "pluto · still a planet",
} as const;
