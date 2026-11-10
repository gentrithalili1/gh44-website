// gh44 dark's hues (palette/tokens.json in gh44-theme). styles.css holds the same values as CSS
// variables; three.js reads the hex values below.
export type PaletteColor =
  | "clay"
  | "ochre"
  | "sage"
  | "seafoam"
  | "sky"
  | "lavender"
  | "rose"
  | "red"
  | "neutral";

type PaletteShades = { soft: string; vivid: string };

// gh44 has one value per hue, so both shades are that value. Only neutral keeps two: the
// foreground for past roles and the moon, the muted gray for rocks and man-made things.
export const PALETTE = {
  clay: { soft: "#c59172", vivid: "#c59172" },
  ochre: { soft: "#d4b25e", vivid: "#d4b25e" },
  sage: { soft: "#9ebf7a", vivid: "#9ebf7a" },
  seafoam: { soft: "#5cb8a2", vivid: "#5cb8a2" },
  sky: { soft: "#75addb", vivid: "#75addb" },
  lavender: { soft: "#c1a0f4", vivid: "#c1a0f4" },
  rose: { soft: "#f08ba2", vivid: "#f08ba2" },
  red: { soft: "#fd5d62", vivid: "#fd5d62" },
  neutral: { soft: "#dfe1e5", vivid: "#a8abb2" },
} as const satisfies Record<PaletteColor, PaletteShades>;

// The page's own colors (styles.css `--background`, `--foreground`, `--muted`, `--faint`,
// `--rule`), and code's foreground.
export const SPACE_COLORS = {
  background: "#191a1c",
  foreground: "#dfe1e5",
  muted: "#a8abb2",
  faint: "#868a92",
  rule: "#3c3e43",
  code: "#ccced3",
} as const;

// `--hue` is the color, `--vivid` its second shade (only neutral's differs).
export function getColorVars(color: PaletteColor) {
  return { "--hue": `var(--${color})`, "--vivid": `var(--${color}-vivid)` };
}
