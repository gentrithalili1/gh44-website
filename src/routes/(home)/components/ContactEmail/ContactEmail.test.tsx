import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ContactEmail } from "./ContactEmail";

describe("ContactEmail", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("links the address to a new email", () => {
    render(<ContactEmail />);

    expect(screen.getByRole("link", { name: "gentrithalili11@gmail.com" })).toHaveAttribute(
      "href",
      "mailto:gentrithalili11@gmail.com",
    );
  });

  it("copies the address and says so", async () => {
    const user = userEvent.setup();
    render(<ContactEmail />);

    await user.click(screen.getByRole("button", { name: "Copy email address" }));

    await expect(navigator.clipboard.readText()).resolves.toBe("gentrithalili11@gmail.com");
    expect(screen.getByRole("status")).toHaveTextContent("Email address copied");
    expect(screen.getByRole("button", { name: "Email address copied" })).toBeInTheDocument();
  });

  it("says so when the clipboard is blocked", async () => {
    const user = userEvent.setup();
    render(<ContactEmail />);
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("Denied"));

    await user.click(screen.getByRole("button", { name: "Copy email address" }));

    expect(screen.getByRole("status")).toHaveTextContent("Couldn't copy the email address");
  });
});
