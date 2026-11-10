import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MusicProvider } from "#/routes/hooks/useMusic";
import { getModelRequests, getSpokenLines, stubFloki, stubSpeechRecognition } from "#/test/floki";
import { renderInRouter } from "#/test/renderInRouter";

import { CockpitWindow } from "./CockpitWindow";

type RenderCockpitWindowParams = {
  isLocked: boolean;
  onClose: () => void;
  isGreeting?: boolean;
  onBoard?: () => void;
};

async function renderCockpitWindow({
  isLocked,
  onClose,
  isGreeting = false,
  onBoard = vi.fn(),
}: RenderCockpitWindowParams) {
  return renderInRouter({
    ui: (
      <MusicProvider>
        <CockpitWindow
          reveal="instant"
          isGreeting={isGreeting}
          onBoard={onBoard}
          isClosing={false}
          isLocked={isLocked}
          onClose={onClose}
          onClosed={vi.fn()}
          onGo={vi.fn()}
          jumpStatus="idle"
          onJump={vi.fn()}
          onReturn={vi.fn()}
          earthYearsPassed={0}
        />
      </MusicProvider>
    ),
  });
}

describe("CockpitWindow", () => {
  it("closes on Esc", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    await renderCockpitWindow({ isLocked: false, onClose });

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("ignores Esc once a launch is confirmed, and takes no more commands", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    await renderCockpitWindow({ isLocked: true, onClose });

    await user.keyboard("{Escape}");

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "go on a spacewalk" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "command" })).toHaveAttribute("readonly");
  });

  it("shows the ship's name and its systems", async () => {
    await renderCockpitWindow({ isLocked: false, onClose: vi.fn() });

    expect(screen.getByRole("dialog", { name: "gh44 explorer" })).toBeInTheDocument();
    expect(screen.getByText("systems online")).toBeInTheDocument();
  });

  it("takes the command line's focus and holds the page behind as a modal dialog", async () => {
    await renderCockpitWindow({ isLocked: false, onClose: vi.fn() });

    expect(screen.getByRole("dialog", { name: "gh44 explorer" })).toHaveAttribute(
      "aria-modal",
      "true",
    );
    expect(screen.getByRole("textbox", { name: "command" })).toHaveFocus();
  });

  it("greets without a modal or taking focus, and boards once the visitor steps in", async () => {
    const user = userEvent.setup();
    const onBoard = vi.fn();
    await renderCockpitWindow({ isLocked: false, onClose: vi.fn(), isGreeting: true, onBoard });

    const cockpit = screen.getByRole("dialog", { name: "gh44 explorer" });
    expect(cockpit).not.toHaveAttribute("aria-modal");
    expect(screen.getByRole("textbox", { name: "command" })).not.toHaveFocus();

    await user.click(screen.getByRole("textbox", { name: "command" }));

    expect(onBoard).toHaveBeenCalled();
  });
});

type TestJump = { status: "idle" | "inside"; onArrive: (() => void) | null; years: number };

// The whole cockpit, opened by the visitor, for Floki's conversations. Without a scene, as with
// reduced motion: a trip into the black hole puts the visitor inside at once.
function FlokiCockpit({ onGo, isGreeting = false }: { onGo: () => void; isGreeting?: boolean }) {
  const [jump, setJump] = useState<TestJump>({ status: "idle", onArrive: null, years: 0 });

  function handleReturn() {
    jump.onArrive?.();
    setJump({ status: "idle", onArrive: null, years: jump.years + 7 });
  }

  return (
    <MusicProvider>
      <CockpitWindow
        reveal="instant"
        isGreeting={isGreeting}
        onBoard={vi.fn()}
        isClosing={false}
        isLocked={jump.status !== "idle"}
        onClose={vi.fn()}
        onClosed={vi.fn()}
        onGo={onGo}
        jumpStatus={jump.status}
        onJump={(onArrive) => setJump({ ...jump, status: "inside", onArrive })}
        onReturn={handleReturn}
        earthYearsPassed={jump.years}
      />
    </MusicProvider>
  );
}

function getOutput() {
  return within(screen.getByRole("log", { name: "terminal output" }));
}

async function typeCommand(command: string) {
  const user = userEvent.setup();
  await user.type(screen.getByRole("textbox", { name: "command" }), `${command}{Enter}`);
}

describe("CockpitWindow's Floki", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  it("prints floki's answer to a question", async () => {
    stubFloki({ replies: [{ say: "gh44-brain is how Gentrit works with Claude Code." }] });
    await renderInRouter({ ui: <FlokiCockpit onGo={vi.fn()} /> });

    await typeCommand("floki what is gh44-brain");

    expect(
      await getOutput().findByText(/gh44-brain is how Gentrit works with Claude Code\./),
    ).toHaveTextContent("floki> gh44-brain is how Gentrit works with Claude Code.");
  });

  it("flies where floki sets course", async () => {
    stubFloki({ replies: [{ say: "Course set for work.", go: "work" }] });
    const onGo = vi.fn();
    await renderInRouter({ ui: <FlokiCockpit onGo={onGo} /> });

    await typeCommand("floki i want to see where he worked");

    expect(await getOutput().findByText(/Course set for work\./)).toBeInTheDocument();
    await waitFor(() =>
      expect(onGo).toHaveBeenCalledWith(expect.objectContaining({ route: "/work" })),
    );
  });

  it("flies at once on a plain order, without asking the model", async () => {
    const { fetchStub } = stubFloki({ replies: [{ say: "unused" }] });
    const onGo = vi.fn();
    await renderInRouter({ ui: <FlokiCockpit onGo={onGo} /> });

    await typeCommand("floki take me to saturn");

    expect(getOutput().getByText(/course set for gh44-theme\./)).toBeInTheDocument();
    await waitFor(() =>
      expect(onGo).toHaveBeenCalledWith(expect.objectContaining({ route: "/gh44-theme" })),
    );
    expect(getModelRequests(fetchStub)).toEqual([]);
  });

  it("answers with the humor setting the visitor picked", async () => {
    const { fetchStub } = stubFloki({ replies: [{ say: "Gentrit. Frontend. Kosovo." }] });
    await renderInRouter({ ui: <FlokiCockpit onGo={vi.fn()} /> });

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
    await renderInRouter({ ui: <FlokiCockpit onGo={onGo} /> });

    await typeCommand("floki i want to see where he worked");

    await waitFor(() => expect(onGo).toHaveBeenCalled());
    expect(getSpokenLines(fetchStub)).toEqual(["Course set for work."]);
    expect(players[0]?.play).toHaveBeenCalled();
  });

  it("still answers and flies when the voice is down", async () => {
    stubFloki({ replies: [{ say: "Course set for work.", go: "work" }], hasVoice: false });
    const onGo = vi.fn();
    await renderInRouter({ ui: <FlokiCockpit onGo={onGo} /> });

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
    await renderInRouter({ ui: <FlokiCockpit onGo={onGo} /> });

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
    await renderInRouter({ ui: <FlokiCockpit onGo={onGo} /> });

    await user.click(screen.getByRole("button", { name: "ask floki" }));

    expect(await getOutput().findByText(/take me to work/)).toHaveTextContent(
      "you> take me to work",
    );
    await waitFor(() =>
      expect(onGo).toHaveBeenCalledWith(expect.objectContaining({ route: "/work" })),
    );
    expect(getSpokenLines(fetchStub)).toEqual([
      "[[ flˈoʊki ]] here, how can I help?",
      "course set for work.",
    ]);
  });

  it("closes the mic once floki has answered", async () => {
    const user = userEvent.setup();
    stubFloki({ replies: [{ say: "Gentrit built me." }] });
    const recognizers = stubSpeechRecognition([{ text: "who built you" }, { text: "unheard" }]);
    await renderInRouter({ ui: <FlokiCockpit onGo={vi.fn()} /> });

    await user.click(screen.getByRole("button", { name: "ask floki" }));

    expect(await getOutput().findByText(/Gentrit built me\./)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "ask floki" })).toHaveAttribute(
        "aria-pressed",
        "false",
      ),
    );
    expect(recognizers).toHaveLength(1);
  });

  it("says when it heard nothing, and closes the mic", async () => {
    const user = userEvent.setup();
    stubFloki({ replies: [{ say: "unused" }] });
    const recognizers = stubSpeechRecognition([{ error: "no-speech" }]);
    await renderInRouter({ ui: <FlokiCockpit onGo={vi.fn()} /> });

    await user.click(screen.getByRole("button", { name: "ask floki" }));

    expect(await getOutput().findByText(/didn't catch that/)).toBeInTheDocument();
    expect(recognizers).toHaveLength(1);
    expect(screen.getByRole("button", { name: "ask floki" })).toBeInTheDocument();
  });

  it("stops a mic that never ends by itself, with one tap", async () => {
    const user = userEvent.setup();
    stubFloki({ replies: [{ say: "unused" }] });
    stubSpeechRecognition([{ stuck: true }]);
    await renderInRouter({ ui: <FlokiCockpit onGo={vi.fn()} /> });

    await user.click(screen.getByRole("button", { name: "ask floki" }));
    await user.click(await screen.findByRole("button", { name: "stop floki" }));

    expect(await screen.findByRole("button", { name: "ask floki" })).toBeInTheDocument();
    expect(getOutput().queryByText(/going quiet/)).not.toBeInTheDocument();
  });

  it("ends the conversation on stop", async () => {
    const user = userEvent.setup();
    stubFloki({ replies: [{ say: "Gentrit built me." }], shouldFinishSpeaking: false });
    const recognizers = stubSpeechRecognition([{ text: "who built you" }]);
    await renderInRouter({ ui: <FlokiCockpit onGo={vi.fn()} /> });

    await user.click(screen.getByRole("button", { name: "ask floki" }));
    await user.click(await screen.findByRole("button", { name: "stop floki" }));

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(recognizers).toEqual([]);
    expect(screen.getByRole("button", { name: "ask floki" })).toBeInTheDocument();
  });

  it("says when the mic is refused", async () => {
    const user = userEvent.setup();
    stubFloki({ replies: [{ say: "unused" }] });
    stubSpeechRecognition([{ error: "not-allowed" }]);
    await renderInRouter({ ui: <FlokiCockpit onGo={vi.fn()} /> });

    await user.click(screen.getByRole("button", { name: "ask floki" }));

    expect(await getOutput().findByText(/no mic access/)).toBeInTheDocument();
  });

  it("has no talk button where the browser cannot hear", async () => {
    await renderInRouter({ ui: <FlokiCockpit onGo={vi.fn()} /> });

    expect(screen.queryByRole("button", { name: "ask floki" })).not.toBeInTheDocument();
  });

  it("doesn't fly when the visitor takes the controls while floki speaks", async () => {
    const { players } = stubFloki({
      replies: [{ say: "Course set for work.", go: "work" }],
      shouldFinishSpeaking: false,
    });
    const onGo = vi.fn();
    await renderInRouter({ ui: <FlokiCockpit onGo={onGo} /> });

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
      ui: <FlokiCockpit onGo={onGo} />,
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
    await renderInRouter({ ui: <FlokiCockpit onGo={vi.fn()} /> });

    await user.click(screen.getByRole("button", { name: "ask floki" }));
    await user.click(await screen.findByRole("button", { name: "stop floki" }));

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(recognizers).toEqual([]);
  });

  it("says when floki's comms are down", async () => {
    stubFloki({ replies: [{ status: 503 }] });
    await renderInRouter({ ui: <FlokiCockpit onGo={vi.fn()} /> });

    await typeCommand("floki hello");

    expect(await getOutput().findByText(/comms down/)).toBeInTheDocument();
  });

  it("says when floki is cooling down", async () => {
    stubFloki({ replies: [{ status: 429 }] });
    await renderInRouter({ ui: <FlokiCockpit onGo={vi.fn()} /> });

    await typeCommand("floki hello");

    expect(await getOutput().findByText(/cooling down/)).toBeInTheDocument();
  });

  it("welcomes out loud when the cockpit opens to greet, and talk then listens", async () => {
    const user = userEvent.setup();
    const { fetchStub } = stubFloki({ replies: [{ say: "unused" }] });
    const recognizers = stubSpeechRecognition([{ error: "no-speech" }]);
    await renderInRouter({ ui: <FlokiCockpit onGo={vi.fn()} isGreeting /> });

    await waitFor(() =>
      expect(getSpokenLines(fetchStub)[0]).toMatch(
        /^Welcome aboard, stranger! I'm \[\[ flˈoʊki \]\], the captain's/,
      ),
    );
    await user.click(screen.getByRole("button", { name: "ask floki" }));

    await waitFor(() => expect(recognizers.length).toBeGreaterThan(0));
  });

  it("flies into gargantua once every planet is visited, and counts it on return", async () => {
    sessionStorage.setItem(
      "gh44-explorer-visits",
      JSON.stringify(["me", "gh44-confirm", "work", "gh44-theme", "gh44-brain"]),
    );
    const user = userEvent.setup();
    await renderInRouter({ ui: <FlokiCockpit onGo={vi.fn()} /> });
    const output = within(screen.getByRole("log", { name: "terminal output" }));
    expect(
      output.getByText("!! signal detected. not a planet. not on any chart."),
    ).toBeInTheDocument();
    expect(screen.getByText("signal detected · gargantua")).toBeInTheDocument();

    // The name in the alert is the way there.
    await user.click(output.getByRole("button", { name: "gargantua" }));

    expect(screen.getByText("nothing in here. not even light.")).toBeInTheDocument();
    const back = screen.getByRole("button", { name: "go back" });
    expect(back).toHaveFocus();
    const yearNow = new Date().getFullYear();
    expect(screen.getByLabelText(new RegExp(`^earth time: .*${yearNow}`))).toBeInTheDocument();

    await user.click(back);

    expect(screen.queryByRole("button", { name: "go back" })).not.toBeInTheDocument();
    expect(output.getByText("that took 8 seconds. 7 years passed on earth.")).toBeInTheDocument();
    expect(screen.getByText("systems online")).toBeInTheDocument();
    expect(screen.getByLabelText(new RegExp(`^earth time: .*${yearNow + 7}`))).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "radar" })).getByText("6/5"),
    ).toBeInTheDocument();
    expect(sessionStorage.getItem("gh44-explorer-secrets")).toBe('["horizon"]');
  });
});
