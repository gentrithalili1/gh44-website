import { useState } from "react";

import { getColorVars, PALETTE, type PaletteColor } from "#/utils/palette";

import { messages } from "./messages";

type Shade = keyof typeof messages.shades;

const SHADES = ["soft", "vivid"] as const satisfies readonly Shade[];

// The 9 hues of gh44 Dark, in palette order.
const HUES = [
  "terracotta",
  "sage",
  "lavender",
  "sand",
  "blue",
  "ochre",
  "rose",
  "seafoam",
  "red",
] as const satisfies readonly PaletteColor[];

// gh44's hues in soft or vivid. Only the swatches change; the space keeps its colors.
export function PaletteSwatches() {
  const [shade, setShade] = useState<Shade>("soft");

  return (
    <div className="mb-8">
      <div role="group" aria-label={messages.shadeLabel} className="mb-3 flex gap-1 text-xs">
        {SHADES.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={option === shade}
            onClick={() => setShade(option)}
            className="rounded-md border border-transparent px-2 py-0.75 text-faint transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-muted aria-pressed:border-rule aria-pressed:text-foreground"
          >
            {messages.shades[option]}
          </button>
        ))}
      </div>
      <ul aria-label={messages.paletteLabel} className="grid grid-cols-9 gap-1.5">
        {HUES.map((color) => {
          const name = messages.swatch({ color, hex: PALETTE[color][shade] });

          return (
            <li
              key={color}
              title={name}
              data-shade={shade}
              style={getColorVars(color)}
              className="aspect-square rounded-full bg-(--hue) transition-colors duration-500 data-[shade=vivid]:bg-(--vivid)"
            >
              <span className="sr-only">{name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
