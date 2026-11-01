import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TerminalFloki } from "./TerminalFloki";

describe("TerminalFloki", () => {
  it("shows what floki is doing", () => {
    render(<TerminalFloki status="thinking" canListen isLocked={false} onTalk={vi.fn()} />);

    expect(screen.getByRole("status")).toHaveTextContent("thinking…");
  });

  it("talks to floki on the button", async () => {
    const user = userEvent.setup();
    const onTalk = vi.fn();
    render(<TerminalFloki status="idle" canListen isLocked={false} onTalk={onTalk} />);

    await user.click(screen.getByRole("button", { name: "talk to floki" }));

    expect(onTalk).toHaveBeenCalled();
    expect(screen.getByText("your browser transcribes what you say.")).toBeInTheDocument();
  });

  it("offers to stop floki while he listens", () => {
    render(<TerminalFloki status="listening" canListen isLocked={false} onTalk={vi.fn()} />);

    expect(screen.getByRole("button", { name: "stop floki" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("asks to type where the browser cannot hear", () => {
    render(<TerminalFloki status="idle" canListen={false} isLocked={false} onTalk={vi.fn()} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("no mic here. type floki <question>.")).toBeInTheDocument();
  });
});
