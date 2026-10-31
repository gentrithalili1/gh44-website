import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ContactEmail } from "./ContactEmail";

describe("ContactEmail", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("copies the address on click and says so", async () => {
    const user = userEvent.setup();
    render(<ContactEmail />);

    await user.click(screen.getByRole("button", { name: "gentrithalili11@gmail.com" }));

    await expect(navigator.clipboard.readText()).resolves.toBe("gentrithalili11@gmail.com");
    expect(screen.getByRole("status")).toHaveTextContent("email address copied");
    expect(screen.getByRole("button", { name: "copied. talk soon." })).toBeInTheDocument();
  });

  it("says so when the clipboard is blocked", async () => {
    const user = userEvent.setup();
    render(<ContactEmail />);
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("Denied"));

    await user.click(screen.getByRole("button", { name: "gentrithalili11@gmail.com" }));

    expect(screen.getByRole("status")).toHaveTextContent("couldn't copy the email address");
    expect(
      screen.getByRole("button", { name: "couldn't copy. it's gentrithalili11@gmail.com" }),
    ).toBeInTheDocument();
  });
});
