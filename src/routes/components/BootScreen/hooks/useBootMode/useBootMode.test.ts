import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { SpaceMode } from "#/hooks/useSpaceMode";

import { useBootMode } from "./useBootMode";

const spaceMode = vi.hoisted(() => {
  const state: { current: SpaceMode } = { current: "scene" };
  return state;
});
vi.mock("#/hooks/useSpaceMode", () => ({ useSpaceMode: () => spaceMode.current }));

afterEach(() => {
  spaceMode.current = "scene";
  sessionStorage.clear();
});

describe("useBootMode", () => {
  it("plays the whole boot on the session's first load", () => {
    const { result } = renderHook(() => useBootMode());

    expect(result.current.status).toBe("full");
  });

  it("plays the short version once the boot has played in this tab", () => {
    renderHook(() => useBootMode()).result.current.markBooted();

    expect(renderHook(() => useBootMode()).result.current.status).toBe("quick");
  });

  it("skips the boot without a 3D scene to wait for", () => {
    spaceMode.current = "static";

    expect(renderHook(() => useBootMode()).result.current.status).toBe("skip");
  });
});
