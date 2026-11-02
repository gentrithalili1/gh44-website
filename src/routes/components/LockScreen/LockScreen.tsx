import { useState } from "react";

import { useLock } from "./hooks/useLock";
import { messages } from "./messages";

const ERROR_ID = "lock-screen-error";

interface LockScreenProps {
  children: React.ReactNode;
}

// Temporary gate for testing in production: the site does not mount until the password is in.
export function LockScreen({ children }: LockScreenProps) {
  const lock = useLock();
  const [hasError, setHasError] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = new FormData(event.currentTarget).get("password");
    const outcome = lock.unlock(typeof password === "string" ? password : "");
    switch (outcome.status) {
      case "unlocked":
        return;
      case "failed":
        setHasError(true);
        return;
      default: {
        const unknownOutcome: never = outcome;
        return unknownOutcome;
      }
    }
  }

  if (lock.status === "unlocked") return children;
  // Blank space until the browser's storage is read, so unlocked visitors do not see the form.
  if (lock.status === "checking") return null;

  return (
    <main className="flex h-full items-center justify-center px-5">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-80 flex-col gap-4 rounded-lg border border-rule bg-surface p-6"
      >
        <h1 className="text-planet-sm font-bold tracking-planet">{messages.title}</h1>
        <p className="text-label tracking-label text-muted">{messages.status}</p>
        <label className="flex flex-col gap-1.5 text-label tracking-label text-muted">
          {messages.passwordLabel}
          <input
            name="password"
            type="password"
            autoComplete="off"
            autoFocus
            aria-invalid={hasError}
            aria-describedby={hasError ? ERROR_ID : undefined}
            className="rounded-md border border-rule bg-background px-3 py-2 text-base text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
        </label>
        {hasError ? (
          <p id={ERROR_ID} role="alert" className="text-label tracking-label text-red">
            {messages.wrongPassword}
          </p>
        ) : null}
        <button
          type="submit"
          className="rounded-md bg-accent px-3 py-2 font-bold text-background transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          {messages.unlock}
        </button>
      </form>
    </main>
  );
}
