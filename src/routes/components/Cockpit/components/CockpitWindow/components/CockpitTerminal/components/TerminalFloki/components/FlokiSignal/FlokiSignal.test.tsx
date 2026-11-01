import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubReducedMotion } from "#/test/motion";

import { FlokiSignal } from "./FlokiSignal";

function getSlabs(container: HTMLElement) {
  const slabs = container.firstElementChild;
  if (!(slabs instanceof HTMLElement)) throw new Error("No signal");
  return slabs;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("FlokiSignal", () => {
  it("is four slabs of six cells", () => {
    const { container } = render(<FlokiSignal status="idle" getLevel={() => 0} />);

    expect(getSlabs(container).children).toHaveLength(4);
    expect(getSlabs(container).firstElementChild?.children).toHaveLength(6);
  });

  it("follows the signal while floki speaks", async () => {
    const { container } = render(<FlokiSignal status="speaking" getLevel={() => 1} />);

    await vi.waitFor(() =>
      expect(Number(getSlabs(container).style.getPropertyValue("--floki-level"))).toBeGreaterThan(
        0.5,
      ),
    );
  });

  it("holds still with reduced motion", () => {
    stubReducedMotion(true);
    const { container } = render(<FlokiSignal status="listening" getLevel={() => 1} />);

    expect(getSlabs(container).style.getPropertyValue("--floki-level")).toBe("0.45");
  });

  it("drops to rest when floki stops", () => {
    stubReducedMotion(true);
    const { container, rerender } = render(<FlokiSignal status="speaking" getLevel={() => 1} />);

    rerender(<FlokiSignal status="idle" getLevel={() => 1} />);

    expect(getSlabs(container).style.getPropertyValue("--floki-level")).toBe("");
  });
});
