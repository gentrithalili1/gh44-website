import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { endAnimation } from "#/test/motion";

import { BootLine } from "./BootLine";

function renderLine({ isReady, onDone = vi.fn() }: { isReady: boolean; onDone?: () => void }) {
  const view = render(
    <ul>
      <BootLine label="igniting the sun" status="ok" tone="ok" isReady={isReady} onDone={onDone} />
    </ul>,
  );
  const finishTyping = () => endAnimation(screen.getByText(/^igniting the sun \.+$/));

  return { ...view, finishTyping, onDone };
}

describe("BootLine", () => {
  it("types the label, then shows the status once the step is ready", () => {
    const { finishTyping, onDone } = renderLine({ isReady: true });

    expect(screen.queryByText("ok")).not.toBeInTheDocument();
    finishTyping();
    endAnimation(screen.getByText("ok"));

    expect(onDone).toHaveBeenCalledOnce();
  });

  it("holds the status until the step is ready", () => {
    const onDone = vi.fn();
    const { finishTyping, rerender } = renderLine({ isReady: false, onDone });
    finishTyping();

    expect(screen.queryByText("ok")).not.toBeInTheDocument();
    rerender(
      <ul>
        <BootLine label="igniting the sun" status="ok" tone="ok" isReady onDone={onDone} />
      </ul>,
    );
    expect(screen.getByText("ok")).toBeInTheDocument();
  });
});
