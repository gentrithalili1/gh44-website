import type { Orbiter } from "#/components/SolarSystem/utils/orbiters";
import type { SurfaceShape } from "#/components/SolarSystem/utils/surface";
import { getColorVars } from "#/utils/palette";

const SHADE_CLASS_NAMES = { soft: "fill-(--hue)", vivid: "fill-(--vivid)" } as const;

interface PlanetOrbiterProps {
  orbiter: Orbiter;
  x: number;
  y: number;
}

// A moon is round, a satellite a small diamond.
export function PlanetOrbiter({ orbiter, x, y }: PlanetOrbiterProps) {
  const size = orbiter.radius * 2;

  return (
    <g
      transform={`translate(${x} ${y})`}
      opacity={orbiter.isHighlighted || orbiter.kind === "satellite" ? 1 : 0.75}
      style={getColorVars(orbiter.color)}
      className={SHADE_CLASS_NAMES[orbiter.shade]}
    >
      {orbiter.kind === "moon" ? (
        <circle r={orbiter.radius} />
      ) : (
        <rect
          x={-orbiter.radius}
          y={-orbiter.radius}
          width={size}
          height={size}
          transform="rotate(45)"
        />
      )}
      <title>{orbiter.label}</title>
    </g>
  );
}

interface PlanetSurfaceShapeProps {
  shape: SurfaceShape;
}

export function PlanetSurfaceShape({ shape }: PlanetSurfaceShapeProps) {
  const className = SHADE_CLASS_NAMES[shape.shade];
  const style = getColorVars(shape.color);

  if (shape.kind === "ellipse") {
    return (
      <ellipse
        cx={shape.x}
        cy={shape.y}
        rx={shape.rx}
        ry={shape.ry}
        opacity={shape.opacity}
        style={style}
        className={className}
      />
    );
  }

  return (
    <polygon
      points={shape.points.map((point) => `${point.x},${point.y}`).join(" ")}
      opacity={shape.opacity}
      style={style}
      className={className}
    />
  );
}
