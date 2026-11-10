import { describe, expect, it } from "vitest";

import { toMorse } from "./morse";

describe("toMorse", () => {
  it("spells letters, digits and an address's punctuation", () => {
    expect(toMorse("sos")).toBe("... --- ...");
    expect(toMorse("A1")).toBe(".- .----");
    expect(toMorse("a@b.c")).toBe(".- .--.-. -... .-.-.- -.-.");
  });

  it("leaves out what morse has no code for", () => {
    expect(toMorse("a b!")).toBe(".- -...");
  });
});
