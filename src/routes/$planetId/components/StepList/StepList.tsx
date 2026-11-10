import { CodeBlock } from "../CodeBlock";
import { StepItem } from "./StepList.elements";
import type { Step } from "./types";

interface StepListProps {
  // Names the list, and each step's code block after its step.
  label: string;
  steps: Step[];
}

// A project's how-to as steps in order, on a timeline like gh44-brain's learning loop.
export function StepList({ label, steps }: StepListProps) {
  return (
    <ol aria-label={label} className="mb-8 border-l border-rule">
      {steps.map((step) => (
        <StepItem key={step.id} name={step.name} text={step.text}>
          {step.code ? <CodeBlock label={`${label}: ${step.name}`} tabs={step.code} /> : null}
        </StepItem>
      ))}
    </ol>
  );
}
