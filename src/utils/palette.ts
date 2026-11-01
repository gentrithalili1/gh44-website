// gh44 dark palette names (palette/tokens.json in gh44-theme). styles.css holds the same values
// as CSS variables; three.js reads the hex values below.
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

type PaletteShades = { soft: string; vivid: string };

export const PALETTE = {
  terracotta: { soft: "#e49b80", vivid: "#fe8b60" },
  sage: { soft: "#b8c5ac", vivid: "#a4d074" },
  lavender: { soft: "#bba8d9", vivid: "#c29ef7" },
  sand: { soft: "#e9ddd2", vivid: "#f2dbc6" },
  blue: { soft: "#9fb7cc", vivid: "#68bcfe" },
  ochre: { soft: "#ddbe8e", vivid: "#fbb42a" },
  rose: { soft: "#d99aa6", vivid: "#f389a1" },
  seafoam: { soft: "#9cc4c0", vivid: "#2bd5cb" },
  red: { soft: "#eb6f6f", vivid: "#ff5a60" },
  // Past roles and man-made things: the foreground and the muted text.
  neutral: { soft: "#dfe1e5", vivid: "#a8abb2" },
} as const satisfies Record<PaletteColor, PaletteShades>;

// The page's own colors (styles.css `--background`, `--foreground`, `--muted`, `--faint`,
// `--rule`).
export const SPACE_COLORS = {
  background: "#1e1f22",
  foreground: "#dfe1e5",
  muted: "#a8abb2",
  faint: "#868a92",
  rule: "#414349",
} as const;

// `--hue` is the soft shade, `--vivid` the vivid one.
export function getColorVars(color: PaletteColor) {
  return { "--hue": `var(--${color})`, "--vivid": `var(--${color}-vivid)` };
}
