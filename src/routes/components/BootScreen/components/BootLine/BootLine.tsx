import { useState } from "react";

// Every label pads with dots to this column, so the statuses line up.
const STATUS_COLUMN = 28;

type BootLineTone = "ok" | "floki";

interface BootLineProps {
  label: string;
  status: string;
  tone: BootLineTone;
  // Whether the step behind this line has finished; the status waits for it.
  isReady: boolean;
  onDone: () => void;
}

// One line of the boot log: the label types out, then its status lands once the step is ready.
export function BootLine({ label, status, tone, isReady, onDone }: BootLineProps) {
  const [isTyped, setIsTyped] = useState(false);

  const text = `${label} ${".".repeat(Math.max(STATUS_COLUMN - label.length, 3))}`;
  const isStatusShown = isTyped && isReady;

  function handleTyped(event: React.AnimationEvent<HTMLSpanElement>) {
    if (event.target === event.currentTarget) setIsTyped(true);
  }

  function handleStatusShown(event: React.AnimationEvent<HTMLSpanElement>) {
    if (event.target === event.currentTarget) onDone();
  }

  return (
    <li className="flex gap-[1ch] whitespace-pre">
      <span className="text-faint">&gt;</span>
      <span
        style={{ "--chars": text.length }}
        onAnimationEnd={handleTyped}
        className="animate-boot-type overflow-hidden text-muted"
      >
        {text}
      </span>
      {isStatusShown ? (
        <span
          data-tone={tone}
          onAnimationEnd={handleStatusShown}
          className="animate-boot-status text-sage data-[tone=floki]:text-sun"
        >
          {status}
        </span>
      ) : null}
    </li>
  );
}
