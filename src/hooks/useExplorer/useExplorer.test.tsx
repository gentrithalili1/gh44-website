import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DESTINATIONS } from "#/utils/destinations";

import { ExplorerProvider, useExplorer } from "./useExplorer";

function renderExplorer() {
  return renderHook(() => useExplorer(), { wrapper: ExplorerProvider });
}

const [WORK] = DESTINATIONS.filter((destination) => destination.name === "work");

describe("useExplorer", () => {
  it("opens and closes the cockpit at once without a ship in the scene", () => {
    const { result } = renderExplorer();

    act(() => result.current.openCockpit());
    expect(result.current.cockpit).toEqual({ status: "open", reveal: "instant" });

    act(() => result.current.closeCockpit());
    expect(result.current.cockpit).toEqual({ status: "closed" });
  });

  it("flies to the ship to open, and fades out to close, with a ship aboard", () => {
    const { result } = renderExplorer();
    act(() => {
      result.current.boardShip();
    });

    act(() => result.current.openCockpit());
    expect(result.current.cockpit).toEqual({ status: "open", reveal: "flight" });

    act(() => result.current.closeCockpit());
    expect(result.current.cockpit).toEqual({ status: "closing" });

    act(() => result.current.finishClosing());
    expect(result.current.cockpit).toEqual({ status: "closed" });
  });

  it("reopens a cockpit that is still fading out", () => {
    const { result } = renderExplorer();
    act(() => {
      result.current.boardShip();
    });
    act(() => result.current.openCockpit());
    act(() => result.current.closeCockpit());

    act(() => result.current.openCockpit());

    expect(result.current.cockpit).toEqual({ status: "open", reveal: "flight" });
  });

  it("keeps the cockpit shut while the ship flies to a destination", () => {
    const { result } = renderExplorer();
    act(() => {
      result.current.boardShip();
    });
    act(() => result.current.openCockpit());
    act(() => result.current.startFlight(WORK));
    act(() => result.current.closeCockpit());

    act(() => result.current.openCockpit());
    expect(result.current.cockpit).toEqual({ status: "closing" });

    act(() => result.current.endFlight());
    act(() => result.current.openCockpit());
    expect(result.current.cockpit).toEqual({ status: "open", reveal: "flight" });
  });
});
