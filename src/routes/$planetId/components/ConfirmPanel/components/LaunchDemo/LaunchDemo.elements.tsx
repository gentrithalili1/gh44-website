import type { LaunchStatus } from "./types";

interface LaunchRocketProps {
  status: LaunchStatus;
}

// A small rocket on its pad; once launched it flies up and out of sight.
export function LaunchRocket({ status }: LaunchRocketProps) {
  return (
    <svg
      viewBox="0 0 24 40"
      aria-hidden="true"
      data-status={status}
      className="h-10 w-6 shrink-0 overflow-visible transition-[translate,opacity] duration-1400 ease-in data-[status=launched]:-translate-y-48 data-[status=launched]:opacity-0"
    >
      <path d="M12 2 C17 8 18 16 17 26 L7 26 C6 16 7 8 12 2 Z" className="fill-foreground" />
      <circle cx="12" cy="14" r="2.5" className="fill-blue" />
      <path d="M7 20 L3 30 L7 27 Z M17 20 L21 30 L17 27 Z" className="fill-terracotta" />
      <path
        d="M9 27 L12 36 L15 27 Z"
        data-status={status}
        className="fill-ochre opacity-0 transition-opacity data-[status=launched]:opacity-100"
      />
    </svg>
  );
}
