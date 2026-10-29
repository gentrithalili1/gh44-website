import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { THEME_STORAGE_KEY } from "#/utils/theme";

import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.className = "";
    localStorage.clear();
  });

  it("offers dark mode while the page is light", () => {
    render(<ThemeToggle />);

    expect(screen.getByRole("button", { name: "Switch to dark mode" })).toBeInTheDocument();
  });

  it("offers light mode while the page is dark", () => {
    document.documentElement.classList.add("dark");

    render(<ThemeToggle />);

    expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeInTheDocument();
  });

  it("switches to dark and back on click, and saves each choice", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: "Switch to dark mode" }));

    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");

    await user.click(screen.getByRole("button", { name: "Switch to light mode" }));

    expect(document.documentElement).not.toHaveClass("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(screen.getByRole("button", { name: "Switch to dark mode" })).toBeInTheDocument();
  });
});
