import { EXPLORER_NAME } from "#/utils/explorer";

export const messages = {
  title: EXPLORER_NAME,
  status: "systems online",
  // Leaving the cockpit is stepping out of the ship.
  spacewalk: "spacewalk",
  spacewalkLabel: "go on a spacewalk",
  // Engraved on each screen's bezel.
  screens: { floki: "floki", radar: "radar", radio: "radio", terminal: "terminal" },
  // Floki says it out loud when the cockpit opens by itself on a first visit.
  flokiWelcome:
    "Welcome aboard, stranger! I'm FLOKI, the captain's German Shepherd and your guide to this universe. Tap Ask FLOKI and let's explore!",
  // Back from the black hole: what Floki says, and what the terminal prints under it.
  jumpArrived: "that took 5 seconds. 7 years passed on main.",
  jumpProgress: "visited: 6/5",
} as const;
