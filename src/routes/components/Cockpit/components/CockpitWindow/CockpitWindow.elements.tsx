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

interface ConsoleScreenProps {
  // Where the screen sits in the console.
  className?: string;
  children: React.ReactNode;
}

// A small screen set into the console.
export function ConsoleScreen({ className = "", children }: ConsoleScreenProps) {
  return (
    <div
      className={`min-h-0 min-w-0 rounded-md border border-border-subtle bg-night p-3 shadow-[inset_0_2px_10px_rgb(0_0_0/0.35)] ${className}`}
    >
      {children}
    </div>
  );
}
