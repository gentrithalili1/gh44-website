import type { Orbiter } from "#/components/SolarSystem/utils/orbiters";
import type { SurfaceShape } from "#/components/SolarSystem/utils/surface";
import { getSurfaceColorVars } from "#/components/SolarSystem/utils/surfaceColor";
import { getColorVars } from "#/utils/palette";

const SHADE_CLASS_NAMES = { soft: "fill-(--hue)", vivid: "fill-(--vivid)" } as const;

interface PlanetOrbiterProps {
  orbiter: Orbiter;
  x: number;
  y: number;
}

const CRATER_OPACITY = 0.35;

// A moon is round, a satellite a small diamond, a rock a gray disc with darker craters.
export function PlanetOrbiter({ orbiter, x, y }: PlanetOrbiterProps) {
  const size = orbiter.radius * 2;

  return (
    <g
      transform={`translate(${x} ${y})`}
      opacity={orbiter.kind === "moon" && !orbiter.isHighlighted ? 0.75 : 1}
      style={getColorVars(orbiter.color)}
      className={SHADE_CLASS_NAMES[orbiter.shade]}
    >
      {orbiter.kind === "satellite" ? (
        <rect
          x={-orbiter.radius}
          y={-orbiter.radius}
          width={size}
          height={size}
          transform="rotate(45)"
        />
      ) : (
        <circle r={orbiter.radius} />
      )}
      {orbiter.kind === "rock"
        ? orbiter.craters.map((crater) => (
            <circle
              key={`${crater.x},${crater.y}`}
              cx={crater.x}
              cy={crater.y}
              r={crater.radius}
              opacity={CRATER_OPACITY}
              className="fill-background"
            />
          ))
        : null}
      <title>{orbiter.label}</title>
    </g>
  );
}

interface PlanetSurfaceShapeProps {
  shape: SurfaceShape;
}

export function PlanetSurfaceShape({ shape }: PlanetSurfaceShapeProps) {
  const className = SHADE_CLASS_NAMES[shape.shade];
  const style = getSurfaceColorVars(shape.color);

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
