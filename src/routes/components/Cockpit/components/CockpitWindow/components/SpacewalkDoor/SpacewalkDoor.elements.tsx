const STRIPES_DASH = "2.4 2.4";

export function DoorIcon() {
  return (
    <svg viewBox="0 0 20 28" aria-hidden="true" className="h-full w-auto">
      <rect x="1" y="1" width="18" height="26" rx="6" className="fill-ochre" />
      <rect
        x="1"
        y="1"
        width="18"
        height="26"
        rx="6"
        strokeDasharray={STRIPES_DASH}
        className="fill-none stroke-night stroke-[2]"
      />
      <rect
        x="3.4"
        y="3.4"
        width="13.2"
        height="21.2"
        rx="4"
        className="fill-[color-mix(in_oklab,var(--sky)_22%,var(--surface-active))] stroke-ochre stroke-[0.8]"
      />
      <circle cx="9.4" cy="9.6" r="3.6" className="fill-neutral-soft" />
      <circle cx="9.4" cy="9.6" r="2.6" className="fill-sky" />
      <circle cx="10.4" cy="8.6" r="0.6" className="fill-neutral-soft opacity-80" />
      <rect x="14.3" y="7" width="1.2" height="3.4" rx="0.6" className="fill-neutral-soft" />
      <rect x="14.3" y="17.6" width="1.2" height="3.4" rx="0.6" className="fill-neutral-soft" />
      {[16.2, 18, 19.8].map((y) => (
        <rect key={y} x="5.6" y={y} width="5.6" height="0.9" rx="0.45" className="fill-night" />
      ))}
    </svg>
  );
}
