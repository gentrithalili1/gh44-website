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
    "Welcome aboard, stranger! I'm FLOKI, the captain's German Shepherd and your guide to this universe. Tap Ask FLOKI and let's explore!",
} as const;
