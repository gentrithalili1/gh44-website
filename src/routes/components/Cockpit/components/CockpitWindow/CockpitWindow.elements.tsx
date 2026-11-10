// An astronaut's helmet and shoulders: leaving the ship for open space.
const HELMET_PATH = "M8 1.75a5 5 0 1 1 0 10a5 5 0 0 1 0-10z";
const VISOR_PATH =
  "M5.4 5h5.2a1 1 0 0 1 1 1v1a2.6 2.6 0 0 1-2.6 2.6H7a2.6 2.6 0 0 1-2.6-2.6V6a1 1 0 0 1 1-1z";
const SHOULDERS_PATH = "M2.5 15.25c.7-1.9 2.9-2.9 5.5-2.9s4.8 1 5.5 2.9";

interface PanelIconProps {
  // Which way the chevron points: down to hide the panel, up to bring it back.
  direction: "down" | "up";
}

export function PanelIcon({ direction }: PanelIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      data-direction={direction}
      className="size-4 transition-transform duration-300 data-[direction=up]:rotate-180"
    >
      <path
        d="M3.5 6l4.5 4.5L12.5 6"
        className="fill-none stroke-current stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]"
      />
    </svg>
  );
}

// The windshield in a 100 x 100 box stretched over the top of the screen, cut out of the hull
// like a ship's canopy: a central arch, two overhead panes split by a spine, and a pane down
// each side. Mirrored left to right.
const CENTER_PANE = "M24 100 V58 C24 33 36 17.5 50 17.5 C64 17.5 76 33 76 58 V100 Z";
const OVERHEAD_PANES = [
  "M2 1.5 H46 V8.5 C38 9.5 31 13 26.5 18 C23.5 21.5 21 25 19.5 28.5 L2 22 Z",
  "M98 1.5 H54 V8.5 C62 9.5 69 13 73.5 18 C76.5 21.5 79 25 80.5 28.5 L98 22 Z",
] as const;
const SIDE_PANES = [
  "M2 27.5 L18.5 34 C18 41 18 48 18 55 V100 H2 Z",
  "M98 27.5 L81.5 34 C82 41 82 48 82 55 V100 H98 Z",
] as const;
const PANES = [CENTER_PANE, ...OVERHEAD_PANES, ...SIDE_PANES] as const;
const HULL_PATH = `M0 0 H100 V100 H0 Z ${PANES.join(" ")}`;
// Lit strips along the frame: down the overhead spine, and along the beams over the side panes.
const LIGHT_STRIPS = [
  { id: "spineLeft", d: "M47.6 1 V10" },
  { id: "spineRight", d: "M52.4 1 V10" },
  { id: "beamLeft", d: "M5 23.6 L11 26.2" },
  { id: "beamRight", d: "M95 23.6 L89 26.2" },
  { id: "pillarLeft", d: "M21 44 V58" },
  { id: "pillarRight", d: "M79 44 V58" },
] as const;
// The hatch on the overhead spine, and its vents.
const HATCH = { x: 47.2, y: 2, width: 5.6, height: 5 } as const;
const HATCH_VENTS = ["M48.2 3.4 H51.8", "M48.2 4.6 H51.8", "M48.2 5.8 H51.8"] as const;
// Seams where the frame's plates meet.
const FRAME_SEAMS = [
  "M46 8.5 V17.5",
  "M54 8.5 V17.5",
  "M19.5 28.5 L18.5 34",
  "M80.5 28.5 L81.5 34",
  "M18 70 H24",
  "M76 70 H82",
] as const;

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

const GLARE_ID = "cockpit-glass-glare";
const HULL_SHADE_ID = "cockpit-hull-shade";
const SHEEN_ID = "cockpit-glass-sheen";

// The space outside shows through the panes: it is the live scene behind the cockpit. The
// frame is lit by strips of light, and the glass carries a warm glare and a faint slanted sheen. Drawn a little
// oversized, it shifts against the console as the visitor looks around (--look-x, --look-y), and
// closes in round the window on boarding.
export function CockpitWindshield() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-x-0 top-0 h-full w-full translate-x-[calc(var(--look-x,0)*-8px)] translate-y-[calc(var(--look-y,0)*-5px)] scale-[1.03] transition-[translate] duration-500 ease-space group-data-[power=off]/cockpit:animate-hull-out group-data-[reveal=flight]/cockpit:animate-hull-in motion-reduce:translate-none md:h-[calc(100%-var(--console-height)+5rem)]"
    >
      <defs>
        <radialGradient id={GLARE_ID} cx="50%" cy="58%" r="55%">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.1" className="text-ochre" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" className="text-ochre" />
        </radialGradient>
        <linearGradient id={HULL_SHADE_ID} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="0.045" />
          <stop offset="0.5" stopColor="black" stopOpacity="0" />
          <stop offset="1" stopColor="black" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id={SHEEN_ID} x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0.18" stopColor="currentColor" stopOpacity="0" />
          <stop offset="0.3" stopColor="currentColor" stopOpacity="0.05" />
          <stop offset="0.36" stopColor="currentColor" stopOpacity="0.012" />
          <stop offset="0.44" stopColor="currentColor" stopOpacity="0.035" />
          <stop offset="0.5" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={HULL_PATH} fillRule="evenodd" className="fill-surface" />
      {/* Metal: lighter where the light from outside falls, darker toward the floor. */}
      <path d={HULL_PATH} fillRule="evenodd" fill={`url(#${HULL_SHADE_ID})`} />
      {PANES.map((pane) => (
        <path key={pane} d={pane} fill={`url(#${GLARE_ID})`} />
      ))}
      {PANES.map((pane) => (
        <path key={pane} d={pane} fill={`url(#${SHEEN_ID})`} className="text-foreground" />
      ))}
      {FRAME_SEAMS.map((seam) => (
        <path
          key={seam}
          d={seam}
          className="fill-none stroke-night stroke-[1.5] [vector-effect:non-scaling-stroke]"
        />
      ))}
      <rect
        x={HATCH.x}
        y={HATCH.y}
        width={HATCH.width}
        height={HATCH.height}
        className="fill-bg-subtle stroke-surface-active stroke-1 [vector-effect:non-scaling-stroke]"
      />
      {HATCH_VENTS.map((vent) => (
        <path
          key={vent}
          d={vent}
          className="fill-none stroke-night stroke-2 [vector-effect:non-scaling-stroke]"
        />
      ))}
      {/* Each pane's rubber seal, and the light catching the frame's edge. */}
      {PANES.map((pane) => (
        <path
          key={pane}
          d={pane}
          className="fill-none stroke-night stroke-[5] [vector-effect:non-scaling-stroke]"
        />
      ))}
      {PANES.map((pane) => (
        <path
          key={pane}
          d={pane}
          className="fill-none stroke-surface-active stroke-[1.5] [vector-effect:non-scaling-stroke]"
        />
      ))}
      {/* The lit strips: a soft glow, then the light itself. */}
      {LIGHT_STRIPS.map((strip) => (
        <path
          key={strip.id}
          d={strip.d}
          className="fill-none stroke-sky/20 stroke-[7] [stroke-linecap:round] [vector-effect:non-scaling-stroke]"
        />
      ))}
      {LIGHT_STRIPS.map((strip) => (
        <path
          key={strip.id}
          d={strip.d}
          className="fill-none stroke-sky stroke-[1.5] [stroke-linecap:round] [vector-effect:non-scaling-stroke]"
        />
      ))}
    </svg>
  );
}

// The glass over every screen: faint scanlines, and a cool glow from the top like a lit display.
const SCREEN_GLASS_STYLE = {
  backgroundImage: [
    "repeating-linear-gradient(to bottom, transparent 0 2px, rgb(255 255 255 / 0.02) 2px 3px)",
    "radial-gradient(130% 80% at 50% 0%, color-mix(in oklab, var(--sky) 9%, transparent), transparent 70%)",
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
  return <span className="size-1 shrink-0 rounded-full bg-sky shadow-[0_0_5px_var(--sky)]" />;
}

type IndicatorLight = { id: string; color: string; blink?: string };

// Status lamps in the palette's hues; a few blink slowly, out of step.
const LIGHTS = [
  { id: "l1", color: "bg-sage" },
  { id: "l2", color: "bg-sage", blink: "animate-light-blink [animation-delay:-0.6s]" },
  { id: "l3", color: "bg-fg-faint" },
  { id: "l4", color: "bg-ochre" },
  { id: "l5", color: "bg-sky" },
  { id: "l6", color: "bg-lavender", blink: "animate-light-blink [animation-delay:-2.1s]" },
  { id: "l7", color: "bg-fg-faint" },
  { id: "l8", color: "bg-clay", blink: "animate-light-blink [animation-delay:-1.3s]" },
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
  // Its turn when the console powers on, from 0.
  powerOrder: number;
  // Under the glass, on the bezel: keys and switches.
  footer?: React.ReactNode;
  children: React.ReactNode;
}

// A screen set into the console: a raised bezel with its label plate and screws, and the glass
// sunk into it. A dark cover over the picture flickers away when the console powers on, and
// comes back as it powers off.
export function ConsoleScreen({
  label,
  indicator = <PowerLamp />,
  className = "",
  screenClassName = "p-3",
  powerOrder,
  footer,
  children,
}: ConsoleScreenProps) {
  const coverStyle = { "--screen": powerOrder } as const;

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
        className={`relative min-h-0 flex-1 overflow-hidden rounded-md bg-night ring-1 ring-black/50 [text-shadow:0_0_10px_color-mix(in_oklab,var(--sky)_18%,transparent)] shadow-[inset_0_2px_12px_rgb(0_0_0/0.55),inset_0_0_0_1px_color-mix(in_oklab,var(--sky)_10%,transparent)] ${screenClassName}`}
      >
        <span
          aria-hidden="true"
          style={SCREEN_GLASS_STYLE}
          className="pointer-events-none absolute inset-0"
        />
        {children}
        <span
          aria-hidden="true"
          style={coverStyle}
          className="pointer-events-none absolute inset-0 z-10 bg-night opacity-0 group-data-[jump=inside]/cockpit:animate-none group-data-[jump=inside]/cockpit:opacity-100 group-data-[jump=on]/cockpit:animate-screen-jump group-data-[power=off]/cockpit:animate-screen-off group-data-[power=on]/cockpit:animate-screen-on motion-reduce:animate-none after:absolute after:inset-x-0 after:top-1/2 after:h-px after:bg-sky after:opacity-0 group-data-[power=on]/cockpit:after:animate-screen-line motion-reduce:after:animate-none"
        />
      </div>
      {footer}
    </div>
  );
}

// Rows of keys and toggles on the pedestal under the terminal, a few of them lit.
const PEDESTAL_KEYS = [
  { id: "k1", lit: "" },
  { id: "k2", lit: "bg-sky/70 shadow-[0_0_6px_var(--sky)]" },
  { id: "k3", lit: "" },
  { id: "k4", lit: "" },
  { id: "k5", lit: "bg-ochre/70 shadow-[0_0_6px_var(--ochre)]" },
  { id: "k6", lit: "" },
  { id: "k7", lit: "bg-sky/70 shadow-[0_0_6px_var(--sky)]" },
  { id: "k8", lit: "" },
  { id: "k9", lit: "" },
  { id: "k10", lit: "bg-sky/70 shadow-[0_0_6px_var(--sky)]" },
] as const;

// The dashboard's front edge: a bevelled lip with a strip of light along its middle, like the
// edge of the console under the windshield.
export function DashboardLip() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-4 md:h-5">
      <span className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(255_255_255/0.06),transparent)]" />
      <span className="absolute inset-x-[30%] top-1.5 h-px bg-sky/70 shadow-[0_0_10px_2px_color-mix(in_oklab,var(--sky)_45%,transparent)] md:top-2" />
    </span>
  );
}

// Seams between the dashboard's plates, and the pedestal under the terminal standing out of it.
export function DashboardPlates() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
      <span className="absolute inset-y-6 left-[calc(50%-21rem)] w-px bg-black/40 shadow-[1px_0_0_rgb(255_255_255/0.04)]" />
      <span className="absolute inset-y-6 right-[calc(50%-21rem)] w-px bg-black/40 shadow-[1px_0_0_rgb(255_255_255/0.04)]" />
      <span className="absolute inset-x-[calc(50%-21rem)] top-5 bottom-0 bg-[linear-gradient(to_bottom,rgb(255_255_255/0.025),transparent_40%)]" />
    </span>
  );
}

// The keys under the terminal's screen.
export function PedestalKeys() {
  return (
    <span
      aria-hidden="true"
      className="hidden shrink-0 items-center justify-center gap-1.5 pt-1.5 pb-0.5 md:flex"
    >
      {PEDESTAL_KEYS.map((key) => (
        <span
          key={key.id}
          className={`h-2 w-4 rounded-[2px] shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_1px_0_rgb(0_0_0/0.6)] ${key.lit === "" ? "bg-surface-active" : key.lit}`}
        />
      ))}
    </span>
  );
}
