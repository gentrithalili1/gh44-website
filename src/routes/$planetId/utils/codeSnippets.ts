import type { PlanetId } from "#/utils/planets";

import type { CodeLang } from "../types";

type CodeSnippet = { planetId: PlanetId; lang: CodeLang; code: string };

export const CODE_SNIPPETS = {
  brainInstall: {
    planetId: "gh44-brain",
    lang: "shellscript",
    code: "git clone git@github.com:gentrithalili1/gh44-brain.git && gh44-brain/install.sh",
  },
  zedSettings: {
    planetId: "gh44-theme",
    lang: "json",
    code: `{
  "theme": {
    "mode": "system",
    "light": "gh44 Light",
    "dark": "gh44 Dark"
  },
  "ui_font_family": ".ZedSans",
  "buffer_font_family": ".ZedMono"
}`,
  },
  warpCopy: {
    planetId: "gh44-theme",
    lang: "shellscript",
    code: "mkdir -p ~/.warp/themes && cp warp/*.yaml ~/.warp/themes/",
  },
  slackDark: {
    planetId: "gh44-theme",
    lang: "text",
    code: "#202124,#26282A,#34363B,#DFE1E5,#26282A,#DFE1E5,#9EBF7A,#B64309,#191A1C,#DFE1E5",
  },
  slackLight: {
    planetId: "gh44-theme",
    lang: "text",
    code: "#F2ECE5,#EAE2D9,#D9CDC0,#2B2D30,#EAE2D9,#2B2D30,#4C7B1D,#B64309,#FAF7F3,#2B2D30",
  },
  linearDark: {
    planetId: "gh44-theme",
    lang: "json",
    code: '{"base":[9.216,1.578,266.503,1],"accent":[71.248,45.254,303.409,1],"contrast":30,"sidebar":{"base":[12.726,2.203,272.678,1],"accent":[71.248,45.254,303.409,1],"contrast":30}}',
  },
  linearLight: {
    planetId: "gh44-theme",
    lang: "json",
    code: '{"base":[97.382,2.356,77.304,1],"accent":[41.393,62.23,303.997,1],"contrast":30,"sidebar":{"base":[93.727,4.326,73.952,1],"accent":[41.393,62.23,303.997,1],"contrast":30}}',
  },
  linearStyle: {
    planetId: "gh44-theme",
    lang: "text",
    code: "https://raw.githubusercontent.com/gentrithalili1/gh44-theme/main/linear/gh44.user.css",
  },
  chromeClone: {
    planetId: "gh44-theme",
    lang: "shellscript",
    code: "git clone https://github.com/gentrithalili1/gh44-theme.git",
  },
  githubStyle: {
    planetId: "gh44-theme",
    lang: "text",
    code: "https://raw.githubusercontent.com/gentrithalili1/gh44-theme/main/github/gh44.user.css",
  },
  shadcnAdd: {
    planetId: "gh44-theme",
    lang: "shellscript",
    code: "npx shadcn@latest add https://raw.githubusercontent.com/gentrithalili1/gh44-theme/main/shadcn/r/gh44.json",
  },
  shadcnColors: {
    planetId: "gh44-theme",
    lang: "shellscript",
    code: "npx shadcn@latest add https://raw.githubusercontent.com/gentrithalili1/gh44-theme/main/shadcn/r/gh44-theme.json",
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
