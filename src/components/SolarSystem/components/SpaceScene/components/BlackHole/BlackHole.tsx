import { useGSAP } from "@gsap/react";
import { Billboard } from "@react-three/drei";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { type RefObject, useRef, useState } from "react";
import { Color, type Group, LinearSRGBColorSpace } from "three";

import { messages } from "#/components/SolarSystem/messages";
import { useExploration } from "#/hooks/useExploration";
import { useExplorer } from "#/hooks/useExplorer";
import { useSecrets } from "#/hooks/useSecrets";
import { DESTINATIONS } from "#/utils/destinations";
import { PALETTE } from "#/utils/palette";

import type { SceneState } from "../../types";
import { getHoleScale, HOLE_POSITION, HOLE_RADIUS } from "../../utils/blackHole";
import { damp } from "../../utils/sceneMath";
import { HoverName } from "../HoverName";
import { HOLE_FRAGMENT_SHADER, HOLE_VERTEX_SHADER } from "./utils/holeShaders";

gsap.registerPlugin(useGSAP);

// The plane reaches this many shadow radii from its center: room for the disk.
const PLANE_REACH = 5;
const PLANE_SIZE = HOLE_RADIUS * PLANE_REACH * 2;
// Easy to miss until every planet is visited; then it shows itself.
const HIDDEN_OPACITY = 0.4;
// The flight in takes this long; the ship is back a beat after the screen has gone black.
const JUMP_SECONDS = 5;
const ARRIVE_AFTER = 5.5;
const NAME_POSITION: [number, number, number] = [0, HOLE_RADIUS * 2, 0];

// sRGB as written: the shader outputs it as it is.
function toShaderColor(hex: string) {
  return new Color().setStyle(hex, LinearSRGBColorSpace);
}

interface BlackHoleProps {
  sceneStateRef: RefObject<SceneState>;
}

// An easter egg: a black hole far out in the sky, small and dim. Once every planet is visited
// it brightens and the cockpit can fly into it (`go gargantua`): the camera turns to face it
// and it grows until its shadow is all there is. Then the ship is back where it was.
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
      uOpacity: { value: HIDDEN_OPACITY },
      uShadowShare: { value: 1 / PLANE_REACH },
    },
  }));
  const groupRef = useRef<Group>(null);
  // 0 to 1 through the flight in; GSAP drives it.
  const jumpRef = useRef({ progress: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const isJumping = explorer.jump.status === "jumping";
  const isFound = secrets.hasCrossedHorizon || exploration.visitedIds.length >= DESTINATIONS.length;

  useGSAP(
    () => {
      if (!isJumping) return;
      const jump = jumpRef.current;
      gsap
        .timeline()
        .fromTo(jump, { progress: 0 }, { progress: 1, duration: JUMP_SECONDS, ease: "none" })
        .call(explorer.endJump, undefined, ARRIVE_AFTER)
        // Back where the ship was, unseen: the cockpit is still black.
        .set(jump, { progress: 0 });
    },
    { dependencies: [isJumping] },
  );

  useFrame(({ clock }, delta) => {
    const { progress } = jumpRef.current;
    sceneStateRef.current.jump = progress;
    groupRef.current?.scale.setScalar(getHoleScale(progress));
    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uOpacity.value = damp({
      current: material.uniforms.uOpacity.value,
      target: isFound || isHovered ? 1 : HIDDEN_OPACITY,
      delta,
    });
  });

  function handlePointerOver(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    setIsHovered(true);
  }

  function handlePointerOut() {
    setIsHovered(false);
  }

  return (
    <group position={HOLE_POSITION}>
      <Billboard>
        <group ref={groupRef}>
          <mesh frustumCulled={false} renderOrder={-1}>
            <planeGeometry args={[PLANE_SIZE, PLANE_SIZE]} />
            <shaderMaterial args={[material]} transparent depthTest={false} depthWrite={false} />
          </mesh>
        </group>
        <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
          <circleGeometry args={[HOLE_RADIUS * 2.5, 24]} />
          <meshBasicMaterial colorWrite={false} depthWrite={false} />
        </mesh>
      </Billboard>
      {isHovered ? (
        <HoverName
          name={isFound ? messages.blackHole : messages.blackHoleUnknown}
          position={NAME_POSITION}
        />
      ) : null}
    </group>
  );
}
