import { useEffect, useEffectEvent, useState } from "react";

import type { Floki } from "../useFloki";

// The visitor's first click, tap or key press: browsers let sound start from one.
const GESTURE_EVENTS = ["pointerdown", "keydown"] as const;
// Talk greets and listens on its own: a tap there is not a cue for the welcome.
const TALK_SELECTOR = "[data-floki-talk]";

type UseFlokiWelcomeParams = {
  floki: Pick<Floki, "hasGreeted" | "greet">;
  // Whether this cockpit opened by itself to greet the visitor, read when it opens.
  isGreeting: boolean;
  text: string;
};

// Floki welcomes the visitor out loud when the cockpit opens by itself on their first visit.
// Browsers block sound before the first click or key press; then he speaks on that one.
export function useFlokiWelcome({ floki, isGreeting, text }: UseFlokiWelcomeParams) {
  const [shouldWelcome] = useState(isGreeting);

  const welcome = useEffectEvent(() => {
    if (!floki.hasGreeted) void floki.greet(text);
  });

  useEffect(() => {
    if (!shouldWelcome) return;
    welcome();
    // Captured on the document, so it runs inside the visitor's gesture, before anything else.
    function handleGesture(event: Event) {
      if (event.target instanceof Element && event.target.closest(TALK_SELECTOR)) return;
      welcome();
    }
    for (const type of GESTURE_EVENTS) document.addEventListener(type, handleGesture, true);

    return () => {
      for (const type of GESTURE_EVENTS) document.removeEventListener(type, handleGesture, true);
    };
  }, [shouldWelcome]);
}
