import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

import type { CodeLang, CodeLine } from "../types";
import { CODE_THEME } from "./codeTheme";

// Built once per server and reused: loading the grammars is the slow part.
let highlighterPromise: Promise<HighlighterCore> | undefined;

function getHighlighter() {
  highlighterPromise ??= createHighlighterCore({
    themes: [CODE_THEME],
    langs: [
      import("shiki/langs/shellscript.mjs"),
      import("shiki/langs/tsx.mjs"),
      import("shiki/langs/json.mjs"),
    ],
    engine: createJavaScriptRegexEngine(),
  });

  return highlighterPromise;
}

type HighlightCodeParams = {
  code: string;
  lang: CodeLang;
};

// Server only: Shiki stays out of the browser. Each line is a list of colored pieces.
export async function highlightCode({ code, lang }: HighlightCodeParams): Promise<CodeLine[]> {
  const highlighter = await getHighlighter();
  const { tokens } = highlighter.codeToTokens(code, { lang, theme: CODE_THEME.name });

  return tokens.map((line) => line.map(({ content, color }) => ({ content, color })));
}
