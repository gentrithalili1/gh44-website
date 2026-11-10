import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EarthClock } from "./EarthClock";

describe("EarthClock", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows this year before any trip, and the years a trip cost after it", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));
    const { rerender } = render(<EarthClock yearsPassed={0} />);
    expect(screen.getByLabelText(/^earth time: .*2026/)).toBeInTheDocument();

    rerender(<EarthClock yearsPassed={7} />);

    expect(screen.getByLabelText(/^earth time: .*2033/)).toBeInTheDocument();
  });
});
