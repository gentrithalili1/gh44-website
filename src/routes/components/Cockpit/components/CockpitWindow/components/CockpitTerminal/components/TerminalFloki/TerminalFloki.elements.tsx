// Floki's body, like TARS: four slabs side by side, each a column of cells that light up from the
// bottom with his signal (`--floki-level`, 0 to 1). Each slab reaches a little differently.
const SLAB_REACH = [0.7, 1, 0.85, 0.55] as const;
const CELLS_PER_SLAB = 6;

interface FlokiSignalProps {
  status: string;
}

export function FlokiSignal({ status }: FlokiSignalProps) {
  return (
    <span
      aria-hidden="true"
      data-status={status}
      className="group/signal flex h-7 items-end gap-0.5"
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
              style={{ "--cell": (cell + 1) / CELLS_PER_SLAB } as const}
              className="flex-1 rounded-[0.5px] bg-lavender opacity-15 transition-opacity duration-75 group-data-[status=idle]/signal:first:animate-light-blink group-data-[status=idle]/signal:first:opacity-60 group-data-[status=thinking]/signal:animate-light-blink"
            />
          ))}
        </span>
      ))}
    </span>
  );
}

export function MicIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5">
      <rect x="5.5" y="1.5" width="5" height="8.5" rx="2.5" className="fill-current" />
      <path
        d="M3.5 7.5a4.5 4.5 0 0 0 9 0M8 12v2.5"
        className="fill-none stroke-current stroke-[1.3] [stroke-linecap:round]"
      />
    </svg>
  );
}
