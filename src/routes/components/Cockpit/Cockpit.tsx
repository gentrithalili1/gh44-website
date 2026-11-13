import { useNavigate } from "@tanstack/react-router";
import { useEffect, useEffectEvent } from "react";

import { useExplorer } from "#/hooks/useExplorer";
import type { Destination } from "#/utils/destinations";

import { CockpitWindow } from "./components/CockpitWindow";

// The cockpit's command line, which Cmd+K focuses when the cockpit is already up.
const COMMAND_SELECTOR = "[data-cockpit-command]";
// Fields the visitor types in: Cmd+K there belongs to them.
const TYPING_SELECTOR = "input, textarea, select, [contenteditable]:not([contenteditable='false'])";

function isTyping(target: EventTarget | null) {
  return target instanceof Element && target.closest(TYPING_SELECTOR) !== null;
}

export function Cockpit() {
  const explorer = useExplorer();
  const navigate = useNavigate();

  const handleShortcut = useEffectEvent((event: KeyboardEvent) => {
    const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
    if (!isShortcut || isTyping(event.target)) return;
    event.preventDefault();
    explorer.openCockpit();
    // A cockpit already up (greeting the visitor) takes them to its command line.
    document.querySelector<HTMLInputElement>(COMMAND_SELECTOR)?.focus();
  });

  // Added once: the effect event always reads the current explorer.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      handleShortcut(event);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleGo(destination: Destination) {
    const outcome = explorer.launch(destination);
    switch (outcome.status) {
      case "flying":
        return;
      case "arrived":
        void navigate({ to: "/$planetId", params: { planetId: destination.name } });
        return;
      default: {
        const unknownOutcome: never = outcome;
        return unknownOutcome;
      }
    }
  }

  if (explorer.cockpit.status === "closed") return null;

  return (
    <CockpitWindow
      reveal={explorer.cockpit.status === "open" ? explorer.cockpit.reveal : "instant"}
      isGreeting={explorer.cockpit.status === "open" && explorer.cockpit.isGreeting}
      onBoard={explorer.boardCockpit}
      isClosing={explorer.cockpit.status === "closing"}
      isLocked={explorer.flight.status === "flying" || explorer.jump.status !== "idle"}
      jumpStatus={explorer.jump.status}
      onJump={explorer.startJump}
      onReturn={explorer.endJump}
      earthYearsPassed={explorer.earthYearsPassed}
      onClose={explorer.closeCockpit}
      onClosed={explorer.finishClosing}
      onGo={handleGo}
    />
  );
}
