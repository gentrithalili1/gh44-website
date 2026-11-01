import { useId, useState } from "react";

import { useCopyText } from "../../hooks/useCopyText";
import { usePlayOnScreen } from "../../hooks/usePlayOnScreen";
import type { CopyStatus } from "../../types";
import { CodeLines, CodeTab } from "./CodeBlock.elements";
import { messages } from "./messages";
import type { CodeBlockTab } from "./types";
import { getCodeLength, getPlainLines, getTypingDuration, revealLines } from "./utils/codeLines";
import { getNextTabIndex } from "./utils/tabKeys";

function getCopyStatusCopy(status: CopyStatus) {
  switch (status) {
    case "idle":
      return { text: messages.copy, announcement: "" };
    case "copied":
      return { text: messages.copied, announcement: messages.copied };
    case "failed":
      return { text: messages.copyFailed, announcement: messages.copyFailed };
    default: {
      const unknownStatus: never = status;
      return unknownStatus;
    }
  }
}

function getTabLines(tab: CodeBlockTab | undefined) {
  if (!tab) return [];
  return tab.lines ?? getPlainLines(tab.code);
}

interface CodeBlockProps {
  // Names the tab list for screen readers.
  label: string;
  tabs: CodeBlockTab[];
  // Set both to keep the selected tab elsewhere, like the URL.
  selectedTabId?: string;
  onSelectTab?: (tabId: string) => void;
}

// Docs-style code: tabs, server-highlighted code typed in the first time it shows, and a copy
// button.
export function CodeBlock({ label, tabs, selectedTabId, onSelectTab }: CodeBlockProps) {
  const id = useId();
  const [ownSelectedTabId, setOwnSelectedTabId] = useState(tabs[0]?.id);
  // The tab open on arrival types in; tabs opened later show at once.
  const [typedLength] = useState(() =>
    getCodeLength(
      getTabLines(tabs.find((tab) => tab.id === (selectedTabId ?? ownSelectedTabId)) ?? tabs[0]),
    ),
  );
  const typing = usePlayOnScreen(getTypingDuration(typedLength));
  const copyText = useCopyText();

  const currentTabId = selectedTabId ?? ownSelectedTabId;
  const selectedTab = tabs.find((tab) => tab.id === currentTabId) ?? tabs[0];
  const isTyping = typing.status !== "done";
  const lines = revealLines({
    lines: getTabLines(selectedTab),
    revealedLength: isTyping ? Math.floor(typing.progress * typedLength) : Infinity,
  });
  const copyStatusCopy = getCopyStatusCopy(copyText.status);
  const getTabId = (tabId: string) => `${id}-tab-${tabId}`;
  const panelId = `${id}-panel`;

  function selectTab(tabId: string) {
    setOwnSelectedTabId(tabId);
    onSelectTab?.(tabId);
  }

  function handleTabKeyDown(event: React.KeyboardEvent) {
    const currentIndex = tabs.findIndex((tab) => tab.id === selectedTab?.id);
    const nextIndex = getNextTabIndex({ key: event.key, currentIndex, tabCount: tabs.length });
    const nextTab = nextIndex === undefined ? undefined : tabs[nextIndex];
    if (!nextTab) return;
    event.preventDefault();
    selectTab(nextTab.id);
    document.getElementById(getTabId(nextTab.id))?.focus();
  }

  async function handleCopy() {
    if (selectedTab) await copyText.copy(selectedTab.code);
  }

  if (!selectedTab) return null;

  return (
    <div className="mb-5 overflow-hidden rounded-lg border border-rule bg-code">
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={handleTabKeyDown}
        className="flex gap-0.5 overflow-x-auto border-b border-rule px-2"
      >
        {tabs.map((tab) => (
          <CodeTab
            key={tab.id}
            id={getTabId(tab.id)}
            panelId={panelId}
            isSelected={tab.id === selectedTab.id}
            onSelect={() => selectTab(tab.id)}
          >
            {tab.label}
          </CodeTab>
        ))}
      </div>
      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={getTabId(selectedTab.id)}
        aria-busy={isTyping}
        className="relative"
      >
        {selectedTab.note ? (
          <p className="px-4 pt-3.5 pr-20 text-xs leading-relaxed text-faint">{selectedTab.note}</p>
        ) : null}
        <pre ref={typing.ref} className="m-0 p-4 pr-20 text-code wrap-anywhere whitespace-pre-wrap">
          <code>
            <CodeLines lines={lines} />
          </code>
        </pre>
        <button
          type="button"
          aria-label={messages.copyLabel}
          onClick={handleCopy}
          data-status={copyText.status}
          className="absolute top-2.5 right-2.5 rounded-md border border-rule bg-code px-2 py-0.75 text-xs text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-muted data-[status=copied]:text-accent data-[status=failed]:text-red"
        >
          {copyStatusCopy.text}
        </button>
      </div>
      <span role="status" className="sr-only">
        {copyStatusCopy.announcement}
      </span>
    </div>
  );
}
