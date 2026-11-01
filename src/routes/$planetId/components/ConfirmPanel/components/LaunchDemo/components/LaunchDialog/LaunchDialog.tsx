import { useId, useRef } from "react";
import type { PromiseConfirmationData } from "react-promise-confirmation-dialog";

type LaunchDialogProps = Pick<
  PromiseConfirmationData,
  "text" | "description" | "confirmButtonLabel" | "cancelButtonLabel" | "onConfirm" | "onCancel"
>;

// The package's dialog in gh44 colors: it renders this inside its own overlay and resolves or
// rejects the `confirm()` promise from the two buttons. Esc and the overlay's focus stay here.
export function LaunchDialog({
  text,
  description,
  confirmButtonLabel,
  cancelButtonLabel,
  onConfirm,
  onCancel,
}: LaunchDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      // Tells the planet page's Esc (back to orbit) that the dialog took it.
      event.preventDefault();
      onCancel();
      return;
    }
    if (event.key !== "Tab") return;
    event.preventDefault();
    const next = document.activeElement === cancelRef.current ? confirmRef : cancelRef;
    next.current?.focus();
  }

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onKeyDown={handleKeyDown}
      className="mx-5 w-full max-w-sm rounded-lg border border-rule bg-background p-6 font-mono text-foreground"
    >
      <h2 id={titleId} className="mb-2 text-lede font-bold text-accent">
        {text}
      </h2>
      {description ? (
        <p id={descriptionId} className="mb-6 text-label text-muted">
          {description}
        </p>
      ) : null}
      <div className="flex justify-end gap-2.5">
        <button
          ref={cancelRef}
          type="button"
          // The safe choice takes focus first.
          autoFocus
          onClick={() => onCancel()}
          className="rounded-lg border border-rule px-3.5 py-2 text-label text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-muted"
        >
          {cancelButtonLabel}
        </button>
        <button
          ref={confirmRef}
          type="button"
          onClick={onConfirm}
          className="rounded-lg border border-accent px-3.5 py-2 text-label text-accent transition-colors hover:bg-accent/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {confirmButtonLabel}
        </button>
      </div>
    </div>
  );
}
