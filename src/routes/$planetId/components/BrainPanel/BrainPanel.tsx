import type { HighlightedCode } from "../../types";
import { CODE_SNIPPETS } from "../../utils/codeSnippets";
import { CodeBlock } from "../CodeBlock";
import { ProjectSource } from "../ProjectSource";
import { LearningStep, PanelSection } from "./BrainPanel.elements";
import { SessionReplay } from "./components/SessionReplay";
import { messages } from "./messages";

interface BrainPanelProps {
  code: HighlightedCode;
}

// gh44-brain: how to install it, a session in its workflow, and how it learns.
export function BrainPanel({ code }: BrainPanelProps) {
  const installTabs = [
    {
      id: "install",
      label: messages.installTab,
      code: CODE_SNIPPETS.brainInstall.code,
      lines: code.brainInstall,
      note: messages.installNote,
    },
  ];

  return (
    <>
      <CodeBlock label={messages.installLabel} tabs={installTabs} />
      <PanelSection heading={messages.sessionHeading}>
        <SessionReplay />
      </PanelSection>
      <PanelSection heading={messages.learningHeading}>
        <ol aria-label={messages.learningHeading} className="border-l border-rule">
          {messages.learningSteps.map((step) => (
            <LearningStep key={step.id} name={step.name}>
              {step.text}
            </LearningStep>
          ))}
        </ol>
      </PanelSection>
      <ProjectSource projectId="gh44-brain" />
    </>
  );
}
