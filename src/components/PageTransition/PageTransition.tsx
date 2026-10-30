import { useMatches, useRouter } from "@tanstack/react-router";
import { type AnimationDefinition, AnimatePresence, motion, MotionConfig } from "motion/react";

import { PAGE_TRANSITION } from "./utils/pageTransition";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const router = useRouter();
  const routeId = useMatches({ select: (matches) => matches.at(-1)?.routeId });

  const PageComponent = routeId ? router.routesById[routeId]?.options.component : undefined;

  const handleAnimationStart = (definition: AnimationDefinition) => {
    const html = document.documentElement;
    if (definition === PAGE_TRANSITION.exit) html.dataset.pageExiting = "";
    if (definition === PAGE_TRANSITION.visible && "pageExiting" in html.dataset) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  const handleAnimationComplete = (definition: AnimationDefinition) => {
    if (definition === PAGE_TRANSITION.visible) delete document.documentElement.dataset.pageExiting;
  };

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={routeId}
          className="flex flex-1 flex-col"
          initial={PAGE_TRANSITION.hidden}
          animate={PAGE_TRANSITION.visible}
          exit={PAGE_TRANSITION.exit}
          transition={PAGE_TRANSITION.enterTiming}
          onAnimationStart={handleAnimationStart}
          onAnimationComplete={handleAnimationComplete}
        >
          {PageComponent ? <PageComponent /> : children}
        </motion.main>
      </AnimatePresence>
    </MotionConfig>
  );
}
