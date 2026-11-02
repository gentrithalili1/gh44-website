import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BootProvider, useBoot } from "./useBoot";

describe("useBoot", () => {
  it("starts with the scene not ready, and remembers once it is", () => {
    const { result } = renderHook(() => useBoot(), { wrapper: BootProvider });

    expect(result.current.isSceneReady).toBe(false);
    act(() => result.current.markSceneReady());
    expect(result.current.isSceneReady).toBe(true);
  });

  it("needs its provider", () => {
    expect(() => renderHook(() => useBoot())).toThrow("useBoot must be used inside BootProvider");
  });
});
