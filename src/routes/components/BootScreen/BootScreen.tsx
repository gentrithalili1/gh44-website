import { useLocation } from "@tanstack/react-router";
import { useState } from "react";

import { useBoot } from "#/hooks/useBoot";
import { useExplorer } from "#/hooks/useExplorer";
import { PLANETS } from "#/utils/planets";

import { BootCursor, BootOrbits, BootSun } from "./BootScreen.elements";
import { BootLine } from "./components/BootLine";
import { useBootMode } from "./hooks/useBootMode";
import { messages } from "./messages";

const HOME_PATH = "/";

type BootStatus = "booting" | "leaving" | "done";

// The pre-flight boot: covers the page while the 3D scene loads, so the planets and the cockpit
// do not pop in one by one. Each log line lands as its real step finishes; then the cover fades
// and the cockpit greets the visitor. Without a 3D scene (no WebGL, reduced motion) it steps
// aside at once.
export function BootScreen() {
  const boot = useBoot();
  const bootMode = useBootMode();
  const explorer = useExplorer();
  const pathname = useLocation({ select: (location) => location.pathname });
  const [status, setStatus] = useState<BootStatus>("booting");
  const [doneLineCount, setDoneLineCount] = useState(0);
  const [areOrbitsDrawn, setAreOrbitsDrawn] = useState(false);

  const isSceneReady = boot.isSceneReady;

  const lines = [
    { label: messages.lines.scene, status: messages.ok, tone: "ok", isReady: isSceneReady },
    {
      label: messages.lines.orbits(PLANETS.length),
      status: messages.ok,
      tone: "ok",
      isReady: areOrbitsDrawn,
    },
    { label: messages.lines.floki, status: messages.woof, tone: "floki", isReady: true },
  ] as const;
  const isLeaving =
    status === "leaving" || (bootMode.status === "quick" && isSceneReady && status === "booting");

  function handleLineDone(index: number) {
    if (index === lines.length - 1) setStatus("leaving");
    else setDoneLineCount(index + 1);
  }

  function handleOrbitsDrawn() {
    setAreOrbitsDrawn(true);
  }

  function handleSkip() {
    setStatus("leaving");
  }

  function handleLeft(event: React.AnimationEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    setStatus("done");
    bootMode.markBooted();
    if (isSceneReady && pathname === HOME_PATH) explorer.greetVisitor();
  }

  if (bootMode.status === "skip" || status === "done") return null;

  return (
    <div
      data-boot-screen
      data-state={isLeaving ? "leaving" : "booting"}
      onClick={handleSkip}
      onAnimationEnd={handleLeft}
      className="fixed inset-0 z-60 bg-background data-[state=leaving]:pointer-events-none data-[state=leaving]:animate-boot-leave"
    >
      <p role="status" className="sr-only">
        {messages.status}
      </p>
      <div aria-hidden="true">
        <BootSun />
        {bootMode.status === "full" && doneLineCount >= 1 ? (
          <BootOrbits count={PLANETS.length} onDrawn={handleOrbitsDrawn} />
        ) : null}
        {bootMode.status === "full" ? (
          <ol className="absolute bottom-6 left-4 flex flex-col gap-1 font-mono text-label tracking-label md:bottom-10 md:left-10">
            {lines.slice(0, doneLineCount + 1).map((line, index) => (
              <BootLine
                key={line.label}
                label={line.label}
                status={line.status}
                tone={line.tone}
                isReady={line.isReady}
                onDone={() => handleLineDone(index)}
              />
            ))}
            <BootCursor />
          </ol>
        ) : null}
      </div>
    </div>
  );
}
