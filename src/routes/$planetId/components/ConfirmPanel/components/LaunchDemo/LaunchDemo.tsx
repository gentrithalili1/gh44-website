import { useRef } from "react";
import {
  type PromiseConfirmationData,
  usePromiseConfirmation,
} from "react-promise-confirmation-dialog";

import { type LaunchStatus, useRocketLaunch } from "#/hooks/useRocketLaunch";

import { LaunchDialog } from "./components/LaunchDialog";
import { messages } from "./messages";

function getStatusText(status: LaunchStatus) {
  switch (status) {
    case "idle":
    case "asking":
      return "";
    case "launched":
      return messages.launched;
    case "aborted":
      return messages.aborted;
    default: {
      const unknownStatus: never = status;
      return unknownStatus;
    }
  }
}

function renderLaunchDialog(dialog: Omit<PromiseConfirmationData, "customComponent">) {
  return (
    <LaunchDialog
      text={dialog.text}
      description={dialog.description}
      confirmButtonLabel={dialog.confirmButtonLabel}
      cancelButtonLabel={dialog.cancelButtonLabel}
      onConfirm={dialog.onConfirm}
      onCancel={dialog.onCancel}
    />
  );
}

// The package's live demo: `await confirm()` resolves on launch and rejects on abort. The rocket
// stands on Mars while the dialog asks, and lifts off the planet on launch.
export function LaunchDemo() {
  const confirmation = usePromiseConfirmation();
  const rocketLaunch = useRocketLaunch();
  const launchButtonRef = useRef<HTMLButtonElement>(null);

  async function handleLaunch() {
    rocketLaunch.ask();
    try {
      await confirmation.confirm({
        text: messages.question,
        description: messages.description,
        confirmButtonLabel: messages.confirm,
        cancelButtonLabel: messages.cancel,
        customComponent: renderLaunchDialog,
      });
      rocketLaunch.launch();
    } catch {
      // A rejected confirm() is the visitor saying no.
      rocketLaunch.abort();
    }
    launchButtonRef.current?.focus();
  }

  return (
    <div className="mb-8 grid gap-2">
      <button
        ref={launchButtonRef}
        type="button"
        onClick={handleLaunch}
        className="justify-self-start rounded-lg border border-accent px-3.5 py-2 text-label text-accent transition-colors hover:bg-accent/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {messages.launch}
      </button>
      <p role="status" className="min-h-5 text-label text-muted">
        {getStatusText(rocketLaunch.status)}
      </p>
    </div>
  );
}
