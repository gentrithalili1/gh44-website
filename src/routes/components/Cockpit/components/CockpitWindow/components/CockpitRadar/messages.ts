export const messages = {
  label: ({ visited, total }: { visited: number; total: number }) =>
    `radar: ${visited} of ${total} destinations visited`,
  title: "radar",
  visited: ({ visited, total }: { visited: number; total: number }) =>
    `${visited}/${total} visited`,
} as const;
