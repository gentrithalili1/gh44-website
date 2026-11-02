import { useSyncExternalStore } from "react";

import type { SpaceMode } from "./types";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

let hasWebGLResult: boolean | undefined;

// Checked once per page: every probe holds a WebGL context, and browsers cap how many exist.
function hasWebGL() {
  if (hasWebGLResult !== undefined) return hasWebGLResult;

  if (typeof WebGLRenderingContext === "undefined") {
    hasWebGLResult = false;
    return hasWebGLResult;
  }
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
  context?.getExtension("WEBGL_lose_context")?.loseContext();
  hasWebGLResult = context !== null;

  return hasWebGLResult;
}

function subscribe(onChange: () => void) {
  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
  reducedMotion.addEventListener("change", onChange);

  return () => reducedMotion.removeEventListener("change", onChange);
}

function getSnapshot(): SpaceMode {
  const isMotionReduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;

  return hasWebGL() && !isMotionReduced ? "scene" : "static";
}

// The server and the first client render draw the static system, so hydration matches.
function getServerSnapshot(): SpaceMode {
  return "static";
}

// "scene" once the browser can draw WebGL and the visitor allows motion; "static" otherwise.
export function useSpaceMode() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
