import { EXPLORER_NAME } from "#/utils/explorer";

export const messages = {
  title: EXPLORER_NAME,
  status: "systems online",
  // Leaving the cockpit is stepping out of the ship.
  spacewalk: "spacewalk",
  spacewalkLabel: "go on a spacewalk",
  // Engraved on each screen's bezel.
  screens: { floki: "floki", radar: "radar", radio: "radio", nav: "nav console" },
  // Floki says it out loud when the cockpit opens by itself on a first visit.
  flokiWelcome:
    "Welcome aboard. I'm Floki, the captain's German Shepherd, now with more processing power and fewer walks. Tap ask Floki and tell me where we're going.",
} as const;
