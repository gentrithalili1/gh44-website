export const messages = {
  label: "radar",
  scopeLabel: ({ visited, total }: { visited: number; total: number }) =>
    `radar: ${visited} of ${total} destinations visited`,
  route: "route",
  next: "next",
  visited: "visited",
  progress: ({ visited, total }: { visited: number; total: number }) => `${visited}/${total}`,
  // The black hole, once every planet is visited: a signal off the chart.
  signal: "???",
  beyond: "gargantua",
} as const;
