import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useFlokiWelcome } from "./useFlokiWelcome";

function getFloki({ hasGreeted = false } = {}) {
  const greet = vi.fn(async () => "blocked" as const);
  return { floki: { hasGreeted, greet }, greet };
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
});
