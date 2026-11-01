import { useId, useState } from "react";

import { useMusic } from "#/routes/hooks/useMusic";

import {
  PlaylistTrack,
  RadioButton,
  RadioIcon,
  RadioLevel,
  RadioTrack,
} from "./CockpitRadio.elements";
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

// The console's radio: what plays, with play or stop, the next and previous tracks, and a
// playlist to pick from (on phones it opens from its toggle). It is the same player as the music
// button; without the track it is offline.
export function CockpitRadio() {
  const music = useMusic();
  const playlistId = useId();
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);

  const isPlaying = music.status === "playing";
  const statusText = getStatusText(music.status);

  function handlePlayStop() {
    if (isPlaying) music.stop();
    else void music.play();
  }

  function handlePlaylistToggle() {
    setIsPlaylistOpen((isOpen) => !isOpen);
  }

  return (
    <section
      aria-label={messages.label}
      className="flex min-w-0 flex-col gap-2 md:min-h-0 md:flex-1 md:gap-2.5"
    >
      <div className="flex items-center gap-3 md:flex-col md:items-stretch md:gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 md:gap-1.5">
          {statusText === null ? null : (
            <p aria-hidden="true" className="hidden text-[0.6875rem] text-muted md:block">
              {messages.label}
            </p>
          )}
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
            {/* On desktop the radio's name and level meter sit at the row's end. */}
            <span className="ml-auto hidden items-center gap-2 text-[0.6875rem] text-muted md:flex">
              <span aria-hidden="true">{messages.label}</span>
              <RadioLevel isPlaying={isPlaying} />
            </span>
            <span className="md:hidden">
              <RadioButton
                aria-label={messages.playlistLabel}
                aria-expanded={isPlaylistOpen}
                aria-controls={playlistId}
                onClick={handlePlaylistToggle}
              >
                <RadioIcon name="playlist" />
              </RadioButton>
            </span>
          </div>
        ) : null}
      </div>
      {statusText === null ? (
        <ul
          id={playlistId}
          aria-label={messages.playlistLabel}
          data-open={isPlaylistOpen}
          className="hidden max-h-21 overflow-y-auto overscroll-contain border-t border-border-subtle pt-1.5 data-[open=true]:block md:block md:max-h-24 md:min-h-0 md:flex-1"
        >
          {music.tracks.map((track, index) => (
            <PlaylistTrack
              key={track.id}
              isCurrent={index === music.trackIndex}
              isPlaying={isPlaying}
              artist={track.artist}
              separator={messages.trackSeparator}
              title={track.title}
              onClick={() => void music.playTrack(index)}
            />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
