// The sun lighting up at the center of the screen, where the scene's sun sits.
export function BootSun() {
  return (
    <span className="absolute top-1/2 left-1/2 size-40 -translate-1/2 animate-boot-ignite rounded-full bg-[radial-gradient(circle,var(--color-sun)_0_16%,color-mix(in_oklab,var(--color-sun)_30%,transparent)_24%,transparent_68%)]" />
  );
}

// Ring radii in the drawing's 100-unit box: the innermost ring, and how far out the rest spread.
const INNER_ORBIT_RADIUS = 14;
const ORBIT_SPREAD = 34;

interface BootOrbitsProps {
  count: number;
  // Fires once the outermost ring has drawn.
  onDrawn: (event: React.AnimationEvent<SVGCircleElement>) => void;
}

// Orbit rings drawing themselves outward, one per site planet, inside to outside.
export function BootOrbits({ count, onDrawn }: BootOrbitsProps) {
  return (
    <svg
      viewBox="-50 -50 100 100"
      className="absolute top-1/2 left-1/2 size-[min(92vmin,44rem)] -translate-1/2 overflow-visible"
    >
      {Array.from({ length: count }, (_, index) => (
        <circle
          key={index}
          data-testid="boot-orbit"
          r={INNER_ORBIT_RADIUS + (index * ORBIT_SPREAD) / Math.max(count - 1, 1)}
          pathLength={1}
          style={{ "--orbit": index }}
          onAnimationEnd={index === count - 1 ? onDrawn : undefined}
          className="animate-boot-orbit fill-none stroke-rule [stroke-dasharray:1] [stroke-width:0.25] [vector-effect:non-scaling-stroke]"
        />
      ))}
    </svg>
  );
}

// The terminal's block cursor, waiting on the next line.
export function BootCursor() {
  return <li className="h-[1lh] w-[1ch] animate-cursor-blink bg-muted" />;
}
