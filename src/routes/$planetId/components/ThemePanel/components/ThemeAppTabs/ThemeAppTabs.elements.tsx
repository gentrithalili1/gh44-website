import { getColorVars, type PaletteColor } from "#/utils/palette";

interface ThemeAppTabProps {
  id: string;
  panelId: string;
  // The app's ring band color on Saturn.
  color: PaletteColor;
  isSelected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}

// One app's tab: a pill with the app's ring band color as its dot.
export function ThemeAppTab({
  id,
  panelId,
  color,
  isSelected,
  onSelect,
  children,
}: ThemeAppTabProps) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={isSelected}
      aria-controls={panelId}
      tabIndex={isSelected ? 0 : -1}
      onClick={onSelect}
      style={getColorVars(color)}
      className="flex items-center gap-1.5 rounded-full border border-rule px-3 py-1.5 text-kicker text-muted transition-colors before:size-1.5 before:rounded-full before:bg-(--hue) hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-muted aria-selected:border-(--hue) aria-selected:text-foreground"
    >
      {children}
    </button>
  );
}
