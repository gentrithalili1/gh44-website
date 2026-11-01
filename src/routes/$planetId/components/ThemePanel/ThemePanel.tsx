import { getRouteApi } from "@tanstack/react-router";

import { isThemeToolId, THEME_TOOLS } from "#/utils/themeTools";

import type { HighlightedCode } from "../../types";
import { CODE_SNIPPETS } from "../../utils/codeSnippets";
import { CodeBlock } from "../CodeBlock";
import { ProjectSource } from "../ProjectSource";
import { PaletteSwatches } from "./components/PaletteSwatches";
import { messages } from "./messages";

const routeApi = getRouteApi("/$planetId");

interface ThemePanelProps {
  code: HighlightedCode;
}

// gh44-theme: its palette, and an install tab per app. The URL holds the open tab (`?app=`), so
// Saturn's ring bands can open one.
export function ThemePanel({ code }: ThemePanelProps) {
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const installTabs = THEME_TOOLS.map((tool) => {
    // Each app's install snippet is keyed by the app.
    return {
      id: tool.id,
      label: tool.name,
      code: CODE_SNIPPETS[tool.id].code,
      lines: code[tool.id],
      note: messages.installNotes[tool.id],
    };
  });

  function handleSelectTab(toolId: string) {
    if (!isThemeToolId(toolId)) return;
    void navigate({ search: { app: toolId }, replace: true, resetScroll: false });
  }

  return (
    <>
      <PaletteSwatches />
      <CodeBlock
        label={messages.installLabel}
        tabs={installTabs}
        selectedTabId={search.app ?? THEME_TOOLS[0].id}
        onSelectTab={handleSelectTab}
      />
      <ProjectSource projectId="gh44-theme" />
    </>
  );
}
