// An astronaut's helmet and shoulders: leaving the ship for open space.
const HELMET_PATH = "M8 1.75a5 5 0 1 1 0 10a5 5 0 0 1 0-10z";
const VISOR_PATH =
  "M5.4 5h5.2a1 1 0 0 1 1 1v1a2.6 2.6 0 0 1-2.6 2.6H7a2.6 2.6 0 0 1-2.6-2.6V6a1 1 0 0 1 1-1z";
const SHOULDERS_PATH = "M2.5 15.25c.7-1.9 2.9-2.9 5.5-2.9s4.8 1 5.5 2.9";

// The windshield in a 100 x 100 box stretched over the top of the screen: an arched window cut
// out of the hull, and two struts that rise from the console and meet at its top.
const WINDOW_PATH = "M2.5 100 C1.5 52 15 9 50 5 C85 9 98.5 52 97.5 100 Z";
const HULL_PATH = `M0 0 H100 V100 H0 Z ${WINDOW_PATH}`;
const STRUT_PATHS = ["M31 100 C34 58 43 22 50 5", "M69 100 C66 58 57 22 50 5"] as const;

export function AstronautIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4.5">
      <path d={HELMET_PATH} className="fill-none stroke-current stroke-[1.3]" />
      <path d={VISOR_PATH} className="fill-current opacity-70" />
      <path
        d={SHOULDERS_PATH}
        className="fill-none stroke-current stroke-[1.3] [stroke-linecap:round]"
      />
    </svg>
  );
}

// The space outside shows through the window: it is the live scene behind the cockpit.
export function CockpitWindshield() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-x-0 top-0 h-full w-full md:h-[calc(100%-var(--console-height)+5rem)]"
    >
      <path d={HULL_PATH} fillRule="evenodd" className="fill-surface" />
      {STRUT_PATHS.map((path) => (
        <path
          key={path}
          d={path}
          className="fill-none stroke-surface stroke-[7] [vector-effect:non-scaling-stroke] md:stroke-[11]"
        />
      ))}
      {STRUT_PATHS.map((path) => (
        <path
          key={path}
          d={path}
          className="fill-none stroke-surface-active stroke-1 [vector-effect:non-scaling-stroke]"
        />
      ))}
      {/* The window's rubber seal, and the light catching the frame's edge. */}
      <path
        d={WINDOW_PATH}
        className="fill-none stroke-night stroke-[5] [vector-effect:non-scaling-stroke]"
      />
      <path
        d={WINDOW_PATH}
        className="fill-none stroke-surface-active stroke-[1.5] [vector-effect:non-scaling-stroke]"
      />
    </svg>
  );
}

// The glass over every screen: faint scanlines, and a sage glow from the top like a lit tube.
const SCREEN_GLASS_STYLE = {
  backgroundImage: [
    "repeating-linear-gradient(to bottom, transparent 0 2px, rgb(255 255 255 / 0.02) 2px 3px)",
    "radial-gradient(130% 80% at 50% 0%, color-mix(in oklab, var(--sage) 6%, transparent), transparent 70%)",
    "linear-gradient(160deg, rgb(255 255 255 / 0.035), transparent 35%)",
  ].join(", "),
} as const;

// A countersunk screw holding the bezel, its slot at an angle.
function BezelScrew() {
  return (
    <span className="relative size-1.5 shrink-0 rounded-full bg-bg-subtle shadow-[inset_0_1px_1px_rgb(0_0_0/0.7),0_1px_0_rgb(255_255_255/0.06)] after:absolute after:inset-x-px after:top-1/2 after:h-px after:-translate-y-1/2 after:rotate-45 after:bg-fg-faint" />
  );
}

// The screen's power lamp.
export function PowerLamp() {
  return <span className="size-1 shrink-0 rounded-full bg-sage shadow-[0_0_5px_var(--sage)]" />;
}

type IndicatorLight = { id: string; color: string; blink?: string };

// Status lamps in the palette's hues; a few blink slowly, out of step.
const LIGHTS = [
  { id: "l1", color: "bg-sage" },
  { id: "l2", color: "bg-sage", blink: "animate-light-blink [animation-delay:-0.6s]" },
  { id: "l3", color: "bg-fg-faint" },
  { id: "l4", color: "bg-ochre" },
  { id: "l5", color: "bg-blue" },
  { id: "l6", color: "bg-lavender", blink: "animate-light-blink [animation-delay:-2.1s]" },
  { id: "l7", color: "bg-fg-faint" },
  { id: "l8", color: "bg-terracotta", blink: "animate-light-blink [animation-delay:-1.3s]" },
] as const satisfies readonly IndicatorLight[];

// A row of status lamps for the busiest screen.
export function ConsoleLights() {
  return (
    <span className="flex shrink-0 gap-1">
      {LIGHTS.map((light: IndicatorLight) => (
        <span
          key={light.id}
          className={`h-1 w-2 rounded-full opacity-80 ${light.color} ${light.blink ?? ""}`}
        />
      ))}
    </span>
  );
}

interface ConsoleScreenProps {
  // Engraved on the bezel above the screen.
  label: string;
  // Right of the label: a power lamp unless the screen has its own lights.
  indicator?: React.ReactNode;
  // Where the bezel sits in the console.
  className?: string;
  // The screen's own layout and padding.
  screenClassName?: string;
  children: React.ReactNode;
}

// A screen set into the console: a raised bezel with its label plate and screws, and the glass
// sunk into it.
export function ConsoleScreen({
  label,
  indicator = <PowerLamp />,
  className = "",
  screenClassName = "p-3",
  children,
}: ConsoleScreenProps) {
  return (
    <div
      className={`flex min-h-0 min-w-0 flex-col rounded-lg bg-surface px-1 pb-1 shadow-[inset_0_1px_0_rgb(255_255_255/0.07),0_1px_0_rgb(0_0_0/0.5),0_12px_22px_-14px_rgb(0_0_0/0.9)] ${className}`}
    >
      <div
        aria-hidden="true"
        className="flex h-5 shrink-0 items-center gap-1.5 px-1 text-[0.5625rem] tracking-kicker text-faint md:h-6 md:text-[0.625rem]"
      >
        <BezelScrew />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {indicator}
        <BezelScrew />
      </div>
      <div
        className={`relative min-h-0 flex-1 overflow-hidden rounded-md bg-night shadow-[inset_0_2px_12px_rgb(0_0_0/0.55)] ring-1 ring-black/50 [text-shadow:0_0_10px_color-mix(in_oklab,var(--sage)_16%,transparent)] ${screenClassName}`}
      >
        <span
          aria-hidden="true"
          style={SCREEN_GLASS_STYLE}
          className="pointer-events-none absolute inset-0"
        />
        {children}
      </div>
    </div>
  );
}
