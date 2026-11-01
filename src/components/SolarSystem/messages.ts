export const messages = {
  planetsLabel: "planets",
  earthMoon: "the moon",
  writeInGmail: "write in gmail",
  marsSatellites: { resolve: "resolve", reject: "reject" },
  brainAgents: {
    implementer: "implementer",
    researcher: "researcher",
    verifier: "verifier",
    reviewer: "reviewer",
  },
  companyMoon: ({ company, title }: { company: string; title: string }) => `${company} · ${title}`,
  appRing: (app: string) => `gh44 for ${app}`,
} as const;
