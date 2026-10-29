import { type ReactNode, useState } from "react";

import { cn } from "#/lib/utils";
import { pickRandomIndex } from "#/utils/pickRandomIndex";

import { ACCENT_COLOR_CLASS_NAMES } from "./utils/accentColors";

interface SiteLogoRandomAccentProps {
  children: ReactNode;
}

export function SiteLogoRandomAccent({ children }: SiteLogoRandomAccentProps) {
  const [colorIndex, setColorIndex] = useState(0);

  function handleAnimationIteration() {
    setColorIndex((currentIndex) =>
      pickRandomIndex({ count: ACCENT_COLOR_CLASS_NAMES.length, excludeIndex: currentIndex }),
    );
  }

  return (
    <span
      onAnimationIteration={handleAnimationIteration}
      className={cn(
        "transition-colors duration-1000 ease-out motion-safe:animate-logo-tick",
        ACCENT_COLOR_CLASS_NAMES[colorIndex],
      )}
    >
      {children}
    </span>
  );
}
