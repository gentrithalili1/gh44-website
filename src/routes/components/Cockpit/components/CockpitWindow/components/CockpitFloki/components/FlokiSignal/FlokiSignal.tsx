import { useEffect, useEffectEvent, useRef } from "react";

import type { FlokiStatus } from "../../../../hooks/useFloki";
import { FlokiSlabs } from "./FlokiSignal.elements";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
// With reduced motion the bars hold this level while he listens or speaks.
const STILL_LEVEL = 0.45;
// A low hum while live, so the bars move even when the signal can't be measured.
const HUM_LEVEL = 0.12;
const HUM_SWING = 0.06;
const HUM_SPEED = 0.006;
// How much of each new reading goes into the drawn level: lower is smoother.
const SMOOTHING = 0.35;

interface FlokiSignalProps {
  status: FlokiStatus;
  // How loud the mic or Floki's voice is right now, from 0 to 1.
  getLevel: () => number;
}

// Floki's signal bars: they follow the visitor's voice while he listens and his own while he
// speaks, drawn every frame through `--floki-level` without re-rendering.
export function FlokiSignal({ status, getLevel }: FlokiSignalProps) {
  const slabsRef = useRef<HTMLSpanElement>(null);
  const isLive = status === "listening" || status === "speaking";

  const readLevel = useEffectEvent(() => getLevel());

  useEffect(() => {
    const slabs = slabsRef.current;
    if (!slabs || !isLive) return;
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) {
      slabs.style.setProperty("--floki-level", String(STILL_LEVEL));
      return () => slabs.style.removeProperty("--floki-level");
    }
    let frame = 0;
    let level = 0;
    function draw(time: number) {
      const hum = HUM_LEVEL + HUM_SWING * Math.sin(time * HUM_SPEED);
      level += (Math.max(readLevel(), hum) - level) * SMOOTHING;
      slabs?.style.setProperty("--floki-level", level.toFixed(3));
      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      slabs.style.removeProperty("--floki-level");
    };
  }, [isLive]);

  return <FlokiSlabs ref={slabsRef} status={status} />;
}
