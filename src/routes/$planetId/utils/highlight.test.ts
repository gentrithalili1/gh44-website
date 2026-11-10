import { describe, expect, it } from "vitest";

import { highlightCode } from "./highlight";

function getTokenColor({
  lines,
  content,
}: {
  lines: Awaited<ReturnType<typeof highlightCode>>;
  content: string;
}) {
  return lines
    .flat()
    .find((token) => token.content.trim() === content)
    ?.color?.toLowerCase();
}

describe("highlightCode", () => {
  it("colors code in the gh44 dark palette, as gh44 for zed does", async () => {
    const lines = await highlightCode({
      code: 'import { open } from "pkg";\n// declined\nawait confirm(42);',
      lang: "tsx",
    });

    // Keywords clay, strings sage, comments faint, functions sky, numbers rose.
    expect(getTokenColor({ lines, content: "import" })).toBe("#c59172");
    expect(getTokenColor({ lines, content: '"pkg"' })).toBe("#9ebf7a");
    expect(getTokenColor({ lines, content: "// declined" })).toBe("#868a92");
    expect(getTokenColor({ lines, content: "confirm" })).toBe("#75addb");
    expect(getTokenColor({ lines, content: "42" })).toBe("#f08ba2");
  });

  it("keeps one line per line of code, with the plain text intact", async () => {
    const code = "git clone git@github.com:gentrithalili1/gh44-brain.git\ngh44-brain/install.sh";

    const lines = await highlightCode({ code, lang: "shellscript" });

    expect(lines.map((line) => line.map((token) => token.content).join(""))).toEqual(
      code.split("\n"),
    );
  });
});
