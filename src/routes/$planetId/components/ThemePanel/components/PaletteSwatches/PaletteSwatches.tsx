import { getColorVars, PALETTE, type PaletteColor } from "#/utils/palette";

import { messages } from "./messages";

// The 8 hues of gh44 Dark, in palette order.
const HUES = [
  "clay",
  "ochre",
  "sage",
  "seafoam",
  "sky",
  "lavender",
  "rose",
  "red",
] as const satisfies readonly PaletteColor[];

// gh44's one palette: a swatch per hue.
export function PaletteSwatches() {
  return (
    <ul aria-label={messages.paletteLabel} className="mb-8 grid grid-cols-8 gap-1.5">
      {HUES.map((color) => {
        const name = messages.swatch({ color, hex: PALETTE[color].soft });

        return (
          <li
            key={color}
            title={name}
            style={getColorVars(color)}
            className="aspect-square rounded-full bg-(--hue)"
          >
            <span className="sr-only">{name}</span>
          </li>
        );
      })}
    </ul>
  );
}
