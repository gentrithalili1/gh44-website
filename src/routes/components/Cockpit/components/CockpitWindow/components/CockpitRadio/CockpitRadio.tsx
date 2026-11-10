import { useId, useState } from "react";

import { useMusic } from "#/routes/hooks/useMusic";
import { CONTACT_EMAIL } from "#/utils/contact";

import {
  DeadAir,
  PlaylistTrack,
  RadioButton,
  RadioIcon,
  RadioTrack,
} from "./CockpitRadio.elements";
import { messages } from "./messages";
import { toMorse } from "./utils/morse";

type MusicStatus = ReturnType<typeof useMusic>["status"];

// An easter egg: skipping past the last track lands on dead air, before the list starts over.
type DeadAirState = { status: "off" } | { status: "on"; wasPlaying: boolean };

const ON_AIR: DeadAirState = { status: "off" };
const MORSE_EMAIL = toMorse(CONTACT_EMAIL);

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
// button; without the track it is offline. Skipping past the last track lands on dead air once,
// where a signal comes through for whoever waits.
export function CockpitRadio() {
  const music = useMusic();
  const playlistId = useId();
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [deadAir, setDeadAir] = useState<DeadAirState>(ON_AIR);

  const isPlaying = music.status === "playing";
  const statusText = getStatusText(music.status);

  const isDeadAir = deadAir.status === "on";
  const isOnLastTrack = music.hasManyTracks && music.trackIndex === music.tracks.length - 1;

  function handlePlayStop() {
    setDeadAir(ON_AIR);
    if (isPlaying) music.stop();
    else void music.play();
  }

  function handlePrevious() {
    setDeadAir(ON_AIR);
    music.previous();
  }

  // Past the last track there is dead air; one more skip starts the list over, playing again if
  // it was.
  function handleNext() {
    if (deadAir.status === "on") {
      setDeadAir(ON_AIR);
      music.next();
      if (deadAir.wasPlaying) void music.play();
      return;
    }
    if (isOnLastTrack) {
      setDeadAir({ status: "on", wasPlaying: isPlaying });
      music.stop();
      return;
    }
    music.next();
  }

  function handleTrackPick(index: number) {
    setDeadAir(ON_AIR);
    void music.playTrack(index);
  }

  function handlePlaylistToggle() {
    setIsPlaylistOpen((isOpen) => !isOpen);
  }

  return (
    <section
      aria-label={messages.label}
      className="flex min-w-0 flex-col gap-2 md:min-h-0 md:flex-1 md:gap-2.5"
    >
      {/* Phones: one row. Desktop: the controls centered, what plays under them. */}
      <div className="flex items-center gap-2 md:flex-col-reverse md:items-stretch md:gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 md:items-center md:text-center">
          {isDeadAir ? (
            <DeadAir
              label={messages.deadAir}
              morse={MORSE_EMAIL}
              morseLabel={messages.morseLabel(CONTACT_EMAIL)}
            />
          ) : null}
          {statusText === null && !isDeadAir ? (
            <RadioTrack
              isPlaying={isPlaying}
              artist={music.track.artist}
              separator={messages.trackSeparator}
              title={music.track.title}
            />
          ) : null}
          {statusText === null ? null : <p className="text-xs text-muted">{statusText}</p>}
        </div>
        {statusText === null ? (
          <div className="flex shrink-0 items-center gap-1.5 md:justify-center">
            {/* Phones skip back from the playlist instead, to leave room for the track. */}
            <span className="hidden md:contents">
              <RadioButton
                aria-label={messages.previousLabel}
                disabled={!music.hasManyTracks}
                onClick={handlePrevious}
              >
                <RadioIcon name="previous" />
              </RadioButton>
            </span>
            <RadioButton
              aria-label={isPlaying ? messages.stopLabel : messages.playLabel(music.track)}
              onClick={handlePlayStop}
            >
              <RadioIcon name={isPlaying ? "stop" : "play"} />
            </RadioButton>
            <RadioButton
              aria-label={messages.nextLabel}
              disabled={!music.hasManyTracks}
              onClick={handleNext}
            >
              <RadioIcon name="next" />
            </RadioButton>
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
          className="hidden max-h-21 overflow-y-auto overscroll-contain border-t border-border-subtle pt-1.5 data-[open=true]:block md:block md:max-h-none md:min-h-0 md:flex-1"
        >
          {music.tracks.map((track, index) => (
            <PlaylistTrack
              key={track.id}
              isCurrent={!isDeadAir && index === music.trackIndex}
              isPlaying={isPlaying}
              artist={track.artist}
              separator={messages.trackSeparator}
              title={track.title}
              onClick={() => handleTrackPick(index)}
            />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
