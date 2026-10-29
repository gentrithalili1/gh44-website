import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

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
  it("starts in English", () => {
    render(<HomeGreeting />);

    expect(screen.getByText("Hi, I'm Gentrit Halili", VISIBLE)).toBeInTheDocument();
  });

  it("shows the next language after each loop", () => {
    render(<HomeGreeting />);

    finishLoop();

    expect(screen.getByText("Tung, unë jam Gentrit Halili", VISIBLE)).toBeInTheDocument();
  });

  it("keeps each language's own word order", () => {
    render(<HomeGreeting />);

    const japaneseIndex = messages.greetings.findIndex((greeting) => greeting.lang === "ja");
    for (let step = 0; step < japaneseIndex; step++) finishLoop();

    expect(screen.getByText("こんにちは、Gentrit Haliliです。", VISIBLE)).toBeInTheDocument();
  });

  it("returns to English after the last language", () => {
    render(<HomeGreeting />);

    for (let step = 0; step < messages.greetings.length; step++) finishLoop();

    expect(screen.getByText("Hi, I'm Gentrit Halili", VISIBLE)).toBeInTheDocument();
  });
});
