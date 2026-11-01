import { useId } from "react";

import { usePlayOnScreen } from "../../../../hooks/usePlayOnScreen";
import { messages } from "./messages";
import { getReplayDuration, getReplayFrame } from "./utils/replayFrames";

const SESSION_DURATION_MS = getReplayDuration(messages.script);

// A scripted Claude Code session, clearly a replay: it plays the first time it comes on screen
// and again on demand.
export function SessionReplay() {
  const captionId = useId();
  const playback = usePlayOnScreen(SESSION_DURATION_MS);

  const lines = getReplayFrame({
    script: messages.script,
    elapsedMs: playback.progress * SESSION_DURATION_MS,
  });
  const isPlaying = playback.status !== "done";

  return (
    <figure
      ref={playback.ref}
      aria-labelledby={captionId}
      aria-busy={isPlaying}
      className="mb-5 overflow-hidden rounded-lg border border-rule bg-code"
    >
      <figcaption className="flex items-center justify-between gap-4 border-b border-rule py-1.5 pr-1.5 pl-4 text-xs text-faint">
        <span id={captionId}>{messages.caption}</span>
        <button
          type="button"
          aria-label={messages.replayLabel}
          onClick={playback.replay}
          className="rounded-md border border-rule px-2 py-0.75 text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-muted"
        >
          {messages.replay}
        </button>
      </figcaption>
      <pre className="m-0 grid gap-1 p-4 text-code break-words whitespace-pre-wrap">
        {lines.map((line) => (
          <span
            key={line.id}
            data-kind={line.kind}
            className="text-foreground data-[kind=reply]:mb-2 data-[kind=reply]:text-muted"
          >
            {line.kind === "prompt" ? (
              <span
                aria-hidden="true"
                data-hidden={line.shownText === "" ? "" : undefined}
                className="text-terracotta data-hidden:invisible"
              >
                {messages.promptMark}{" "}
              </span>
            ) : null}
            {line.shownText}
            <span aria-hidden="true" data-hidden="" className="data-hidden:invisible">
              {line.hiddenText}
            </span>
          </span>
        ))}
      </pre>
    </figure>
  );
}
