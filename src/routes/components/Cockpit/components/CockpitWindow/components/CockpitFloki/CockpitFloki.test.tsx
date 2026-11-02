import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { CockpitFloki } from "./CockpitFloki";

function renderFloki(props: Partial<ComponentProps<typeof CockpitFloki>> = {}) {
  return render(
    <CockpitFloki
      status="idle"
      getLevel={() => 0}
      canListen
      isConversing={false}
      isLocked={false}
      onTalk={vi.fn()}
      {...props}
    />,
  );
}

describe("CockpitFloki", () => {
  it("shows what floki is doing, with his head and signal", () => {
    const { container } = renderFloki({ status: "thinking" });

    expect(screen.getByRole("status")).toHaveTextContent("thinking…");
    expect(container.querySelector("[data-status=thinking] svg")).toBeInTheDocument();
  });

  it("talks to floki on the button", async () => {
    const user = userEvent.setup();
    const onTalk = vi.fn();
    renderFloki({ onTalk });

    await user.click(screen.getByRole("button", { name: "ask floki" }));

    expect(onTalk).toHaveBeenCalled();
    expect(screen.getByText("your browser transcribes what you say.")).toBeInTheDocument();
  });

  it("offers to stop floki during a conversation", () => {
    renderFloki({ status: "listening", isConversing: true });

    expect(screen.getByRole("button", { name: "stop floki" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("asks to type where the browser cannot hear", () => {
    renderFloki({ canListen: false });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("no mic here. type floki <question>.")).toBeInTheDocument();
  });
});
