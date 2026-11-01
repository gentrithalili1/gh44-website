import { useState, useSyncExternalStore } from "react";

// Served from public/audio/, which git ignores: the track is not in the repository.
const TRACK_PATH = "/audio/stay.mp3";
const VOLUME = 0.7;
const FADE_IN_MS = 1600;
const FADE_OUT_MS = 600;

// "checking" until the browser has read the track; "unavailable" when it is missing.
type MusicStatus = "checking" | "ready" | "playing" | "unavailable";

type FadeParams = { audio: HTMLAudioElement; to: number; durationMs: number; onDone?: () => void };

// What starts playback once a browser that blocks autoplay sees the visitor act. `click` covers
// touch screens, where a tap only counts as a gesture once it ends.
const GESTURE_EVENTS = ["pointerdown", "keydown", "click"] as const;

// MusicButton marks itself with this attribute.
const MUSIC_BUTTON_SELECTOR = "[data-music-button]";

function isAutoplayBlocked(error: unknown) {
  return error instanceof DOMException && error.name === "NotAllowedError";
}

// The audio element lives in this store, outside render; it loads on first subscribe, so only
// in the browser. It starts by itself once the track is ready, or on the visitor's first
// gesture when the browser blocks autoplay, until the visitor stops it.
function createMusicPlayer() {
  let status: MusicStatus = "checking";
  let audio: HTMLAudioElement | undefined;
  let fadeFrame = 0;
  let isStarting = false;
  // A visitor who pressed stop keeps the quiet for the rest of the visit.
  let hasStopped = false;
  const listeners = new Set<() => void>();

  function setStatus(next: MusicStatus) {
    status = next;
    listeners.forEach((listener) => listener());
  }

  function fade({ audio: player, to, durationMs, onDone }: FadeParams) {
    cancelAnimationFrame(fadeFrame);
    const from = player.volume;
    const startedAt = performance.now();

    function step() {
      const progress = Math.min(1, (performance.now() - startedAt) / durationMs);
      player.volume = from + (to - from) * progress;
      if (progress < 1) fadeFrame = requestAnimationFrame(step);
      else onDone?.();
    }
    fadeFrame = requestAnimationFrame(step);
  }

  function load() {
    if (audio) return;
    audio = new Audio();
    audio.loop = true;
    audio.preload = "metadata";
    audio.addEventListener("loadedmetadata", () => {
      if (status !== "checking") return;
      setStatus("ready");
      void start();
    });
    audio.addEventListener("error", () => setStatus("unavailable"));
    audio.src = TRACK_PATH;
  }

  function handleGesture(event: Event) {
    // A press on the music button is the button's to handle: it plays on its own click.
    if (event.target instanceof Element && event.target.closest(MUSIC_BUTTON_SELECTOR)) return;
    stopWaitingForGesture();
    void start();
  }

  function waitForGesture() {
    GESTURE_EVENTS.forEach((type) => document.addEventListener(type, handleGesture));
  }

  function stopWaitingForGesture() {
    GESTURE_EVENTS.forEach((type) => document.removeEventListener(type, handleGesture));
  }

  async function start() {
    if (!audio || status !== "ready" || isStarting || hasStopped) return;
    isStarting = true;
    audio.volume = 0;
    try {
      await audio.play();
    } catch (error) {
      // Blocked until the visitor acts: the play button stays, and their first gesture starts it.
      if (isAutoplayBlocked(error)) waitForGesture();
      // Anything else means it can't play: offer nothing rather than a dead button.
      else setStatus("unavailable");
      return;
    } finally {
      isStarting = false;
    }
    setStatus("playing");
    fade({ audio, to: VOLUME, durationMs: FADE_IN_MS });
  }

  // The play button: a gesture itself, and allowed after a stop.
  async function play() {
    stopWaitingForGesture();
    hasStopped = false;
    await start();
  }

  function stop() {
    if (!audio || status !== "playing") return;
    const player = audio;
    hasStopped = true;
    stopWaitingForGesture();
    setStatus("ready");
    fade({ audio: player, to: 0, durationMs: FADE_OUT_MS, onDone: () => player.pause() });
  }

  function subscribe(listener: () => void) {
    load();
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { play, stop, subscribe, getSnapshot: () => status };
}

function getServerSnapshot(): MusicStatus {
  return "checking";
}

// S.T.A.Y. from Interstellar: plays on load, or on the first gesture when the browser blocks
// autoplay, and the visitor can stop it any time. It fades each way.
export function useMusic() {
  const [player] = useState(createMusicPlayer);
  const status = useSyncExternalStore(player.subscribe, player.getSnapshot, getServerSnapshot);

  return { status, play: player.play, stop: player.stop };
}
