import { describe, expect, it } from "vitest";

import { getCompletionText, parseFlokiReply } from "./flokiReply";

describe("parseFlokiReply", () => {
  it("reads the words and a real destination", () => {
    expect(parseFlokiReply('{"say": " Course set. ", "go": "work"}')).toEqual({
      say: "Course set.",
      go: "work",
      back: false,
    });
  });

  it("drops a destination that does not exist", () => {
    expect(parseFlokiReply('{"say": "Off we go.", "go": "pluto"}')).toEqual({
      say: "Off we go.",
      go: undefined,
      back: false,
    });
  });

  it("gives nothing for text that is not a reply", () => {
    expect(parseFlokiReply("Sure! Here you go")).toBeUndefined();
    expect(parseFlokiReply('{"say": "   "}')).toBeUndefined();
    expect(parseFlokiReply('{"go": "work"}')).toBeUndefined();
  });

  it("cuts a reply that runs too long", () => {
    const reply = parseFlokiReply(JSON.stringify({ say: "a".repeat(400) }));

    expect(reply?.say).toHaveLength(280);
  });
});

describe("parseFlokiReply, inside the tesseract", () => {
  it("reads the way back only when it is plainly true", () => {
    expect(parseFlokiReply('{"say":"Back we go.","go":null,"back":true}')?.back).toBe(true);
    expect(parseFlokiReply('{"say":"Still here.","go":null,"back":"yes"}')?.back).toBe(false);
  });
});

describe("getCompletionText", () => {
  it("reads the first choice's message", () => {
    expect(getCompletionText({ choices: [{ message: { content: "hi" } }] })).toBe("hi");
  });

  it("gives nothing for another shape", () => {
    expect(getCompletionText({ choices: [] })).toBeUndefined();
    expect(getCompletionText("nope")).toBeUndefined();
  });
});
