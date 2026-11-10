import type { ThemeRegistration } from "shiki/core";

import { PALETTE, SPACE_COLORS } from "#/utils/palette";

// gh44 Dark as a Shiki theme, with the code roles of gh44 for Zed (scripts/build.mjs in
// gh44-theme): clay keywords, sky functions, lavender types, seafoam components, sage strings,
// rose literals, and plain props, attributes and constants. Scopes match by prefix; a longer
// scope wins over a shorter one.
export const CODE_THEME = {
  name: "gh44-dark",
  type: "dark",
  colors: {
    "editor.background": SPACE_COLORS.background,
    "editor.foreground": SPACE_COLORS.code,
  },
  settings: [
    { settings: { foreground: SPACE_COLORS.code } },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: SPACE_COLORS.faint },
    },
    {
      scope: ["string", "punctuation.definition.string", "markup.inline.raw"],
      settings: { foreground: PALETTE.sage.soft },
    },
    {
      scope: [
        "string.regexp",
        "constant.character.escape",
        "constant.numeric",
        "constant.language",
      ],
      settings: { foreground: PALETTE.rose.soft },
    },
    {
      scope: ["constant", "entity.other.attribute-name", "variable.other.property"],
      settings: { foreground: SPACE_COLORS.code },
    },
    {
      scope: ["keyword", "storage", "entity.name.tag"],
      settings: { foreground: PALETTE.clay.soft },
    },
    {
      scope: ["keyword.operator", "punctuation", "meta.brace"],
      settings: { foreground: SPACE_COLORS.muted },
    },
    {
      scope: ["entity.name.function", "support.function", "meta.function-call.generic"],
      settings: { foreground: PALETTE.sky.soft },
    },
    {
      scope: ["entity.name.type", "support.type"],
      settings: { foreground: PALETTE.lavender.soft },
    },
    {
      scope: ["support.class.component", "entity.name.class", "support.class"],
      settings: { foreground: PALETTE.seafoam.soft },
    },
    { scope: ["variable"], settings: { foreground: SPACE_COLORS.code } },
  ],
} as const satisfies ThemeRegistration;
