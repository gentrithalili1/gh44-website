import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { DESTINATIONS } from "#/utils/destinations";

import { ExplorerProvider, useExplorer } from "./useExplorer";

function renderExplorer() {
  return renderHook(() => useExplorer(), { wrapper: ExplorerProvider });
}

const [WORK] = DESTINATIONS.filter((destination) => destination.name === "work");

describe("useExplorer", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("opens and closes the cockpit at once without a ship in the scene", () => {
    const { result } = renderExplorer();

    act(() => result.current.openCockpit());
    expect(result.current.cockpit).toEqual({
      status: "open",
      reveal: "instant",
      isGreeting: false,
    });

    act(() => result.current.closeCockpit());
    expect(result.current.cockpit).toEqual({ status: "closed" });
  });

  it("flies to the ship to open, and fades out to close, with a ship aboard", () => {
    const { result } = renderExplorer();
    act(() => {
      result.current.boardShip();
    });

    act(() => result.current.openCockpit());
    expect(result.current.cockpit).toEqual({ status: "open", reveal: "flight", isGreeting: false });

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

    expect(result.current.cockpit).toEqual({ status: "open", reveal: "flight", isGreeting: false });
  });

  it("keeps the cockpit shut while the ship flies to a destination", () => {
    const { result } = renderExplorer();
    act(() => {
      result.current.boardShip();
    });
    act(() => result.current.openCockpit());
    act(() => {
      result.current.launch(WORK);
    });
    act(() => result.current.closeCockpit());

    act(() => result.current.openCockpit());
    expect(result.current.cockpit).toEqual({ status: "closing" });

    act(() => result.current.endFlight());
    act(() => result.current.openCockpit());
    expect(result.current.cockpit).toEqual({ status: "open", reveal: "flight", isGreeting: false });
  });

  it("flies the ship to a launch's destination, or arrives at once without a ship", () => {
    const withShip = renderExplorer();
    act(() => {
      withShip.result.current.boardShip();
    });
    act(() => withShip.result.current.openCockpit());
    let outcome;
    act(() => {
      outcome = withShip.result.current.launch(WORK);
    });
    expect(outcome).toEqual({ status: "flying" });
    expect(withShip.result.current.flight).toEqual({ status: "flying", destination: WORK });

    const withoutShip = renderExplorer();
    act(() => withoutShip.result.current.openCockpit());
    act(() => {
      outcome = withoutShip.result.current.launch(WORK);
    });
    expect(outcome).toEqual({ status: "arrived" });
    expect(withoutShip.result.current.cockpit).toEqual({ status: "closed" });
  });

  it("remembers the planet reached from the cockpit, until the cockpit opens again", () => {
    const { result } = renderExplorer();
    expect(result.current.cockpitTripPlanetId).toBeUndefined();

    act(() => result.current.openCockpit());
    act(() => {
      result.current.launch(WORK);
    });
    expect(result.current.cockpitTripPlanetId).toBe("work");

    act(() => result.current.openCockpit());
    expect(result.current.cockpitTripPlanetId).toBeUndefined();
  });

  it("greets a page load with the cockpit, once", () => {
    const { result } = renderExplorer();

    act(() => result.current.greetVisitor());
    expect(result.current.cockpit).toEqual({ status: "open", reveal: "instant", isGreeting: true });

    act(() => result.current.closeCockpit());
    act(() => result.current.greetVisitor());
    expect(result.current.cockpit).toEqual({ status: "closed" });
  });

  it("greets again on a fresh page in the same session", () => {
    const first = renderExplorer();
    act(() => first.result.current.greetVisitor());
    first.unmount();

    const second = renderExplorer();
    act(() => second.result.current.greetVisitor());

    expect(second.result.current.cockpit).toEqual({
      status: "open",
      reveal: "instant",
      isGreeting: true,
    });
  });

  it("boards the greeting cockpit for real once the visitor uses it, or opens it", () => {
    const { result } = renderExplorer();
    act(() => result.current.greetVisitor());

    act(() => result.current.boardCockpit());
    expect(result.current.cockpit).toEqual({
      status: "open",
      reveal: "instant",
      isGreeting: false,
    });

    const other = renderExplorer();
    act(() => other.result.current.greetVisitor());
    act(() => other.result.current.openCockpit());
    expect(other.result.current.cockpit).toMatchObject({ isGreeting: false });
  });

  it("flies into the black hole with a ship, waits inside, flies back and is home years later", () => {
    const { result } = renderExplorer();
    act(() => {
      result.current.boardShip();
    });
    let arrivals = 0;

    act(() => result.current.startJump(() => arrivals++));
    expect(result.current.jump).toEqual({ status: "jumping" });

    act(() => result.current.reachHorizon());
    expect(result.current.jump).toEqual({ status: "inside" });
    expect(arrivals).toBe(0);

    act(() => result.current.endJump());
    expect(result.current.jump).toEqual({ status: "returning" });
    expect(arrivals).toBe(0);

    act(() => result.current.finishJump());
    expect(result.current.jump).toEqual({ status: "idle" });
    expect(arrivals).toBe(1);
    expect(result.current.earthYearsPassed).toBe(7);
  });

  it("is inside the black hole at once without a ship", () => {
    const { result } = renderExplorer();

    act(() => result.current.startJump(() => {}));

    expect(result.current.jump).toEqual({ status: "inside" });

    act(() => result.current.endJump());

    expect(result.current.jump).toEqual({ status: "idle" });
    expect(result.current.earthYearsPassed).toBe(7);
  });
});
