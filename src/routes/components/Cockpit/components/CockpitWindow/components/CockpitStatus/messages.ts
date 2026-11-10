import { EXPLORER_NAME } from "#/utils/explorer";

export const messages = {
  title: EXPLORER_NAME,
  status: "systems online",
  // In its place once every planet is visited, until the visitor has been to the black hole.
  statusSignal: "signal detected · gargantua",
  // The console slides away for a full view through the windshield, and back.
  panelHide: "hide panel",
  panelShow: "show panel",
} as const;
