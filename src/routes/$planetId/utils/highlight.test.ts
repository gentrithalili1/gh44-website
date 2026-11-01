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

    // Keywords terracotta, strings sage, comments faint, functions lavender, numbers ochre.
    expect(getTokenColor({ lines, content: "import" })).toBe("#e49b80");
    expect(getTokenColor({ lines, content: '"pkg"' })).toBe("#b8c5ac");
    expect(getTokenColor({ lines, content: "// declined" })).toBe("#868a92");
    expect(getTokenColor({ lines, content: "confirm" })).toBe("#bba8d9");
    expect(getTokenColor({ lines, content: "42" })).toBe("#ddbe8e");
  });

  it("keeps one line per line of code, with the plain text intact", async () => {
    const code = "git clone git@github.com:gentrithalili1/gh44-brain.git\ngh44-brain/install.sh";

    const lines = await highlightCode({ code, lang: "shellscript" });

    expect(lines.map((line) => line.map((token) => token.content).join(""))).toEqual(
      code.split("\n"),
    );
  });
});
