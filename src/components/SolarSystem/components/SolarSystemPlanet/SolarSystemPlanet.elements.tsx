import { getColorVars, type PaletteColor } from "#/utils/palette";

interface PlanetMoonProps {
  x: number;
  y: number;
  color: PaletteColor;
  isBig: boolean;
  label: string;
}

export function PlanetMoon({ x, y, color, isBig, label }: PlanetMoonProps) {
  return (
    <circle
      cx={x}
      cy={y}
      r={isBig ? 3.2 : 2.3}
      opacity={isBig ? 1 : 0.75}
      style={getColorVars(color)}
      className="fill-(--vivid) dark:fill-(--hue)"
    >
      <title>{label}</title>
    </circle>
  );
}
