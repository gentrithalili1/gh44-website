import { PromiseConfirmationContextProvider } from "react-promise-confirmation-dialog";

import type { HighlightedCode } from "../../types";
import { CODE_SNIPPETS, getPlanetSnippetIds } from "../../utils/codeSnippets";
import { CodeBlock } from "../CodeBlock";
import { ProjectSource } from "../ProjectSource";
import { LaunchDemo } from "./components/LaunchDemo";
import { messages } from "./messages";

// The package renders its dialog here, inside the planet, so it takes the planet's colors.
const DIALOG_ROOT_ID = "launch-dialog-root";
const DIALOG_CONFIG = { portalElementId: DIALOG_ROOT_ID } as const;

interface ConfirmPanelProps {
  code: HighlightedCode;
}

// react-promise-confirmation-dialog: a live demo of the package, then how to install and use it.
export function ConfirmPanel({ code }: ConfirmPanelProps) {
  const codeTabs = getPlanetSnippetIds("confirm").map((snippetId) => ({
    id: snippetId,
    label: messages.codeTabs[snippetId],
    code: CODE_SNIPPETS[snippetId].code,
    lines: code[snippetId],
  }));

  return (
    <>
      <PromiseConfirmationContextProvider config={DIALOG_CONFIG}>
        <LaunchDemo />
      </PromiseConfirmationContextProvider>
      <div id={DIALOG_ROOT_ID} />
      <CodeBlock label={messages.codeLabel} tabs={codeTabs} />
      <ProjectSource projectId="confirm" />
    </>
  );
}
