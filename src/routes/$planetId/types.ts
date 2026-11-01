import type { CodeSnippetId } from "./utils/codeSnippets";

// The languages the panels' code blocks highlight.
export type CodeLang = "shellscript" | "tsx" | "json" | "text";

// One colored piece of a highlighted line.
export type CodeToken = { content: string; color: string | undefined };

export type CodeLine = CodeToken[];

// Each of the open planet's code snippets, highlighted on the server.
export type HighlightedCode = Partial<Record<CodeSnippetId, CodeLine[]>>;

// A copy button's result, shown for a moment.
export type CopyStatus = "idle" | "copied" | "failed";
