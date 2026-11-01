import type { FlokiStatus } from "../../hooks/useFloki";
import { FlokiHead } from "./CockpitFloki.elements";
import { FlokiSignal } from "./components/FlokiSignal";
import { messages } from "./messages";

interface CockpitFlokiProps {
  status: FlokiStatus;
  // How loud the mic or Floki's voice is right now, from 0 to 1.
  getLevel: () => number;
}

// Floki's own screen: the ship's robotic German shepherd, his signal lighting the grille in his
// muzzle. It only shows him; the terminal's strip says what he is doing to screen readers.
export function CockpitFloki({ status, getLevel }: CockpitFlokiProps) {
  return (
    <div aria-hidden="true" className="flex h-full min-h-0 flex-col items-center gap-1">
      <div className="flex min-h-0 w-full flex-1 justify-center">
        <FlokiHead status={status} grille={<FlokiSignal status={status} getLevel={getLevel} />} />
      </div>
      <p className="hidden text-[0.6875rem] text-muted md:block">
        <span className="text-lavender">{messages.name}</span> · {messages.status[status]}
      </p>
    </div>
  );
}
