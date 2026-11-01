import { cleanup, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { renderAt } from "#/test/renderAt";

import { useExploration } from "./useExploration";

describe("useExploration", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("has visited nothing on the home page of a fresh tab", async () => {
    await renderAt("/");

    const { result } = renderHook(() => useExploration());

    expect(result.current.visitedIds).toEqual([]);
  });

  it("marks a planet visited once its page opens", async () => {
    await renderAt("/work");

    const { result } = renderHook(() => useExploration());

    expect(result.current.visitedIds).toEqual(["work"]);
  });

  it("counts each planet once, in the order first visited", async () => {
    const user = userEvent.setup();
    await renderAt("/work");

    await user.click(screen.getByRole("link", { name: "me" }));
    await screen.findByRole("heading", { level: 1, name: "gentrit halili" });
    await user.click(screen.getByRole("link", { name: "work" }));
    await screen.findByRole("heading", { level: 1, name: "work" });

    const { result } = renderHook(() => useExploration());
    expect(result.current.visitedIds).toEqual(["work", "me"]);
  });

  it("keeps the visits after a reload in the same tab", async () => {
    await renderAt("/me");
    cleanup();
    await renderAt("/work");

    const { result } = renderHook(() => useExploration());

    expect(result.current.visitedIds).toEqual(["me", "work"]);
  });
});
