import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { Tesseract } from "./Tesseract";
import { COMMITS } from "./utils/commits";

// The 3D scene needs WebGL, which the test browser does not have: the talk box, the shelf's
// slider and the way back are what is tested here.
vi.mock("./components/TesseractScene", () => ({ TesseractScene: () => null }));

function renderTesseract(props: Partial<ComponentProps<typeof Tesseract>> = {}) {
  return render(
    <Tesseract
      flokiStatus="idle"
      canListen
      isConversing={false}
      lines={[]}
      onAsk={vi.fn()}
      onTalk={vi.fn()}
      onReturn={vi.fn()}
      {...props}
    />,
  );
}

describe("Tesseract", () => {
  it("opens on the newest commit, with floki waiting and the line to him in focus", () => {
    renderTesseract();
    const newest = COMMITS.at(-1);

    expect(screen.getByRole("region", { name: /the tesseract/ })).toBeInTheDocument();
    expect(screen.getByText(newest?.subject.toLowerCase() ?? "")).toBeInTheDocument();
    expect(
      screen.getByText(/we're inside\. ask me what this is, or say go back\./),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "ask floki" })).toHaveFocus();
  });

  it("hands a typed question to floki", async () => {
    const user = userEvent.setup();
    const onAsk = vi.fn();
    renderTesseract({ onAsk });

    await user.type(
      screen.getByRole("textbox", { name: "ask floki" }),
      "floki what is this{Enter}",
    );

    expect(onAsk).toHaveBeenCalledWith("floki what is this");
    expect(screen.getByRole("textbox", { name: "ask floki" })).toHaveValue("");
  });

  it("shows what was said in here, not what was said before", () => {
    const before = [{ id: 0, kind: "floki", text: "floki here, how can I help?" }] as const;
    const { rerender } = renderTesseract({ lines: before });
    expect(screen.queryByText(/how can I help/)).not.toBeInTheDocument();

    rerender(
      <Tesseract
        flokiStatus="idle"
        canListen
        isConversing={false}
        lines={[
          ...before,
          { id: 1, kind: "visitor", text: "what is this" },
          { id: 2, kind: "floki", text: "the tesseract." },
        ]}
        onAsk={vi.fn()}
        onTalk={vi.fn()}
        onReturn={vi.fn()}
      />,
    );

    expect(screen.getByText("what is this")).toBeInTheDocument();
    expect(screen.getByText(/the tesseract\./)).toBeInTheDocument();
  });

  it("talks out loud on the button, when the browser can listen", async () => {
    const user = userEvent.setup();
    const onTalk = vi.fn();
    const { rerender } = renderTesseract({ onTalk });

    await user.click(screen.getByRole("button", { name: "talk to floki" }));
    expect(onTalk).toHaveBeenCalledOnce();

    rerender(
      <Tesseract
        flokiStatus="idle"
        canListen={false}
        isConversing={false}
        lines={[]}
        onAsk={vi.fn()}
        onTalk={onTalk}
        onReturn={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: "talk to floki" })).not.toBeInTheDocument();
  });

  it("shows another commit from the shelf's slider", () => {
    renderTesseract();
    const [oldest] = COMMITS;

    fireEvent.change(screen.getByRole("slider", { name: "commits, oldest to newest" }), {
      target: { value: "0" },
    });

    expect(screen.getByText(oldest?.subject.toLowerCase() ?? "")).toBeInTheDocument();
  });

  it("goes back on the button", async () => {
    const user = userEvent.setup();
    const onReturn = vi.fn();
    renderTesseract({ onReturn });

    await user.click(screen.getByRole("button", { name: "go back" }));

    expect(onReturn).toHaveBeenCalledOnce();
  });
});
