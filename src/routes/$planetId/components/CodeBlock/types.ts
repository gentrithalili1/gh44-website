import type { CodeLine } from "../../types";

// One tab of a code block. `lines` is the code highlighted on the server; without it the code
// shows plain. `note` says what to do with the code.
export type CodeBlockTab = {
  id: string;
  label: string;
  code: string;
  lines: CodeLine[] | undefined;
  note?: string;
};
