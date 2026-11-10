export const messages = {
  paletteLabel: "palette",
  swatch: ({ color, hex }: { color: string; hex: string }) => `${color} ${hex}`,
} as const;
