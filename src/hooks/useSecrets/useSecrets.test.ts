import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { findSecret, useSecrets } from "./useSecrets";

describe("useSecrets", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("starts with nothing found", () => {
    const { result } = renderHook(() => useSecrets());

    expect(result.current).toEqual({ hasBall: false, hasCrossedHorizon: false });
  });

  it("keeps each secret once it is found", () => {
    const { result } = renderHook(() => useSecrets());

    act(() => findSecret("ball"));
    act(() => findSecret("ball"));
    expect(result.current).toEqual({ hasBall: true, hasCrossedHorizon: false });

    act(() => findSecret("horizon"));
    expect(result.current).toEqual({ hasBall: true, hasCrossedHorizon: true });
    expect(sessionStorage.getItem("gh44-explorer-secrets")).toBe('["ball","horizon"]');
  });

  it("ignores storage it did not write", () => {
    sessionStorage.setItem("gh44-explorer-secrets", '{"ball":true}');
    const { result } = renderHook(() => useSecrets());

    expect(result.current.hasBall).toBe(false);
  });
});
