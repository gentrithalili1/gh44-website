export const messages = {
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
