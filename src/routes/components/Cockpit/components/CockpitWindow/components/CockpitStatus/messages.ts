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
} as const;
