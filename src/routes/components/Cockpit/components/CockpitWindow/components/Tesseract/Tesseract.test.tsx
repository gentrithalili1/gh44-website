import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Tesseract } from "./Tesseract";
import { COMMITS } from "./utils/commits";

// The 3D scene needs WebGL, which the test browser does not have: the shelf's slider and the
// way back are what a keyboard gets, and what is tested here.
vi.mock("./components/TesseractScene", () => ({ TesseractScene: () => null }));

describe("Tesseract", () => {
  it("opens on the newest commit, with the way back in focus", () => {
    render(<Tesseract onReturn={vi.fn()} />);
    const newest = COMMITS.at(-1);

    expect(screen.getByRole("region", { name: /the tesseract/ })).toBeInTheDocument();
    expect(screen.getByText(newest?.subject.toLowerCase() ?? "")).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`commit ${COMMITS.length} of ${COMMITS.length}`)),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "go back" })).toHaveFocus();
  });

  it("shows another commit from the shelf's slider", () => {
    render(<Tesseract onReturn={vi.fn()} />);
    const [oldest] = COMMITS;

    fireEvent.change(screen.getByRole("slider", { name: "commits, oldest to newest" }), {
      target: { value: "0" },
    });

    expect(screen.getByText(oldest?.subject.toLowerCase() ?? "")).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`commit 1 of ${COMMITS.length}`))).toBeInTheDocument();
  });

  it("goes back on the button", async () => {
    const user = userEvent.setup();
    const onReturn = vi.fn();
    render(<Tesseract onReturn={onReturn} />);

    await user.click(screen.getByRole("button", { name: "go back" }));

    expect(onReturn).toHaveBeenCalledOnce();
  });
});
