const RING_RADII = [14, 28, 44] as const;
const FACE_RADIUS = 46;
// The sweep's trailing wedge: 40 degrees behind its leading edge.
const SWEEP_PATH = "M0 0 L0 -46 A46 46 0 0 0 -29.57 -35.24 Z";

// Rings, a crosshair, the sun at the center and a slow sweep.
export function RadarFace() {
  return (
    <g aria-hidden="true">
      <circle r={FACE_RADIUS} className="fill-night" />
      {RING_RADII.map((radius) => (
        <circle
          key={radius}
          r={radius}
          className="fill-none stroke-rule [vector-effect:non-scaling-stroke]"
        />
      ))}
      <path
        d={`M${-FACE_RADIUS} 0 H${FACE_RADIUS} M0 ${-FACE_RADIUS} V${FACE_RADIUS}`}
        className="stroke-border-subtle [vector-effect:non-scaling-stroke]"
      />
      <g className="animate-radar-sweep">
        <path d={SWEEP_PATH} className="fill-sage/12" />
        <path d="M0 0 V-46" className="stroke-sage/60 [vector-effect:non-scaling-stroke]" />
      </g>
      <circle r={2.4} className="fill-ochre" />
    </g>
  );
}

interface RadarBlipProps {
  x: number;
  y: number;
  isVisited: boolean;
}

// A destination: lit once visited, an empty ring before.
export function RadarBlip({ x, y, isVisited }: RadarBlipProps) {
  return (
    <circle
      cx={x}
      cy={y}
      r={2.2}
      className={
        isVisited
          ? "fill-sage"
          : "fill-night stroke-muted [stroke-width:1.2] [vector-effect:non-scaling-stroke]"
      }
    />
  );
}

// Floki's ball, once `fetch` threw it: a small rose dot circling the middle of the scope.
export function RadarBall() {
  return (
    <g className="motion-safe:animate-radar-sweep">
      <circle cx={0} cy={-22} r={1.6} className="fill-rose" />
    </g>
  );
}

interface RadarSignalProps {
  isReached: boolean;
}

// The black hole, once every planet is visited: a blip at the edge of the scope, past every
// orbit, blinking until the visitor has been there.
export function RadarSignal({ isReached }: RadarSignalProps) {
  return (
    <circle
      cx={32}
      cy={-33}
      r={2.2}
      className={isReached ? "fill-ochre" : "fill-ochre motion-safe:animate-light-blink"}
    />
  );
}
