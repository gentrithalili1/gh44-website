// Where each dinosaur stands on the planet: degrees from its top, clockwise.
const PLANET = { x: 120, y: 185, radius: 100 } as const;

function getStandingTransform(degrees: number) {
  const radians = (degrees * Math.PI) / 180;
  const x = PLANET.x + PLANET.radius * Math.sin(radians);
  const y = PLANET.y - PLANET.radius * Math.cos(radians);

  return `translate(${x} ${y}) rotate(${degrees})`;
}

interface LostPlanetProps {
  label: string;
}

// A small flat planet adrift, with a long-neck, a t-rex and a stegosaurus standing on it.
export function LostPlanet({ label }: LostPlanetProps) {
  return (
    <svg role="img" aria-label={label} viewBox="0 0 240 150" className="mb-8 w-full max-w-80">
      <circle cx={PLANET.x} cy={PLANET.y} r={PLANET.radius} className="fill-sage" />
      <circle cx={88} cy={118} r={9} className="fill-sage-vivid opacity-40" />
      <circle cx={150} cy={104} r={5} className="fill-sage-vivid opacity-40" />
      <circle cx={170} cy={134} r={11} className="fill-sage-vivid opacity-40" />
      <circle cx={30} cy={40} r={1.2} className="fill-foreground" />
      <circle cx={208} cy={28} r={1} className="fill-foreground" />
      <circle cx={180} cy={60} r={0.8} className="fill-muted" />
      <circle cx={60} cy={18} r={0.8} className="fill-muted" />
      {/* A long-neck. */}
      <g transform={getStandingTransform(-34)} className="fill-terracotta">
        <ellipse cx={0} cy={-11} rx={14} ry={8} />
        <path d="M8 -15 Q16 -30 19 -42 L25 -41 Q21 -27 14 -10 Z" />
        <ellipse cx={23} cy={-43} rx={5.5} ry={3.2} />
        <path d="M-12 -13 Q-24 -12 -31 -3 Q-22 -7 -11 -7 Z" />
        <rect x={-10} y={-6} width={4} height={6} />
        <rect x={-3} y={-5} width={4} height={5} />
        <rect x={4} y={-5} width={4} height={5} />
        <rect x={9} y={-6} width={4} height={6} />
      </g>
      {/* A t-rex. */}
      <g transform={getStandingTransform(2)} className="fill-lavender">
        <ellipse cx={-2} cy={-17} rx={10} ry={7} transform="rotate(-25 -2 -17)" />
        <path d="M2 -21 L8 -28 L11 -23 Z" />
        <rect x={4} y={-34} width={13} height={8} rx={3} />
        <path d="M-9 -14 L-25 -7 L-9 -9 Z" />
        <rect x={-6} y={-11} width={3.5} height={11} />
        <rect x={0} y={-11} width={3.5} height={11} />
        <rect x={6} y={-19} width={4.5} height={1.6} />
        <circle cx={13} cy={-31} r={1} className="fill-background" />
      </g>
      {/* A stegosaurus. */}
      <g transform={getStandingTransform(33)}>
        <path
          d="M-9 -13 L-6 -21 L-3 -14 Z M-2 -15 L1 -24 L4 -15 Z M5 -14 L8 -21 L11 -12 Z"
          className="fill-ochre"
        />
        <g className="fill-blue">
          <ellipse cx={0} cy={-9} rx={13} ry={7} />
          <ellipse cx={14} cy={-6} rx={4.5} ry={3} />
          <path d="M-12 -9 L-23 -6 L-12 -5 Z" />
          <rect x={-8} y={-4} width={3.5} height={4} />
          <rect x={5} y={-4} width={3.5} height={4} />
        </g>
      </g>
    </svg>
  );
}
