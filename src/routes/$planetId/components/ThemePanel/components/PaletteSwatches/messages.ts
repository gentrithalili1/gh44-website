export const messages = {
  paletteLabel: "palette",
  shadeLabel: "shade",
  shades: { soft: "soft", vivid: "vivid" },
  swatch: ({ color, hex }: { color: string; hex: string }) => `${color} ${hex}`,
} as const;
