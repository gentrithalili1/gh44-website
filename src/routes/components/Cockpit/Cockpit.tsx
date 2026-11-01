import { useNavigate } from "@tanstack/react-router";
import { useEffect, useEffectEvent } from "react";

import { useExplorer } from "#/hooks/useExplorer";
import type { Destination } from "#/utils/destinations";

import { CockpitWindow } from "./components/CockpitWindow";

// Fields the visitor types in: Cmd+K there belongs to them.
const TYPING_SELECTOR = "input, textarea, select, [contenteditable]:not([contenteditable='false'])";

function isTyping(target: EventTarget | null) {
  return target instanceof Element && target.closest(TYPING_SELECTOR) !== null;
}

// The gh44 explorer's cockpit: Cmd+K (Ctrl+K) or the ship opens it, from anywhere on the site.
// From a launch until its page opens, Cmd+K does nothing.
export function Cockpit() {
  const explorer = useExplorer();
  const navigate = useNavigate();

  const handleShortcut = useEffectEvent((event: KeyboardEvent) => {
    const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
    if (!isShortcut || isTyping(event.target)) return;
    event.preventDefault();
    explorer.openCockpit();
  });

  // Added once: the effect event always reads the current explorer.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      handleShortcut(event);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // The ship in the scene flies there first and opens the page on arrival; without one (reduced
  // motion, no WebGL) the page opens at once.
  function handleGo(destination: Destination) {
    if (explorer.hasShip()) {
      explorer.startFlight(destination);
      return;
    }
    explorer.closeCockpit();
    void navigate({ to: "/$planetId", params: { planetId: destination.name } });
  }

  if (explorer.cockpit.status === "closed") return null;

  return (
    <CockpitWindow
      reveal={explorer.cockpit.status === "open" ? explorer.cockpit.reveal : "instant"}
      isClosing={explorer.cockpit.status === "closing"}
      isLocked={explorer.flight.status === "flying"}
      onClose={explorer.closeCockpit}
      onClosed={explorer.finishClosing}
      onGo={handleGo}
    />
  );
}
