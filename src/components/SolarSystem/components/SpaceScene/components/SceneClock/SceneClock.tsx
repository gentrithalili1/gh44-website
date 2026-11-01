import { useFrame } from "@react-three/fiber";
import type { RefObject } from "react";

import type { SceneState } from "../../types";

// A long frame (a background tab coming back) must not jump anything across its orbit.
const MAX_FRAME_STEP = 0.05;
// Runs before every other frame callback, so they all read this frame's step.
const CLOCK_PRIORITY = -1;

interface SceneClockProps {
  sceneStateRef: RefObject<SceneState>;
}

// Advances the scene's one clock once per frame. Planets, moons, satellites and the rocket read
// its step.
export function SceneClock({ sceneStateRef }: SceneClockProps) {
  useFrame((_, delta) => {
    sceneStateRef.current.frameStep = Math.min(delta, MAX_FRAME_STEP);
  }, CLOCK_PRIORITY);

  return null;
}
