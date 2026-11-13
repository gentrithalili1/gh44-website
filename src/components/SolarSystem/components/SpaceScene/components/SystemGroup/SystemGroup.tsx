import { useFrame } from "@react-three/fiber";
import { type RefObject, useRef } from "react";
import type { Group } from "three";

import type { SceneState } from "../../types";
import { getEscape } from "../../utils/blackHole";

interface SystemGroupProps {
  sceneStateRef: RefObject<SceneState>;
  children: React.ReactNode;
}

export function SystemGroup({ sceneStateRef, children }: SystemGroupProps) {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    const escape = getEscape(sceneStateRef.current);
    group.visible = escape < 1;
    group.scale.setScalar(1 - escape);
  });

  return <group ref={groupRef}>{children}</group>;
}
