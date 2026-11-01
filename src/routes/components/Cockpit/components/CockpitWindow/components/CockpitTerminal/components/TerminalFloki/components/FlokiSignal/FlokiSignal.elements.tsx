import type { Ref } from "react";

import type { FlokiStatus } from "../../../../hooks/useFloki";

// How far up each of the four slabs reaches at full signal, so they never move as one.
const SLAB_REACH = [0.7, 1, 0.85, 0.55] as const;
const CELLS_PER_SLAB = 6;

interface FlokiSlabsProps {
  ref: Ref<HTMLSpanElement>;
  status: FlokiStatus;
}

// Floki's body, like TARS: four slabs side by side, each a column of cells that light from the
// bottom with `--floki-level` (0 to 1). While he stands by, one cell blinks; while he thinks,
// every cell does.
export function FlokiSlabs({ ref, status }: FlokiSlabsProps) {
  return (
    <span
      ref={ref}
      aria-hidden="true"
      data-status={status}
      className="group/signal flex h-7 shrink-0 items-end gap-0.5"
    >
      {SLAB_REACH.map((reach, slab) => (
        <span
          key={slab}
          style={{ "--slab-reach": reach } as const}
          className="flex h-full w-1.5 flex-col-reverse gap-px rounded-[1px] bg-surface p-px"
        >
          {Array.from({ length: CELLS_PER_SLAB }, (_, cell) => (
            <span
              key={cell}
              style={{ "--cell": cell / CELLS_PER_SLAB } as const}
              className="flex-1 rounded-[0.5px] bg-lavender opacity-[clamp(0.15,calc((var(--floki-level,0)*var(--slab-reach)-var(--cell))*6),0.95)] group-data-[status=idle]/signal:first:animate-light-blink group-data-[status=thinking]/signal:animate-light-blink"
            />
          ))}
        </span>
      ))}
    </span>
  );
}
