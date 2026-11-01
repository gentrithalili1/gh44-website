const NEXT_TAB_KEYS = { ArrowRight: 1, ArrowLeft: -1 } as const;

type GetNextTabIndexParams = { key: string; currentIndex: number; tabCount: number };

// Arrows wrap around; Home and End jump to the ends.
export function getNextTabIndex({ key, currentIndex, tabCount }: GetNextTabIndexParams) {
  if (key === "Home") return 0;
  if (key === "End") return tabCount - 1;
  if (key === "ArrowRight" || key === "ArrowLeft") {
    return (currentIndex + NEXT_TAB_KEYS[key] + tabCount) % tabCount;
  }

  return undefined;
}
