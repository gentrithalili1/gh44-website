import { EXPLORER_NAME } from "#/utils/explorer";

export const messages = {
  title: EXPLORER_NAME,
  status: "systems online",
  // In its place once every planet is visited, until the visitor has been to the black hole.
  statusSignal: "signal detected · gargantua",
  // Leaving the cockpit is stepping out of the ship.
  spacewalk: "spacewalk",
  spacewalkLabel: "go on a spacewalk",
  // The console slides away for a full view through the windshield, and back.
  panelHide: "hide panel",
  panelShow: "show panel",
  // Engraved on each screen's bezel.
  screens: { floki: "floki", radar: "radar", radio: "radio", terminal: "terminal" },
  // Floki says it out loud when the cockpit opens by itself on a first visit.
  flokiWelcome:
    "Welcome aboard, stranger! I'm FLOKI, the captain's German Shepherd and your guide to this universe. Tap Ask FLOKI and let's explore!",
  // Back from the black hole: what Floki says, and what the terminal prints under it.
  jumpArrived: (years: number) => `home. that felt like minutes. ${years} years passed on earth.`,
  jumpProgress: "visited: 6/5",
  // Inside the black hole: nothing but the way back.
  voidLine: "nothing in here. not even light.",
  voidBack: "go back",
} as const;
