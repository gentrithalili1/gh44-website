// gh44 palette names; styles.css holds each one's values per theme.
export type PaletteColor =
  | "terracotta"
  | "sage"
  | "lavender"
  | "sand"
  | "blue"
  | "ochre"
  | "rose"
  | "seafoam"
  | "red"
  | "neutral";

// The soft hue shows in the dark theme, the vivid one in the light theme.
export function getColorVars(color: PaletteColor) {
  return { "--hue": `var(--${color})`, "--vivid": `var(--${color}-vivid)` };
}
