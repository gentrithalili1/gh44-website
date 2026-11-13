import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { type RefObject, useRef, useState } from "react";
import type { Group } from "three";

import type { SceneState } from "../../../../types";
import { setGroupOpacity } from "../../../../utils/groupOpacity";
import { damp, FADED_OPACITY } from "../../../../utils/sceneMath";
import { HoverName } from "../../../HoverName";
import { PROBE_REACH, PROBE_TOP, ProbeModel } from "../ProbeModel";
import {
  getCourseShare,
  getVoyagerFade,
  getVoyagerPosition,
  type VoyagerCourse,
} from "../../utils/voyagerCourse";

const ROUND = 20;
const NAME_POSITION: [number, number, number] = [0, PROBE_TOP, 0];

interface VoyagerProbeProps {
  course: VoyagerCourse;
  name: string;
  // Steps back with the rest of the system.
  isFaded: boolean;
  sceneStateRef: RefObject<SceneState>;
}

export function VoyagerProbe({ course, name, isFaded, sceneStateRef }: VoyagerProbeProps) {
  const groupRef = useRef<Group>(null);
  const timeRef = useRef(0);
  const opacityRef = useRef(1);
  const [isHovered, setIsHovered] = useState(false);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    timeRef.current += sceneStateRef.current.frameStep;
    const share = getCourseShare({ course, time: timeRef.current });
    group.position.set(...getVoyagerPosition({ course, share }));
    // The dish keeps looking back at the sun, and Earth beside it.
    group.lookAt(0, 0, 0);
    opacityRef.current = damp({
      current: opacityRef.current,
      target: isFaded ? FADED_OPACITY : 1,
      delta,
    });
    setGroupOpacity({ group, opacity: opacityRef.current * getVoyagerFade(share) });
  });

  function handlePointerOver(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    setIsHovered(true);
  }

  function handlePointerOut() {
    setIsHovered(false);
  }

  return (
    <group ref={groupRef}>
      <ProbeModel />
      <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <sphereGeometry args={[PROBE_REACH, ROUND, ROUND / 2]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
      {isHovered ? <HoverName name={name} position={NAME_POSITION} /> : null}
    </group>
  );
}
