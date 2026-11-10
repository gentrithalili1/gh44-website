import { useId } from "react";

import { THEME_TOOLS, type ThemeToolId } from "#/utils/themeTools";

import { getNextTabIndex } from "../../../../utils/tabKeys";
import { ThemeAppTab } from "./ThemeAppTabs.elements";

interface ThemeAppTabsProps {
  label: string;
  selectedAppId: ThemeToolId;
  onSelectApp: (appId: ThemeToolId) => void;
  // The open app's panel.
  children: React.ReactNode;
}

// A tab per app gh44-theme covers; the open one shows its install steps below.
export function ThemeAppTabs({ label, selectedAppId, onSelectApp, children }: ThemeAppTabsProps) {
  const id = useId();
  const getTabId = (appId: string) => `${id}-tab-${appId}`;
  const panelId = `${id}-panel`;

  function handleKeyDown(event: React.KeyboardEvent) {
    const currentIndex = THEME_TOOLS.findIndex((tool) => tool.id === selectedAppId);
    const nextIndex = getNextTabIndex({
      key: event.key,
      currentIndex,
      tabCount: THEME_TOOLS.length,
    });
    const nextTool = nextIndex === undefined ? undefined : THEME_TOOLS[nextIndex];
    if (!nextTool) return;
    event.preventDefault();
    onSelectApp(nextTool.id);
    document.getElementById(getTabId(nextTool.id))?.focus();
  }

  return (
    <div className="mb-8">
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={handleKeyDown}
        className="mb-5 flex flex-wrap gap-1.5"
      >
        {THEME_TOOLS.map((tool) => (
          <ThemeAppTab
            key={tool.id}
            id={getTabId(tool.id)}
            panelId={panelId}
            color={tool.color}
            isSelected={tool.id === selectedAppId}
            onSelect={() => onSelectApp(tool.id)}
          >
            {tool.name}
          </ThemeAppTab>
        ))}
      </div>
      <div role="tabpanel" id={panelId} aria-labelledby={getTabId(selectedAppId)}>
        {children}
      </div>
    </div>
  );
}
