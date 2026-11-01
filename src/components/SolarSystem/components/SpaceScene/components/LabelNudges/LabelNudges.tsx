import { useFrame } from "@react-three/fiber";
import { type RefObject, useRef } from "react";

import { getOrbitPosition } from "#/components/SolarSystem/utils/space";
import { PLANETS } from "#/utils/planets";

import type { SceneState } from "../../types";
import { damp, PHONE_MAX_WIDTH } from "../../utils/sceneMath";
import { getLabelAnchor } from "./utils/labelAnchor";
import { getLabelNudges, type LabelBox } from "./utils/labelNudges";

// The least space between two labels, in pixels.
const LABEL_GAP = 6;
const NO_NUDGE = { x: 0, y: 0 } as const;
// How fast a label eases to its new nudge (higher is faster): two labels part smoothly instead
// of jumping.
const NUDGE_LAMBDA = 8;

function setNudge(nudge: { x: number; y: number }) {
  return (element: HTMLElement) => {
    element.style.setProperty("--label-nudge-x", `${nudge.x}px`);
    element.style.setProperty("--label-nudge-y", `${nudge.y}px`);
  };
}

interface LabelNudgesProps {
  labelList: HTMLUListElement;
  openPlanetId: string | undefined;
  sceneStateRef: RefObject<SceneState>;
}

// On phones the inner planets pass close, and their fixed-size labels would touch: every frame,
// labels that would ease apart, never further than a label's height from their planet. Desktop
// has room, and an open planet hides the labels.
export function LabelNudges({ labelList, openPlanetId, sceneStateRef }: LabelNudgesProps) {
  // Whether the labels may still carry a nudge from an earlier frame.
  const hasNudgesRef = useRef(false);
  // Each label's nudge as drawn, easing toward the one it needs.
  const shownNudgesRef = useRef(new Map<string, { x: number; y: number }>());

  useFrame(({ camera, size }, delta) => {
    const isActive = size.width < PHONE_MAX_WIDTH && openPlanetId === undefined;
    if (!isActive) {
      // Put the labels back once, then do nothing until nudging is needed again.
      if (hasNudgesRef.current) {
        labelList.querySelectorAll<HTMLElement>("[data-planet-label]").forEach(setNudge(NO_NUDGE));
        shownNudgesRef.current.clear();
        hasNudgesRef.current = false;
      }
      return;
    }
    hasNudgesRef.current = true;
    const labels: { element: HTMLElement; box: LabelBox }[] = [];

    for (const planet of PLANETS) {
      const element = labelList.querySelector<HTMLElement>(`[data-planet-label="${planet.id}"]`);
      if (!element) continue;
      const phase = sceneStateRef.current.planetAngles.get(planet.id) ?? planet.orbit.phase;
      const position = getOrbitPosition({ radius: planet.orbit.radius, phase });
      const anchor = getLabelAnchor({ position, size: planet.size, camera, viewport: size });
      labels.push({
        element,
        box: {
          id: planet.id,
          ...anchor,
          width: element.offsetWidth,
          height: element.offsetHeight,
        },
      });
    }

    const nudges = getLabelNudges({ labels: labels.map(({ box }) => box), gap: LABEL_GAP });
    for (const { element, box } of labels) {
      const target = nudges.get(box.id) ?? NO_NUDGE;
      const shown = shownNudgesRef.current.get(box.id) ?? { x: 0, y: 0 };
      shown.x = damp({ current: shown.x, target: target.x, delta, lambda: NUDGE_LAMBDA });
      shown.y = damp({ current: shown.y, target: target.y, delta, lambda: NUDGE_LAMBDA });
      shownNudgesRef.current.set(box.id, shown);
      setNudge(shown)(element);
    }
  });

  return null;
}
