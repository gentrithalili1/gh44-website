import { getRouteApi } from "@tanstack/react-router";

import { isThemeToolId, THEME_TOOLS, type ThemeToolId } from "#/utils/themeTools";

import type { HighlightedCode } from "../../types";
import { CODE_SNIPPETS } from "../../utils/codeSnippets";
import { ProjectSource } from "../ProjectSource";
import { type Step, StepList } from "../StepList";
import { PaletteSwatches } from "./components/PaletteSwatches";
import { ThemeAppTabs } from "./components/ThemeAppTabs";
import { messages } from "./messages";

const routeApi = getRouteApi("/$planetId");

// One app's README steps, each with its code highlighted on the server.
function getAppSteps({ appId, code }: { appId: ThemeToolId; code: HighlightedCode }): Step[] {
  return messages.apps[appId].map((step) => ({
    id: step.id,
    name: step.name,
    text: step.text,
    code:
      "code" in step
        ? step.code.map(({ snippet, label }) => ({
            id: snippet,
            label,
            code: CODE_SNIPPETS[snippet].code,
            lines: code[snippet],
          }))
        : undefined,
  }));
}

interface ThemePanelProps {
  code: HighlightedCode;
}

export function ThemePanel({ code }: ThemePanelProps) {
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  // An app it doesn't know falls back to the first.
  const appId = isThemeToolId(search.app) ? search.app : THEME_TOOLS[0].id;
  const appName = THEME_TOOLS.find((tool) => tool.id === appId)?.name ?? appId;

  function handleSelectApp(nextAppId: ThemeToolId) {
    void navigate({ search: { app: nextAppId }, replace: true, resetScroll: false });
  }

  return (
    <>
      <PaletteSwatches />
      <ThemeAppTabs label={messages.appsLabel} selectedAppId={appId} onSelectApp={handleSelectApp}>
        {/* A new list per app, so its code types in again. */}
        <StepList
          key={appId}
          label={messages.stepsLabel(appName)}
          steps={getAppSteps({ appId, code })}
        />
      </ThemeAppTabs>
      <ProjectSource projectId="gh44-theme" />
    </>
  );
}
