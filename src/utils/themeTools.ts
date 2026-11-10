import type { PaletteColor } from "./palette";

// The apps gh44-theme covers; each one is a ring band of the gh44-theme planet (Saturn).
export const THEME_TOOLS = [
  { id: "zed", name: "zed", color: "sky" },
  { id: "warp", name: "warp", color: "clay" },
  { id: "slack", name: "slack", color: "rose" },
  { id: "linear", name: "linear", color: "lavender" },
  { id: "chrome", name: "chrome", color: "sage" },
  { id: "github", name: "github", color: "ochre" },
  { id: "shadcn", name: "shadcn/ui", color: "seafoam" },
] as const satisfies readonly { id: string; name: string; color: PaletteColor }[];

export type ThemeToolId = (typeof THEME_TOOLS)[number]["id"];

export function isThemeToolId(id: unknown): id is ThemeToolId {
  return THEME_TOOLS.some((tool) => tool.id === id);
}
