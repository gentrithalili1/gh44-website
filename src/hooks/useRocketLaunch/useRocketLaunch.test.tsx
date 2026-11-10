import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { isRocketOnStage, RocketLaunchProvider, useRocketLaunch } from "./useRocketLaunch";

function renderLaunch() {
  return renderHook(() => useRocketLaunch(), { wrapper: RocketLaunchProvider });
}

describe("useRocketLaunch", () => {
  it("puts a new rocket on the pad when asked, and flies it on launch", () => {
    const { result } = renderLaunch();

    act(() => result.current.ask());
    expect(result.current).toMatchObject({ status: "asking", launchId: 1 });
    expect(isRocketOnStage(result.current.status)).toBe(true);

    act(() => result.current.launch());
    expect(result.current.status).toBe("launched");
    expect(isRocketOnStage(result.current.status)).toBe(true);

    act(() => result.current.ask());
    expect(result.current.launchId).toBe(2);
  });

  it("takes the rocket down on abort", () => {
    const { result } = renderLaunch();

    act(() => result.current.ask());
    act(() => result.current.abort());

    expect(isRocketOnStage(result.current.status)).toBe(false);
  });

  it("shows no rocket without a provider", () => {
    const { result } = renderHook(() => useRocketLaunch());

    expect(result.current.status).toBe("idle");
  });
});
