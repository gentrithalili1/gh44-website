import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getModelRequests, getSpokenLines, stubFloki, stubSpeechRecognition } from "#/test/floki";

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
    stubFloki({ replies: [{ say: "gh44-brain is how Gentrit works with Claude Code." }] });
    await renderInRouter({ ui: <CockpitTerminal isLocked={false} onGo={vi.fn()} /> });

    await typeCommand("floki what is gh44-brain");

    expect(
      await getOutput().findByText(/gh44-brain is how Gentrit works with Claude Code\./),
    ).toHaveTextContent("floki> gh44-brain is how Gentrit works with Claude Code.");
  });

  it("flies where floki sets course", async () => {
    stubFloki({ replies: [{ say: "Course set for work.", go: "work" }] });
    const onGo = vi.fn();
    await renderInRouter({ ui: <CockpitTerminal isLocked={false} onGo={onGo} /> });

    await typeCommand("floki i want to see where he worked");

    expect(await getOutput().findByText(/Course set for work\./)).toBeInTheDocument();
    await waitFor(() =>
      expect(onGo).toHaveBeenCalledWith(expect.objectContaining({ route: "/work" })),
    );
  });

  it("flies at once on a plain order, without asking the model", async () => {
    const { fetchStub } = stubFloki({ replies: [{ say: "unused" }] });
    const onGo = vi.fn();
    await renderInRouter({ ui: <CockpitTerminal isLocked={false} onGo={onGo} /> });

    await typeCommand("floki take me to saturn");

    expect(getOutput().getByText(/course set for gh44-theme\./)).toBeInTheDocument();
    await waitFor(() =>
      expect(onGo).toHaveBeenCalledWith(expect.objectContaining({ route: "/gh44-theme" })),
    );
    expect(getModelRequests(fetchStub)).toEqual([]);
  });

  it("answers with the humor setting the visitor picked", async () => {
    const { fetchStub } = stubFloki({ replies: [{ say: "Gentrit. Frontend. Kosovo." }] });
    await renderInRouter({ ui: <CockpitTerminal isLocked={false} onGo={vi.fn()} /> });

    await typeCommand("floki set humor to 10%");
    await typeCommand("floki who is gentrit");

    expect(getOutput().getByText(/humor setting: 10%/)).toBeInTheDocument();
    expect(await getOutput().findByText(/Gentrit\. Frontend\. Kosovo\./)).toBeInTheDocument();
    expect(getModelRequests(fetchStub)[0]).toContain("Humor setting: 10%.");
  });

  it("says floki's answer out loud, then flies", async () => {
    const { fetchStub, players } = stubFloki({
      replies: [{ say: "Course set for work.", go: "work" }],
    });
    const onGo = vi.fn();
    await renderInRouter({ ui: <CockpitTerminal isLocked={false} onGo={onGo} /> });

    await typeCommand("floki i want to see where he worked");

    await waitFor(() => expect(onGo).toHaveBeenCalled());
    expect(getSpokenLines(fetchStub)).toEqual(["Course set for work."]);
    expect(players[0]?.play).toHaveBeenCalled();
  });

  it("still answers and flies when the voice is down", async () => {
    stubFloki({ replies: [{ say: "Course set for work.", go: "work" }], hasVoice: false });
    const onGo = vi.fn();
    await renderInRouter({ ui: <CockpitTerminal isLocked={false} onGo={onGo} /> });

    await typeCommand("floki i want to see where he worked");

    expect(await getOutput().findByText(/Course set for work\./)).toBeInTheDocument();
    await waitFor(() => expect(onGo).toHaveBeenCalled());
  });

  it("cuts floki off with a new question, and only the new one decides where to go", async () => {
    const { players } = stubFloki({
      replies: [{ say: "Course set for work.", go: "work" }, { say: "Gentrit built me." }],
      shouldFinishSpeaking: false,
    });
    const onGo = vi.fn();
    await renderInRouter({ ui: <CockpitTerminal isLocked={false} onGo={onGo} /> });

    await typeCommand("floki i want to see where he worked");
    await waitFor(() => expect(players[0]?.play).toHaveBeenCalled());
    await typeCommand("floki who built you");

    expect(await getOutput().findByText(/Gentrit built me\./)).toBeInTheDocument();
    expect(players[0]?.pause).toHaveBeenCalled();
    expect(onGo).not.toHaveBeenCalled();
  });

  it("greets out loud, hears the visitor and flies", async () => {
    const user = userEvent.setup();
    const { fetchStub } = stubFloki({ replies: [{ say: "unused" }] });
    stubSpeechRecognition([{ text: "take me to work" }]);
    const onGo = vi.fn();
    await renderInRouter({ ui: <CockpitTerminal isLocked={false} onGo={onGo} /> });

    await user.click(screen.getByRole("button", { name: "talk to floki" }));

    expect(await getOutput().findByText(/take me to work/)).toHaveTextContent(
      "you> take me to work",
    );
    await waitFor(() =>
      expect(onGo).toHaveBeenCalledWith(expect.objectContaining({ route: "/work" })),
    );
    expect(getSpokenLines(fetchStub)).toEqual(["Floki online. Where to?", "course set for work."]);
  });

  it("keeps listening after each answer, and goes quiet after two silent turns", async () => {
    const user = userEvent.setup();
    stubFloki({ replies: [{ say: "Gentrit built me." }, { say: "In Pristina." }] });
    const recognizers = stubSpeechRecognition([
      { text: "who built you" },
      { text: "where does he live" },
      { error: "no-speech" },
      { error: "no-speech" },
    ]);
    await renderInRouter({ ui: <CockpitTerminal isLocked={false} onGo={vi.fn()} /> });

    await user.click(screen.getByRole("button", { name: "talk to floki" }));

    expect(await getOutput().findByText(/going quiet/)).toBeInTheDocument();
    expect(getOutput().getByText(/Gentrit built me\./)).toBeInTheDocument();
    expect(getOutput().getByText(/In Pristina\./)).toBeInTheDocument();
    expect(recognizers).toHaveLength(4);
    expect(screen.getByRole("button", { name: "talk to floki" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("ends the conversation on stop", async () => {
    const user = userEvent.setup();
    stubFloki({ replies: [{ say: "Gentrit built me." }], shouldFinishSpeaking: false });
    const recognizers = stubSpeechRecognition([{ text: "who built you" }]);
    await renderInRouter({ ui: <CockpitTerminal isLocked={false} onGo={vi.fn()} /> });

    await user.click(screen.getByRole("button", { name: "talk to floki" }));
    await user.click(await screen.findByRole("button", { name: "stop floki" }));

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(recognizers).toEqual([]);
    expect(screen.getByRole("button", { name: "talk to floki" })).toBeInTheDocument();
  });

  it("says when the mic is refused", async () => {
    const user = userEvent.setup();
    stubFloki({ replies: [{ say: "unused" }] });
    stubSpeechRecognition([{ error: "not-allowed" }]);
    await renderInRouter({ ui: <CockpitTerminal isLocked={false} onGo={vi.fn()} /> });

    await user.click(screen.getByRole("button", { name: "talk to floki" }));

    expect(await getOutput().findByText(/no mic access/)).toBeInTheDocument();
  });

  it("has no talk button where the browser cannot hear", async () => {
    await renderInRouter({ ui: <CockpitTerminal isLocked={false} onGo={vi.fn()} /> });

    expect(screen.queryByRole("button", { name: "talk to floki" })).not.toBeInTheDocument();
  });

  it("doesn't fly when the visitor takes the controls while floki speaks", async () => {
    const { players } = stubFloki({
      replies: [{ say: "Course set for work.", go: "work" }],
      shouldFinishSpeaking: false,
    });
    const onGo = vi.fn();
    await renderInRouter({ ui: <CockpitTerminal isLocked={false} onGo={onGo} /> });

    await typeCommand("floki i want to see where he worked");
    await waitFor(() => expect(players[0]?.play).toHaveBeenCalled());
    await typeCommand("go me");

    await waitFor(() => expect(players[0]?.pause).toHaveBeenCalled());
    expect(onGo).toHaveBeenCalledTimes(1);
    expect(onGo).toHaveBeenCalledWith(expect.objectContaining({ route: "/me" }));
  });

  it("neither speaks nor flies once the cockpit closes while floki thinks", async () => {
    const { players } = stubFloki({
      replies: [{ say: "Course set for work.", go: "work" }],
      answerDelay: 30,
    });
    const onGo = vi.fn();
    const { unmount } = await renderInRouter({
      ui: <CockpitTerminal isLocked={false} onGo={onGo} />,
    });

    await typeCommand("floki i want to see where he worked");
    unmount();
    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(players).toEqual([]);
    expect(onGo).not.toHaveBeenCalled();
  });

  it("keeps the mic closed when the greeting is stopped", async () => {
    const user = userEvent.setup();
    stubFloki({ replies: [{ say: "unused" }], shouldFinishSpeaking: false });
    const recognizers = stubSpeechRecognition([{ text: "take me to work" }]);
    await renderInRouter({ ui: <CockpitTerminal isLocked={false} onGo={vi.fn()} /> });

    await user.click(screen.getByRole("button", { name: "talk to floki" }));
    await user.click(await screen.findByRole("button", { name: "stop floki" }));

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(recognizers).toEqual([]);
  });

  it("says when floki's comms are down", async () => {
    stubFloki({ replies: [{ status: 503 }] });
    await renderInRouter({ ui: <CockpitTerminal isLocked={false} onGo={vi.fn()} /> });

    await typeCommand("floki hello");

    expect(await getOutput().findByText(/comms down/)).toBeInTheDocument();
  });

  it("says when floki is cooling down", async () => {
    stubFloki({ replies: [{ status: 429 }] });
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
