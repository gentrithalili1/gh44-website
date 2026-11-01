import { useMusic } from "#/routes/hooks/useMusic";

import { RadioButton, RadioIcon, RadioLevel, RadioTrack } from "./CockpitRadio.elements";
import { messages } from "./messages";

type MusicStatus = ReturnType<typeof useMusic>["status"];

// What the display says instead of the track: null once a track is loaded.
function getStatusText(status: MusicStatus) {
  switch (status) {
    case "unavailable":
      return messages.offline;
    case "checking":
      return messages.tuning;
    case "ready":
    case "playing":
      return null;
    default: {
      const unknownStatus: never = status;
      return unknownStatus;
    }
  }
}

// The console's radio: what plays, with play or stop and the next and previous tracks. It is
// the same player as the music button; without the track it is offline.
export function CockpitRadio() {
  const music = useMusic();

  const isPlaying = music.status === "playing";
  const statusText = getStatusText(music.status);

  function handlePlayStop() {
    if (isPlaying) music.stop();
    else void music.play();
  }

  return (
    <section
      aria-label={messages.label}
      className="flex items-center gap-3 md:flex-col md:items-stretch md:gap-2.5"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 md:gap-1.5">
        <p className="hidden items-center justify-between text-[0.6875rem] text-muted md:flex">
          <span aria-hidden="true">{messages.label}</span>
          <RadioLevel isPlaying={isPlaying} />
        </p>
        {statusText === null ? (
          <RadioTrack
            isPlaying={isPlaying}
            artist={music.track.artist}
            separator={messages.trackSeparator}
            title={music.track.title}
          />
        ) : (
          <p className="text-xs text-muted">{statusText}</p>
        )}
      </div>
      {statusText === null ? (
        <div className="flex shrink-0 items-center gap-1.5">
          <RadioButton
            aria-label={messages.previousLabel}
            disabled={!music.hasManyTracks}
            onClick={music.previous}
          >
            <RadioIcon name="previous" />
          </RadioButton>
          <RadioButton
            aria-label={isPlaying ? messages.stopLabel : messages.playLabel(music.track)}
            onClick={handlePlayStop}
          >
            <RadioIcon name={isPlaying ? "stop" : "play"} />
          </RadioButton>
          <RadioButton
            aria-label={messages.nextLabel}
            disabled={!music.hasManyTracks}
            onClick={music.next}
          >
            <RadioIcon name="next" />
          </RadioButton>
        </div>
      ) : null}
    </section>
  );
}
