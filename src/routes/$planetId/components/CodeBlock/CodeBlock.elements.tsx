import { Fragment } from "react";

import type { RevealedLine } from "./utils/codeLines";

interface CodeLinesProps {
  lines: RevealedLine[];
}

// Code not typed yet keeps its place, invisible and hidden from screen readers.
export function CodeLines({ lines }: CodeLinesProps) {
  return lines.map((line, lineIndex) => (
    <Fragment key={line.id}>
      {lineIndex > 0 ? "\n" : null}
      {line.tokens.map((token) => (
        <span
          key={token.id}
          aria-hidden={token.isRevealed ? undefined : true}
          data-hidden={token.isRevealed ? undefined : ""}
          style={{ color: token.color }}
          className="data-hidden:invisible"
        >
          {token.content}
        </span>
      ))}
    </Fragment>
  ));
}

interface CodeTabProps {
  id: string;
  panelId: string;
  isSelected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}

export function CodeTab({ id, panelId, isSelected, onSelect, children }: CodeTabProps) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={isSelected}
      aria-controls={panelId}
      tabIndex={isSelected ? 0 : -1}
      onClick={onSelect}
      className="-mb-px shrink-0 border-b-2 border-transparent px-2.5 py-2.5 text-kicker whitespace-nowrap text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-muted aria-selected:border-accent aria-selected:text-foreground"
    >
      {children}
    </button>
  );
}
