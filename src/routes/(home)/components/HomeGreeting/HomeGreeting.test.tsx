import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HomeGreeting } from "./HomeGreeting";
import { messages } from "./messages";

// Every greeting is also stacked invisibly to hold the height, so skip those.
const VISIBLE = { ignore: ".invisible" };

// The loop has no visible text of its own to query by.
function finishLoop() {
  const playingGreeting = document.querySelector(".animate-greeting-in");
  if (!playingGreeting) throw new Error("No greeting is playing");
  fireEvent.animationIteration(playingGreeting);
}

describe("HomeGreeting", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts in English", () => {
    render(<HomeGreeting />);

    expect(screen.getByText("Hi, I'm Gentrit Halili", VISIBLE)).toBeInTheDocument();
  });

  it("shows a random other language after each loop", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    render(<HomeGreeting />);

    finishLoop();

    expect(screen.getByText("你好，我是 Gentrit Halili。", VISIBLE)).toBeInTheDocument();
  });

  it("never shows the same language twice in a row", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    render(<HomeGreeting />);

    finishLoop();
    expect(screen.getByText("Tung, jam Gentrit Halili", VISIBLE)).toBeInTheDocument();

    finishLoop();
    expect(screen.getByText("Hi, I'm Gentrit Halili", VISIBLE)).toBeInTheDocument();
  });

  it("keeps each language's own word order", () => {
    const japaneseIndex = messages.greetings.findIndex((greeting) => greeting.lang === "ja");
    // From English, index - 1 maps to `japaneseIndex` (English is skipped).
    vi.spyOn(Math, "random").mockReturnValue(
      (japaneseIndex - 0.5) / (messages.greetings.length - 1),
    );
    render(<HomeGreeting />);

    finishLoop();

    expect(screen.getByText("こんにちは、Gentrit Haliliです。", VISIBLE)).toBeInTheDocument();
  });
});
