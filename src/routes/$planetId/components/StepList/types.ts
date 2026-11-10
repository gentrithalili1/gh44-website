import type { CodeBlockTab } from "../CodeBlock";

// One step of a project's how-to. `code` holds its code block's tabs, when it has code.
export type Step = { id: string; name: string; text: string; code?: CodeBlockTab[] };
