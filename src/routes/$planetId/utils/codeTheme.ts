import type { ThemeRegistration } from "shiki/core";

import { PALETTE, SPACE_COLORS } from "#/utils/palette";

// gh44 Dark as a Shiki theme, with the syntax colors of gh44 for Zed (scripts/build.mjs in
// gh44-theme). Scopes match by prefix; a longer scope wins over a shorter one.
export const CODE_THEME = {
  name: "gh44-dark",
  type: "dark",
  colors: {
    "editor.background": SPACE_COLORS.background,
    "editor.foreground": SPACE_COLORS.foreground,
  },
  settings: [
    { settings: { foreground: SPACE_COLORS.foreground } },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: SPACE_COLORS.faint },
    },
    {
      scope: ["string", "punctuation.definition.string", "markup.inline.raw"],
      settings: { foreground: PALETTE.sage.soft },
    },
    {
      scope: ["string.regexp", "constant.character.escape"],
      settings: { foreground: PALETTE.rose.soft },
    },
    {
      scope: ["constant", "constant.numeric", "constant.language", "entity.other.attribute-name"],
      settings: { foreground: PALETTE.ochre.soft },
    },
    {
      scope: ["keyword", "storage", "entity.name.tag", "support.class.component"],
      settings: { foreground: PALETTE.terracotta.soft },
    },
    {
      scope: ["keyword.operator", "punctuation", "meta.brace"],
      settings: { foreground: SPACE_COLORS.muted },
    },
    {
      scope: ["entity.name.function", "support.function", "meta.function-call.generic"],
      settings: { foreground: PALETTE.lavender.soft },
    },
    {
      scope: ["entity.name.type", "entity.name.class", "support.type", "support.class"],
      settings: { foreground: PALETTE.blue.soft },
    },
    {
      scope: [
        "variable.other.property",
        "variable.other.object.property",
        "support.type.property-name",
        "meta.object-literal.key",
      ],
      settings: { foreground: PALETTE.rose.soft },
    },
    { scope: ["variable"], settings: { foreground: SPACE_COLORS.foreground } },
  ],
} as const satisfies ThemeRegistration;
