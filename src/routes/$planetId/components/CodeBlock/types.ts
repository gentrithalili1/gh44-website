import type { CodeLine } from "../../types";

export type CodeBlockTab = {
  id: string;
  label: string;
  code: string;
  lines: CodeLine[] | undefined;
  note?: string;
};
