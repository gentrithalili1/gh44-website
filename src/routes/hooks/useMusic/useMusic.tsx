import { createContext, use, useState, useSyncExternalStore } from "react";

import { getTrackIndex, type Track, TRACKS } from "./utils/tracks";

const VOLUME = 0.7;
const FADE_IN_MS = 1600;
const FADE_OUT_MS = 600;

// "checking" until the browser has read the track; "unavailable" when it is missing.
type MusicStatus = "checking" | "ready" | "playing" | "unavailable";

type MusicState = { status: MusicStatus; trackIndex: number };

type FadeParams = { audio: HTMLAudioElement; to: number; durationMs: number; onDone?: () => void };

// What starts playback once a browser that blocks autoplay sees the visitor act. `click` covers
// touch screens, where a tap only counts as a gesture once it ends.
const GESTURE_EVENTS = ["pointerdown", "keydown", "click"] as const;

// The cockpit's radio marks its buttons with this attribute.
const MUSIC_CONTROL_SELECTOR = "[data-music-control]";

function isAutoplayBlocked(error: unknown) {
  return error instanceof DOMException && error.name === "NotAllowedError";
}

// The audio element lives in this store, outside render; it loads on first subscribe, so only
// in the browser. It starts by itself once the track is ready, or on the visitor's first
// gesture when the browser blocks autoplay, until the visitor stops it.
function createMusicPlayer(tracks: readonly Track[]) {
  let state: MusicState = { status: "checking", trackIndex: 0 };
  let audio: HTMLAudioElement | undefined;
  let fadeFrame = 0;
  let isStarting = false;
  // A visitor who pressed stop keeps the quiet for the rest of the visit.
  let hasStopped = false;
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
    fade({ audio, to: VOLUME, durationMs: FADE_IN_MS });
  }

  // The play button: a gesture itself, and allowed after a stop.
  async function play() {
    stopWaitingForGesture();
    hasStopped = false;
    await start();
  }

  function stop() {
    if (!audio || state.status !== "playing") return;
    const player = audio;
    hasStopped = true;
    stopWaitingForGesture();
    setStatus("ready");
    fade({ audio: player, to: 0, durationMs: FADE_OUT_MS, onDone: () => player.pause() });
  }

  // Next or previous: a playing radio plays the new track at once; a quiet one only picks it.
  // With a single track it starts that one over.
  function skip(step: 1 | -1) {
    if (!audio || state.status === "checking" || state.status === "unavailable") return;
    const trackIndex = getTrackIndex({ index: state.trackIndex, step, count: tracks.length });
    if (trackIndex === state.trackIndex) audio.currentTime = 0;
    else audio.src = tracks[trackIndex]?.path ?? "";
    setState({ trackIndex });
    if (state.status === "playing") {
      void audio.play().catch(() => setStatus("unavailable"));
    }
  }

  // A track picked from the list: a playing radio switches to it at once, a quiet one starts with
  // it.
  async function playTrack(trackIndex: number) {
    if (!audio || state.status === "checking" || state.status === "unavailable") return;
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

// One player for the whole site, controlled from the cockpit's radio. It loads (and autoplays)
// with the page, whether or not the radio is on screen.
export function MusicProvider({ tracks = TRACKS, children }: MusicProviderProps) {
  const [player] = useState(() => createMusicPlayer(tracks));
  useSyncExternalStore(player.subscribe, player.getSnapshot, getServerSnapshot);

  return <MusicContext value={{ player, tracks }}>{children}</MusicContext>;
}

// The radio: its tracks in turn, from crystalline. It plays on load, or on the first gesture when
// the browser blocks autoplay, and the visitor can stop it any time; a stop holds for the visit.
// It fades each way.
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
  };
}
