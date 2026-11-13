import { useGSAP } from "@gsap/react";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { type RefObject, useRef, useState } from "react";
import {
  Color,
  type Group,
  LinearSRGBColorSpace,
  type Mesh,
  type MeshBasicMaterial,
  Vector3,
} from "three";

import { messages } from "#/components/SolarSystem/messages";
import { useExploration } from "#/hooks/useExploration";
import { useExplorer } from "#/hooks/useExplorer";
import { useSecrets } from "#/hooks/useSecrets";
import { DESTINATIONS } from "#/utils/destinations";
import { PALETTE } from "#/utils/palette";

import type { SceneState } from "../../types";
import {
  getAheadAnchor,
  getHolePosition,
  getHoleScale,
  getJumpCenter,
  HOLE_RADIUS,
} from "../../utils/blackHole";
import { PHONE_MAX_WIDTH } from "../../utils/sceneMath";
import { HoverName } from "../HoverName";
import { HOLE_FRAGMENT_SHADER, HOLE_VERTEX_SHADER } from "./utils/holeShaders";

gsap.registerPlugin(useGSAP);

// The plane reaches this many shadow radii from its center: room for the disk.
const PLANE_REACH = 5;
const PLANE_SIZE = HOLE_RADIUS * PLANE_REACH * 2;
// The flight in takes this long, straight (no ease): the growth itself speeds up.
const JUMP_SECONDS = 8;
// The flight home, a little quicker than the way in.
const RETURN_SECONDS = 6;
const NAME_POSITION: [number, number, number] = [0, HOLE_RADIUS * 2, 0];
const SIGNAL = { seconds: 2.6, from: 1.6, to: 7, width: 0.05, opacity: 0.8 } as const;

// From the camera: the way to it, and dead ahead.
const toward = new Vector3();
const ahead = new Vector3();

// sRGB as written: the shader outputs it as it is.
function toShaderColor(hex: string) {
  return new Color().setStyle(hex, LinearSRGBColorSpace);
}

interface BlackHoleProps {
  sceneStateRef: RefObject<SceneState>;
}

export function BlackHole({ sceneStateRef }: BlackHoleProps) {
  const explorer = useExplorer();
  const exploration = useExploration();
  const secrets = useSecrets();
  const [material] = useState(() => ({
    vertexShader: HOLE_VERTEX_SHADER,
    fragmentShader: HOLE_FRAGMENT_SHADER,
    uniforms: {
      uColor: { value: toShaderColor(PALETTE.ochre.soft) },
      uCoolColor: { value: toShaderColor(PALETTE.clay.soft) },
      uHotColor: { value: toShaderColor(PALETTE.neutral.soft) },
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uShadowShare: { value: 1 / PLANE_REACH },
    },
  }));
  const groupRef = useRef<Group>(null);
  const growRef = useRef<Group>(null);
  // 0 to 1 through the flight in; GSAP drives it.
  const jumpRef = useRef({ progress: 0 });
  // 1 to 0 through the flight home; GSAP drives it.
  const homingRef = useRef({ progress: 0 });
  const signalRef = useRef<Mesh>(null);
  const signalMaterialRef = useRef<MeshBasicMaterial>(null);
  const [isHovered, setIsHovered] = useState(false);

  const jumpStatus = explorer.jump.status;
  const isFound = secrets.hasCrossedHorizon || exploration.visitedIds.length >= DESTINATIONS.length;
  // Found and still ahead: it sends out rings and wears its name, so it cannot be missed.
  const isCalling = isFound && !secrets.hasCrossedHorizon && jumpStatus === "idle";

  useGSAP(
    () => {
      const jump = jumpRef.current;
      const homing = homingRef.current;
      switch (jumpStatus) {
        case "jumping":
          gsap
            .timeline()
            .fromTo(jump, { progress: 0 }, { progress: 1, duration: JUMP_SECONDS, ease: "none" })
            .call(explorer.reachHorizon);
          return;
        case "inside":
          // Without a flight (the visitor was put inside at once) it is all shadow just the same.
          jump.progress = 1;
          return;
        case "returning":
          jump.progress = 0;
          gsap
            .timeline()
            .fromTo(
              homing,
              { progress: 1 },
              { progress: 0, duration: RETURN_SECONDS, ease: "power1.inOut" },
            )
            .call(explorer.finishJump);
          return;
        case "idle":
          gsap.killTweensOf([jump, homing]);
          jump.progress = 0;
          homing.progress = 0;
          return;
        default: {
          const unknownStatus: never = jumpStatus;
          return unknownStatus;
        }
      }
    },
    { dependencies: [jumpStatus] },
  );

  useFrame(({ camera, clock, size }) => {
    const { progress } = jumpRef.current;
    sceneStateRef.current.jump = progress;
    sceneStateRef.current.homing = homingRef.current.progress;
    material.uniforms.uTime.value = clock.elapsedTime;
    growRef.current?.scale.setScalar(getHoleScale(progress));
    const signalShare = (clock.elapsedTime / SIGNAL.seconds) % 1;
    signalRef.current?.scale.setScalar(SIGNAL.from + (SIGNAL.to - SIGNAL.from) * signalShare);
    if (signalMaterialRef.current) {
      signalMaterialRef.current.opacity = SIGNAL.opacity * (1 - signalShare) ** 2;
    }
    const group = groupRef.current;
    if (!group) return;
    // Flying home, the hole is behind the ship: out of sight.
    group.visible = homingRef.current.progress === 0;

    const isPhone = size.width < PHONE_MAX_WIDTH;
    const front = getAheadAnchor(isPhone);
    ahead.set(front.x, front.y, 0.5).unproject(camera).sub(camera.position).normalize();
    toward.set(...getHolePosition()).sub(camera.position);
    const distance = toward.length();
    toward.normalize().lerp(ahead, getJumpCenter(progress)).normalize();
    group.position.copy(camera.position).addScaledVector(toward, distance);
    group.quaternion.copy(camera.quaternion);
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
      <group ref={growRef}>
        <mesh frustumCulled={false} renderOrder={-1}>
          <planeGeometry args={[PLANE_SIZE, PLANE_SIZE]} />
          <shaderMaterial args={[material]} transparent depthTest={false} depthWrite={false} />
        </mesh>
      </group>
      {isCalling ? (
        <mesh ref={signalRef} renderOrder={-1}>
          <ringGeometry args={[HOLE_RADIUS * (1 - SIGNAL.width), HOLE_RADIUS, 48]} />
          <meshBasicMaterial
            ref={signalMaterialRef}
            color={PALETTE.ochre.soft}
            transparent
            depthTest={false}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <circleGeometry args={[HOLE_RADIUS * 2.5, 24]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
      {isHovered || isCalling ? (
        <HoverName name={messages.blackHole} position={NAME_POSITION} />
      ) : null}
    </group>
  );
}
