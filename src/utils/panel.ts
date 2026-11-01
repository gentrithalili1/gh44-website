// The planet panel: a column this wide on the right on desktop, and a bottom sheet this share of
// the screen's height on phones. The camera frames planets in the space it leaves free.
export const PANEL_WIDTH = 672;
export const SHEET_HEIGHT = 0.62;

export const PANEL_STYLE = {
  "--panel-width": `${PANEL_WIDTH}px`,
  "--sheet-height": `${SHEET_HEIGHT * 100}%`,
} as const;
