import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BootProvider, useBoot } from "#/hooks/useBoot";
import { ExplorerProvider, useExplorer } from "#/hooks/useExplorer";
import type { SpaceMode } from "#/hooks/useSpaceMode";
import { endAnimation } from "#/test/motion";
import { renderInRouter } from "#/test/renderInRouter";

import { BootScreen } from "./BootScreen";

const spaceMode = vi.hoisted(() => {
  const state: { current: SpaceMode } = { current: "scene" };
  return state;
});
vi.mock("#/hooks/useSpaceMode", () => ({ useSpaceMode: () => spaceMode.current }));

afterEach(() => {
  spaceMode.current = "scene";
  sessionStorage.clear();
});

// Stands in for the 3D scene and the cockpit: a button marks the scene ready, and the cockpit's
// state shows whether the visitor got greeted.
function SceneProbe() {
  const boot = useBoot();
  const explorer = useExplorer();

  return (
    <>
      <button type="button" onClick={boot.markSceneReady}>
        scene ready
      </button>
      <output aria-label="cockpit">{explorer.cockpit.status}</output>
    </>
  );
}

async function renderBoot() {
  return renderInRouter({
    ui: (
      <ExplorerProvider>
        <BootProvider>
          <SceneProbe />
          <BootScreen />
        </BootProvider>
      </ExplorerProvider>
    ),
  });
}

function getBootScreen() {
  return document.querySelector("[data-boot-screen]");
}

// jsdom runs no CSS animations: end the typing of the line, then its status landing.
function finishLine({ label, status }: { label: RegExp; status: string }) {
  endAnimation(screen.getByText(label));
  const statuses = screen.getAllByText(status);
  const newest = statuses.at(-1);
  if (newest) endAnimation(newest);
}

describe("BootScreen", () => {
  it("logs each step as it finishes, then lifts and greets the visitor", async () => {
    const user = userEvent.setup();
    await renderBoot();

    expect(screen.getByText("loading the solar system…")).toBeInTheDocument();
    endAnimation(screen.getByText(/^igniting the sun/));
    expect(screen.queryByText("ok")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "scene ready" }));
    endAnimation(screen.getByText("ok"));
    endAnimation(screen.getByText(/^plotting 5 orbits/));
    const outerOrbit = screen.getAllByTestId("boot-orbit").at(-1);
    if (outerOrbit) endAnimation(outerOrbit);
    const statuses = screen.getAllByText("ok");
    const orbitsStatus = statuses.at(-1);
    if (orbitsStatus) endAnimation(orbitsStatus);
    expect(screen.getAllByText("ok")).toHaveLength(2);
    finishLine({ label: /^waking floki/, status: "woof" });

    expect(getBootScreen()).toHaveAttribute("data-state", "leaving");
    const bootScreen = getBootScreen();
    if (bootScreen) endAnimation(bootScreen);

    expect(getBootScreen()).toBeNull();
    expect(screen.getByRole("status", { name: "cockpit" })).toHaveTextContent("open");
  });

  it("plays only the sun on later loads in the same tab", async () => {
    sessionStorage.setItem("gh44-booted", "true");
    const user = userEvent.setup();
    await renderBoot();

    expect(screen.queryByText(/^igniting the sun/)).not.toBeInTheDocument();
    expect(getBootScreen()).toHaveAttribute("data-state", "booting");
    await user.click(screen.getByRole("button", { name: "scene ready" }));

    expect(getBootScreen()).toHaveAttribute("data-state", "leaving");
  });

  it("lifts at a click", async () => {
    const user = userEvent.setup();
    await renderBoot();
    const bootScreen = getBootScreen();
    if (bootScreen) await user.click(bootScreen);

    expect(getBootScreen()).toHaveAttribute("data-state", "leaving");
  });

  it("stays out of the way without a 3D scene", async () => {
    spaceMode.current = "static";
    await renderBoot();

    expect(getBootScreen()).toBeNull();
    expect(screen.getByRole("status", { name: "cockpit" })).toHaveTextContent("closed");
  });
});
