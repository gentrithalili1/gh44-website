import type { Transition } from "motion/react";

const EASE_OUT: Transition["ease"] = [0.33, 1, 0.68, 1];

const HIDDEN = { opacity: 0, transform: "translateY(8px)" };

export const PAGE_TRANSITION = {
  hidden: HIDDEN,
  visible: { opacity: 1, transform: "translateY(0px)" },
  exit: { ...HIDDEN, transition: { duration: 0.15, ease: EASE_OUT } },
  enterTiming: { duration: 0.3, ease: EASE_OUT },
} as const;
