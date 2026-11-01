import type { PlanetId } from "#/utils/planets";

import type { CodeLang } from "../types";

type CodeSnippet = { planetId: PlanetId; lang: CodeLang; code: string };

// Every code block's code, highlighted on the server by the planet route's loader. `planetId`
// is the one place that says whose panel a snippet belongs to; gh44-theme's are keyed by app.
export const CODE_SNIPPETS = {
  brainInstall: {
    planetId: "gh44-brain",
    lang: "shellscript",
    code: "git clone git@github.com:gentrithalili1/gh44-brain.git && gh44-brain/install.sh",
  },
  zed: {
    planetId: "gh44-theme",
    lang: "json",
    code: `{
  "theme": {
    "mode": "system",
    "light": "gh44 Light",
    "dark": "gh44 Dark"
  }
}`,
  },
  warp: {
    planetId: "gh44-theme",
    lang: "shellscript",
    code: "mkdir -p ~/.warp/themes\ncp warp/gh44-dark.yaml warp/gh44-light.yaml ~/.warp/themes/",
  },
  slack: {
    planetId: "gh44-theme",
    lang: "text",
    code: "#F2ECE5,#EAE2D9,#D9CDC0,#2B2D30,#EAE2D9,#2B2D30,#497C15,#B94000,#A9502F,#FAF7F3",
  },
  linear: {
    planetId: "gh44-theme",
    lang: "json",
    code: '{"base":[11.744,2.222,272.716,1],"accent":[70.976,47.994,303.946,1],"contrast":30,"sidebar":{"base":[15.177,2.834,275.984,1],"accent":[70.976,47.994,303.946,1],"contrast":30}}',
  },
  chrome: {
    planetId: "gh44-theme",
    lang: "shellscript",
    code: "git clone https://github.com/gentrithalili1/gh44-theme.git",
  },
  github: {
    planetId: "gh44-theme",
    lang: "text",
    code: "https://raw.githubusercontent.com/gentrithalili1/gh44-theme/main/github/gh44.user.css",
  },
  shadcn: {
    planetId: "gh44-theme",
    lang: "shellscript",
    code: "npx shadcn@latest add https://raw.githubusercontent.com/gentrithalili1/gh44-theme/main/shadcn/r/gh44.json",
  },
  confirmInstall: {
    planetId: "gh44-confirm",
    lang: "shellscript",
    code: "npm i react-promise-confirmation-dialog",
  },
  confirmProvider: {
    planetId: "gh44-confirm",
    lang: "tsx",
    code: `import { PromiseConfirmationContextProvider } from "react-promise-confirmation-dialog";

function Index() {
  return (
    <PromiseConfirmationContextProvider>
      <App />
    </PromiseConfirmationContextProvider>
  );
}`,
  },
  confirmUsage: {
    planetId: "gh44-confirm",
    lang: "tsx",
    code: `import { usePromiseConfirmation } from "react-promise-confirmation-dialog";

function App() {
  const confirmation = usePromiseConfirmation();

  const handleConfirmClick = async () => {
    try {
      await confirmation.confirm();
      // confirmed
    } catch (rejectReason) {
      // declined
    }
  };

  return <button onClick={handleConfirmClick}>Confirm</button>;
}`,
  },
} as const satisfies Record<string, CodeSnippet>;

export type CodeSnippetId = keyof typeof CODE_SNIPPETS;

// The ids of one planet's snippets.
type PlanetSnippetId<TPlanetId extends PlanetId> = {
  [Id in CodeSnippetId]: (typeof CODE_SNIPPETS)[Id]["planetId"] extends TPlanetId ? Id : never;
}[CodeSnippetId];

// A planet's snippets, in the order above.
export function getPlanetSnippetIds<TPlanetId extends PlanetId>(planetId: TPlanetId) {
  return Object.keys(CODE_SNIPPETS).filter((id): id is PlanetSnippetId<TPlanetId> =>
    isPlanetSnippet({ id, planetId }),
  );
}

function isPlanetSnippet({ id, planetId }: { id: string; planetId: PlanetId }) {
  return isCodeSnippetId(id) && CODE_SNIPPETS[id].planetId === planetId;
}

function isCodeSnippetId(id: string): id is CodeSnippetId {
  return id in CODE_SNIPPETS;
}
