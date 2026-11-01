import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCopyText } from "./useCopyText";

// jsdom has no clipboard: give each test its own writeText.
function stubClipboard(writeText: Clipboard["writeText"]) {
  vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
}

describe("useCopyText", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("copies the text and resets after a moment", async () => {
    const writeText = vi.fn<Clipboard["writeText"]>().mockResolvedValue();
    stubClipboard(writeText);
    const { result } = renderHook(() => useCopyText());

    await act(() => result.current.copy("hello"));

    expect(writeText).toHaveBeenCalledWith("hello");
    expect(result.current.status).toBe("copied");

    act(() => vi.advanceTimersByTime(2000));

    expect(result.current.status).toBe("idle");
  });

  it("reports a failure when the clipboard is blocked", async () => {
    stubClipboard(vi.fn<Clipboard["writeText"]>().mockRejectedValue(new Error("Denied")));
    const { result } = renderHook(() => useCopyText());

    await act(() => result.current.copy("hello"));

    expect(result.current.status).toBe("failed");
  });
});
