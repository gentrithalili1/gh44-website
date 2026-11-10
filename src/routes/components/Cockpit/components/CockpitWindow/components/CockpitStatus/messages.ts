import { EXPLORER_NAME } from "#/utils/explorer";

export const messages = {
  title: EXPLORER_NAME,
  // Beside the clock once every planet is visited, until the visitor has been to the black hole.
  statusSignal: "signal detected · gargantua",
  // The console slides away for a full view through the windshield, and back.
  panelHide: "hide panel",
  panelShow: "show panel",
} as const;
