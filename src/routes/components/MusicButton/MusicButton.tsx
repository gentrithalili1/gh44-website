import { useMusic } from "#/routes/hooks/useMusic";

import { messages } from "./messages";
import { MusicBars, MusicIcon } from "./MusicButton.elements";

// The radio's track, top left: it starts by itself and stops (or starts again) here. Without the track
// there is no button. Its width holds the bars, so the back link beside it never moves.
export function MusicButton() {
  const music = useMusic();

  const isPlaying = music.status === "playing";

  function handleClick() {
    if (isPlaying) music.stop();
    else void music.play();
  }

  if (music.status === "checking" || music.status === "unavailable") return null;

  return (
    <button
      type="button"
      aria-label={isPlaying ? messages.stopLabel : messages.playLabel(music.track)}
      title={isPlaying ? messages.stopTitle : messages.playTitle(music.track)}
      onClick={handleClick}
      data-music-button=""
      data-music-control=""
      className="fixed top-4 left-4 z-30 flex h-11 w-18 items-center gap-2.5 rounded-lg px-3 text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-muted"
    >
      <MusicIcon isPlaying={isPlaying} />
      {isPlaying ? <MusicBars /> : null}
    </button>
  );
}
