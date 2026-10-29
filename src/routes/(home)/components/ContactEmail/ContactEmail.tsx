import { CheckIcon, CopyIcon, XIcon } from "lucide-react";

import { Button } from "#/components/ui/button";

import { useCopyText } from "./hooks/useCopyText";
import { messages } from "./messages";
import type { CopyStatus } from "./types";
import { CONTACT_EMAIL } from "./utils/contactEmail";

const STATUS_ICONS = { idle: CopyIcon, copied: CheckIcon, failed: XIcon } as const;

function getStatusLabel(status: CopyStatus) {
  switch (status) {
    case "idle":
      return messages.copyLabel;
    case "copied":
      return messages.copiedLabel;
    case "failed":
      return messages.failedLabel;
    default: {
      const unknownStatus: never = status;
      return unknownStatus;
    }
  }
}

export function ContactEmail() {
  const copyText = useCopyText();

  const StatusIcon = STATUS_ICONS[copyText.status];
  const statusLabel = getStatusLabel(copyText.status);

  async function handleCopy() {
    await copyText.copy(CONTACT_EMAIL);
  }

  return (
    <div className="inline-flex cursor-pointer items-center gap-1 rounded-full border p-1">
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="inline-flex items-center self-stretch rounded-full px-3 font-mono text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        {CONTACT_EMAIL}
      </a>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={statusLabel}
        onClick={handleCopy}
        className="rounded-full text-muted-foreground active:scale-90 data-[status=copied]:text-success data-[status=failed]:text-destructive"
        data-status={copyText.status}
      >
        <StatusIcon aria-hidden />
      </Button>
      {/* Announces the result: the button's label alone changes silently. */}
      <span role="status" className="sr-only">
        {copyText.status === "idle" ? "" : statusLabel}
      </span>
    </div>
  );
}
