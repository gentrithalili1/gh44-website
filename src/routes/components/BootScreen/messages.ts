export const messages = {
  status: "loading the solar system…",
  lines: {
    scene: "igniting the sun",
    // `count` is how many site planets there are.
    orbits: (count: number) => `plotting ${count} orbits`,
    floki: "waking floki",
  },
  ok: "ok",
  woof: "woof",
} as const;
