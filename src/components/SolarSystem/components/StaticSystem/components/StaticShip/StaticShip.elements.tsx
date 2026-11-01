import type { Point } from "#/components/SolarSystem/types";
import {
  getShipPose,
  SHIP_CANOPY,
  SHIP_ENGINE,
  SHIP_HULL,
  SHIP_ORBIT,
} from "#/components/SolarSystem/utils/ship";

const RADIANS_TO_DEGREES = 180 / Math.PI;
const VIEW_BOX = "-9 -9 18 18";
const ENGINE_GLOW_OPACITY = 0.7;
const ENGINE_GLOW_ID = "ship-engine-glow";

function getPath(points: readonly Point[]) {
  return `M ${points.map((point) => `${point.x} ${point.y}`).join(" L ")} Z`;
}

const HULL_PATH = getPath(SHIP_HULL);
const CANOPY_PATH = getPath(SHIP_CANOPY);
const SHIP_HEADING = getShipPose(SHIP_ORBIT.phase).heading;

// A still frame of the ship from above, nose along its heading, engine softly lit.
export function StaticShipDrawing() {
  return (
    <svg viewBox={VIEW_BOX} aria-hidden="true" className="size-full overflow-visible">
      <defs>
        <radialGradient id={ENGINE_GLOW_ID}>
          <stop offset="0" className="[stop-color:var(--terracotta-vivid)]" />
          <stop offset="1" stopOpacity={0} className="[stop-color:var(--terracotta-vivid)]" />
        </radialGradient>
      </defs>
      <g transform={`rotate(${SHIP_HEADING * RADIANS_TO_DEGREES})`}>
        <circle
          cx={SHIP_ENGINE.x}
          cy={SHIP_ENGINE.y}
          r={SHIP_ENGINE.radius}
          fill={`url(#${ENGINE_GLOW_ID})`}
          opacity={ENGINE_GLOW_OPACITY}
          className="transition-opacity group-hover:opacity-100"
        />
        <path d={HULL_PATH} className="fill-muted" />
        <path d={CANOPY_PATH} className="fill-terracotta" />
      </g>
    </svg>
  );
}
