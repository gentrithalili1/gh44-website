import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderAt } from "#/test/renderAt";

const SITE_HEADING = { level: 1, name: "gentrit halili, senior frontend engineer" } as const;

describe("LockScreen", () => {
  beforeEach(() => {
    // The shared setup unlocks the site for every other test; these start a first visit.
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows only the password screen on every route", async () => {
    await renderAt("/");

    expect(screen.getByRole("heading", { level: 1, name: "gh44.dev" })).toBeInTheDocument();
    expect(screen.getByLabelText("password")).toBeInTheDocument();
    expect(screen.queryByRole("heading", SITE_HEADING)).not.toBeInTheDocument();
  });

  it("shows the password screen on unknown routes too", async () => {
    await renderAt("/pluto");

    expect(screen.getByLabelText("password")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1, name: "404" })).not.toBeInTheDocument();
  });

  it("stays locked and says so on a wrong password", async () => {
    const user = userEvent.setup();
    await renderAt("/");

    await user.type(screen.getByLabelText("password"), "1234{Enter}");

    expect(screen.getByRole("alert")).toHaveTextContent("wrong password. try again.");
    expect(screen.queryByRole("heading", SITE_HEADING)).not.toBeInTheDocument();
  });

  it("opens the site on the right password", async () => {
    const user = userEvent.setup();
    await renderAt("/");

    await user.type(screen.getByLabelText("password"), "0509");
    await user.click(screen.getByRole("button", { name: "unlock" }));

    expect(screen.getByRole("heading", SITE_HEADING)).toBeInTheDocument();
    expect(screen.queryByLabelText("password")).not.toBeInTheDocument();
  });

  it("remembers the unlock across reloads", async () => {
    const user = userEvent.setup();
    await renderAt("/");
    await user.type(screen.getByLabelText("password"), "0509{Enter}");
    cleanup();

    await renderAt("/");

    expect(screen.getByRole("heading", SITE_HEADING)).toBeInTheDocument();
    expect(screen.queryByLabelText("password")).not.toBeInTheDocument();
  });

  it("still unlocks for this visit when storage fails", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage full");
    });
    const user = userEvent.setup();
    await renderAt("/");

    await user.type(screen.getByLabelText("password"), "0509{Enter}");

    expect(screen.getByRole("heading", SITE_HEADING)).toBeInTheDocument();
  });
});
