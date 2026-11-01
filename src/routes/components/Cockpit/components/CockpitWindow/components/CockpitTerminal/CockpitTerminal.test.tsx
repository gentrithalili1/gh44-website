import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubGroq } from "#/test/groq";

import { renderInRouter } from "#/test/renderInRouter";

import { CockpitTerminal } from "./CockpitTerminal";

function getOutput() {
  return within(screen.getByRole("log", { name: "terminal output" }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

async function typeCommand(command: string) {
  const user = userEvent.setup();
  await user.type(screen.getByRole("textbox", { name: "command" }), `${command}{Enter}`);
}

describe("CockpitTerminal", () => {
  it("greets the visitor as floki", async () => {
    await renderInRouter({ ui: <CockpitTerminal isLocked={false} onGo={vi.fn()} /> });

    expect(getOutput().getByText(/floki online/)).toBeInTheDocument();
  });

  it("prints floki's answer to a question", async () => {
    stubGroq([{ say: "gh44-brain is how Gentrit works with Claude Code." }]);
    await renderInRouter({ ui: <CockpitTerminal isLocked={false} onGo={vi.fn()} /> });

    await typeCommand("floki what is gh44-brain");

    expect(
      await getOutput().findByText(/gh44-brain is how Gentrit works with Claude Code\./),
    ).toHaveTextContent("floki> gh44-brain is how Gentrit works with Claude Code.");
  });

  it("flies where floki sets course", async () => {
    stubGroq([{ say: "Course set for work.", go: "work" }]);
    const onGo = vi.fn();
    await renderInRouter({ ui: <CockpitTerminal isLocked={false} onGo={onGo} /> });

    await typeCommand("floki i want to see where he worked");

    expect(await getOutput().findByText(/Course set for work\./)).toBeInTheDocument();
    expect(onGo).toHaveBeenCalledWith(expect.objectContaining({ route: "/work" }));
  });

  it("flies at once on a plain order, without asking the model", async () => {
    const fetchStub = stubGroq([{ say: "unused" }]);
    const onGo = vi.fn();
    await renderInRouter({ ui: <CockpitTerminal isLocked={false} onGo={onGo} /> });

    await typeCommand("floki take me to saturn");

    expect(getOutput().getByText(/course set for gh44-theme\./)).toBeInTheDocument();
    expect(onGo).toHaveBeenCalledWith(expect.objectContaining({ route: "/gh44-theme" }));
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it("answers with the humor setting the visitor picked", async () => {
    const fetchStub = stubGroq([{ say: "Gentrit. Frontend. Kosovo." }]);
    await renderInRouter({ ui: <CockpitTerminal isLocked={false} onGo={vi.fn()} /> });

    await typeCommand("floki set humor to 10%");
    await typeCommand("floki who is gentrit");

    expect(getOutput().getByText(/humor setting: 10%/)).toBeInTheDocument();
    expect(await getOutput().findByText(/Gentrit\. Frontend\. Kosovo\./)).toBeInTheDocument();
    expect(String(fetchStub.mock.calls[0]?.[1]?.body)).toContain("Humor setting: 10%.");
  });

  it("says when floki's comms are down", async () => {
    stubGroq([{ status: 503 }]);
    await renderInRouter({ ui: <CockpitTerminal isLocked={false} onGo={vi.fn()} /> });

    await typeCommand("floki hello");

    expect(await getOutput().findByText(/comms down/)).toBeInTheDocument();
  });

  it("says when floki is cooling down", async () => {
    stubGroq([{ status: 429 }]);
    await renderInRouter({ ui: <CockpitTerminal isLocked={false} onGo={vi.fn()} /> });

    await typeCommand("floki hello");

    expect(await getOutput().findByText(/cooling down/)).toBeInTheDocument();
  });

  it("runs go for a destination clicked in the output", async () => {
    const user = userEvent.setup();
    const onGo = vi.fn();
    await renderInRouter({ ui: <CockpitTerminal isLocked={false} onGo={onGo} /> });

    await user.click(getOutput().getByRole("link", { name: "gh44-theme" }));

    expect(onGo).toHaveBeenCalledWith(expect.objectContaining({ route: "/gh44-theme" }));
    expect(screen.getByRole("log", { name: "terminal output" })).toHaveTextContent(
      "gh44@explorer:~$ go gh44-theme",
    );
  });

  it("takes no clicks on destinations once a launch is locked in", async () => {
    const user = userEvent.setup();
    const onGo = vi.fn();
    await renderInRouter({ ui: <CockpitTerminal isLocked onGo={onGo} /> });

    const link = getOutput().getByRole("link", { name: "work" });
    await user.click(link);

    expect(onGo).not.toHaveBeenCalled();
    expect(link).toHaveAttribute("aria-disabled", "true");
  });

  it("is a zsh window", async () => {
    await renderInRouter({ ui: <CockpitTerminal isLocked={false} onGo={vi.fn()} /> });

    expect(screen.getByRole("region", { name: "gh44@explorer — zsh" })).toBeInTheDocument();
  });
});
