import { createContext, use, useState, useSyncExternalStore } from "react";

import { getTrackIndex, type Track, TRACKS } from "./utils/tracks";

const VOLUME = 0.7;
const FADE_IN_MS = 1600;
const FADE_OUT_MS = 600;
const RELEASE_DELAY_MS = 2500;

// "checking" until the browser has read the track; "unavailable" when it is missing.
type MusicStatus = "checking" | "ready" | "playing" | "unavailable";

type MusicState = { status: MusicStatus; trackIndex: number };

type FadeParams = { audio: HTMLAudioElement; to: number; durationMs: number; onDone?: () => void };

const GESTURE_EVENTS = ["pointerdown", "keydown", "click"] as const;

// The cockpit's radio marks its buttons with this attribute.
const MUSIC_CONTROL_SELECTOR = "[data-music-control]";

function isAutoplayBlocked(error: unknown) {
  return error instanceof DOMException && error.name === "NotAllowedError";
}

function createMusicPlayer(tracks: readonly Track[]) {
  let state: MusicState = { status: "checking", trackIndex: 0 };
  let audio: HTMLAudioElement | undefined;
  let fadeFrame = 0;
  let isStarting = false;
  // A visitor who pressed stop keeps the quiet for the rest of the visit.
  let hasStopped = false;
  let holdCount = 0;
  let shouldResume = false;
  let releaseTimer: ReturnType<typeof setTimeout> | undefined;
  const listeners = new Set<() => void>();

  function setState(next: Partial<MusicState>) {
    state = { ...state, ...next };
    listeners.forEach((listener) => listener());
  }

  function setStatus(status: MusicStatus) {
    setState({ status });
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
    audio.preload = "metadata";
    audio.addEventListener("loadedmetadata", () => {
      if (state.status !== "checking") return;
      setStatus("ready");
      void start();
    });
    // A track that ends hands over to the next one, round the list.
    audio.addEventListener("ended", () => skip(1));
    audio.addEventListener("error", () => setStatus("unavailable"));
    audio.src = tracks[state.trackIndex]?.path ?? "";
  }

  function handleGesture(event: Event) {
    // A press on a music control is the control's to handle: it plays on its own click.
    if (event.target instanceof Element && event.target.closest(MUSIC_CONTROL_SELECTOR)) return;
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
    if (!audio || state.status !== "ready" || isStarting || hasStopped) return;
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
    // Started by the gesture that also woke Floki: unlocked now, it waits for him to finish.
    if (holdCount > 0) {
      audio.pause();
      shouldResume = true;
      return;
    }
    fade({ audio, to: VOLUME, durationMs: FADE_IN_MS });
  }

  // The visitor works the radio: that overrides any hold of Floki's, at full volume again.
  function dropHold() {
    clearTimeout(releaseTimer);
    const wasHeld = holdCount > 0 || shouldResume;
    holdCount = 0;
    shouldResume = false;
    if (!wasHeld || !audio) return;
    cancelAnimationFrame(fadeFrame);
    audio.volume = VOLUME;
  }

  function hold() {
    clearTimeout(releaseTimer);
    holdCount += 1;
    if (holdCount > 1 || !audio || state.status !== "playing") return;
    const player = audio;
    shouldResume = true;
    fade({ audio: player, to: 0, durationMs: FADE_OUT_MS, onDone: () => player.pause() });
  }

  // Floki is done: after a moment of quiet, the music fades back in where it paused.
  function release() {
    if (holdCount === 0) return;
    holdCount -= 1;
    if (holdCount > 0) return;
    releaseTimer = setTimeout(() => {
      if (!audio || !shouldResume || state.status !== "playing") return;
      shouldResume = false;
      const player = audio;
      player
        .play()
        .then(() => fade({ audio: player, to: VOLUME, durationMs: FADE_IN_MS }))
        .catch((error: unknown) => {
          if (!isAutoplayBlocked(error)) {
            setStatus("unavailable");
            return;
          }
          setStatus("ready");
          waitForGesture();
        });
    }, RELEASE_DELAY_MS);
  }

  // The play button: a gesture itself, and allowed after a stop.
  async function play() {
    stopWaitingForGesture();
    dropHold();
    hasStopped = false;
    await start();
  }

  function stop() {
    if (!audio || state.status !== "playing") return;
    const player = audio;
    dropHold();
    hasStopped = true;
    stopWaitingForGesture();
    setStatus("ready");
    fade({ audio: player, to: 0, durationMs: FADE_OUT_MS, onDone: () => player.pause() });
  }

  function skip(step: 1 | -1) {
    if (!audio || state.status === "checking" || state.status === "unavailable") return;
    dropHold();
    const trackIndex = getTrackIndex({ index: state.trackIndex, step, count: tracks.length });
    if (trackIndex === state.trackIndex) audio.currentTime = 0;
    else audio.src = tracks[trackIndex]?.path ?? "";
    setState({ trackIndex });
    if (state.status === "playing") {
      void audio.play().catch(() => setStatus("unavailable"));
    }
  }

  async function playTrack(trackIndex: number) {
    if (!audio || state.status === "checking" || state.status === "unavailable") return;
    dropHold();
    if (trackIndex !== state.trackIndex) {
      audio.src = tracks[trackIndex]?.path ?? "";
      setState({ trackIndex });
    }
    if (state.status !== "playing") {
      await play();
      return;
    }
    await audio.play().catch(() => setStatus("unavailable"));
  }

  function subscribe(listener: () => void) {
    load();
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return {
    play,
    stop,
    next: () => skip(1),
    previous: () => skip(-1),
    playTrack,
    hold,
    release,
    subscribe,
    getSnapshot: () => state,
  };
}

type MusicPlayer = ReturnType<typeof createMusicPlayer>;

const SERVER_STATE: MusicState = { status: "checking", trackIndex: 0 };

function getServerSnapshot() {
  return SERVER_STATE;
}

const MusicContext = createContext<{ player: MusicPlayer; tracks: readonly Track[] } | null>(null);

interface MusicProviderProps {
  // What the radio plays; the site's own list by default.
  tracks?: readonly Track[];
  children: React.ReactNode;
}

export function MusicProvider({ tracks = TRACKS, children }: MusicProviderProps) {
  const [player] = useState(() => createMusicPlayer(tracks));
  useSyncExternalStore(player.subscribe, player.getSnapshot, getServerSnapshot);

  return <MusicContext value={{ player, tracks }}>{children}</MusicContext>;
}

export function useMusic() {
  const music = use(MusicContext);
  if (!music) throw new Error("useMusic needs a MusicProvider above it");
  const { player, tracks } = music;
  const state = useSyncExternalStore(player.subscribe, player.getSnapshot, getServerSnapshot);

  return {
    status: state.status,
    track: tracks[state.trackIndex] ?? TRACKS[0],
    trackIndex: state.trackIndex,
    tracks,
    hasManyTracks: tracks.length > 1,
    play: player.play,
    stop: player.stop,
    next: player.next,
    previous: player.previous,
    playTrack: player.playTrack,
    hold: player.hold,
    release: player.release,
    // The player's state right now, for code that runs after an await (Floki's orders).
    getState: player.getSnapshot,
  };
}
