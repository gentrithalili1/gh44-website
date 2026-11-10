import { PromiseConfirmationContextProvider } from "react-promise-confirmation-dialog";

import type { HighlightedCode } from "../../types";
import { CODE_SNIPPETS, getPlanetSnippetIds } from "../../utils/codeSnippets";
import { ProjectSource } from "../ProjectSource";
import { StepList } from "../StepList";
import { LaunchDemo } from "./components/LaunchDemo";
import { messages } from "./messages";

// The package renders its dialog here, inside the planet, so it takes the planet's colors.
const DIALOG_ROOT_ID = "launch-dialog-root";
const DIALOG_CONFIG = { portalElementId: DIALOG_ROOT_ID } as const;

interface ConfirmPanelProps {
  code: HighlightedCode;
}

// react-promise-confirmation-dialog: a live demo of the package, then how to use it, step by
// step.
export function ConfirmPanel({ code }: ConfirmPanelProps) {
  const steps = getPlanetSnippetIds("gh44-confirm").map((snippetId) => {
    const step = messages.steps[snippetId];
    return {
      id: snippetId,
      name: step.name,
      text: step.text,
      code: [
        {
          id: snippetId,
          label: step.tab,
          code: CODE_SNIPPETS[snippetId].code,
          lines: code[snippetId],
        },
      ],
    };
  });

  return (
    <>
      <PromiseConfirmationContextProvider config={DIALOG_CONFIG}>
        <LaunchDemo />
      </PromiseConfirmationContextProvider>
      <div id={DIALOG_ROOT_ID} />
      <StepList label={messages.stepsLabel} steps={steps} />
      <ProjectSource projectId="gh44-confirm" />
    </>
  );
}
