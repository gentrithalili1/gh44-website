import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useFlokiWelcome } from "./useFlokiWelcome";

function getFloki({ hasGreeted = false } = {}) {
  const greet = vi.fn(async () => "blocked" as const);
  return { floki: { hasGreeted, greet, prepareAudio: vi.fn() }, greet };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useFlokiWelcome", () => {
  it("welcomes when the cockpit opens to greet, and again on the first key if blocked", () => {
    const { floki, greet } = getFloki();
    renderHook(() => useFlokiWelcome({ floki, isGreeting: true, text: "Welcome aboard." }));

    expect(greet).toHaveBeenCalledWith("Welcome aboard.");
    document.dispatchEvent(new KeyboardEvent("keydown"));
    expect(greet).toHaveBeenCalledTimes(2);
  });

  it("stays quiet when the visitor opened the cockpit", () => {
    const { floki, greet } = getFloki();
    renderHook(() => useFlokiWelcome({ floki, isGreeting: false, text: "Welcome aboard." }));

    document.dispatchEvent(new KeyboardEvent("keydown"));
    expect(greet).not.toHaveBeenCalled();
  });

  it("doesn't greet twice", () => {
    const { floki, greet } = getFloki({ hasGreeted: true });
    renderHook(() => useFlokiWelcome({ floki, isGreeting: true, text: "Welcome aboard." }));

    expect(greet).not.toHaveBeenCalled();
  });

  it("leaves a first tap on talk to talk, which greets on its own", () => {
    const { floki, greet } = getFloki();
    renderHook(() => useFlokiWelcome({ floki, isGreeting: true, text: "Welcome aboard." }));
    const talk = document.createElement("button");
    talk.dataset.flokiTalk = "";
    document.body.append(talk);

    talk.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));

    expect(greet).toHaveBeenCalledTimes(1);
    talk.remove();
  });

  it("greets on a phone, where only the end of a tap lets sound start", async () => {
    // Phones count a tap as a gesture once it ends (click), not when it starts (pointerdown).
    let hasActivation = false;
    function grantActivation() {
      hasActivation = true;
      queueMicrotask(() => {
        hasActivation = false;
      });
    }
    document.addEventListener("click", grantActivation, true);
    let isAudioUnlocked = false;
    const prepareAudio = vi.fn(() => {
      if (hasActivation) isAudioUnlocked = true;
    });
    let hasGreeted = false;
    const lines: Promise<"spoken" | "blocked">[] = [];
    const greet = vi.fn(async () => {
      hasGreeted = true;
      prepareAudio();
      const line = new Promise<"spoken" | "blocked">((resolve) =>
        setTimeout(() => resolve(isAudioUnlocked ? "spoken" : "blocked"), 0),
      );
      lines.push(line);
      return line;
    });
    const floki = {
      get hasGreeted() {
        return hasGreeted;
      },
      greet,
      prepareAudio,
    };
    renderHook(() => useFlokiWelcome({ floki, isGreeting: true, text: "Welcome aboard." }));

    // A tap while the first try is still on its way.
    document.dispatchEvent(new PointerEvent("pointerdown", { pointerType: "touch" }));
    document.dispatchEvent(new MouseEvent("click"));

    expect(await Promise.all(lines)).toContain("spoken");
    document.removeEventListener("click", grantActivation, true);
  });
});
