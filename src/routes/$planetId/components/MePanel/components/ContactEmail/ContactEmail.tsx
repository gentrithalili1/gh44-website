import { CONTACT_EMAIL } from "#/utils/contact";

import { UNDERLINED_LINK_CLASS_NAME } from "../../../../utils/underlinedLink";
import { useCopyText } from "./hooks/useCopyText";
import { messages } from "./messages";
import type { CopyStatus } from "./types";

function getStatusCopy(status: CopyStatus) {
  switch (status) {
    case "idle":
      return { text: CONTACT_EMAIL, announcement: "" };
    case "copied":
      return { text: messages.copiedText, announcement: messages.copiedLabel };
    case "failed":
      return {
        text: messages.failedText(CONTACT_EMAIL),
        announcement: messages.failedLabel,
      };
    default: {
      const unknownStatus: never = status;
      return unknownStatus;
    }
  }
}

// The address itself copies on click and says so in place for a moment.
export function ContactEmail() {
  const copyText = useCopyText();

  const statusCopy = getStatusCopy(copyText.status);

  async function handleCopy() {
    await copyText.copy(CONTACT_EMAIL);
  }

  return (
    <>
      <button
        type="button"
        title={messages.copyLabel}
        onClick={handleCopy}
        data-status={copyText.status}
        className={`text-left ${UNDERLINED_LINK_CLASS_NAME} data-[status=copied]:text-accent data-[status=failed]:text-red`}
      >
        {statusCopy.text}
      </button>
      {/* Announces the result: the button's text alone changes silently. */}
      <span role="status" className="sr-only">
        {statusCopy.announcement}
      </span>
    </>
  );
}
