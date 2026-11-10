import { useGSAP } from "@gsap/react";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { type RefObject, useRef, useState } from "react";
import { Color, type Group, LinearSRGBColorSpace, Vector3 } from "three";

import { messages } from "#/components/SolarSystem/messages";
import { useExploration } from "#/hooks/useExploration";
import { useExplorer } from "#/hooks/useExplorer";
import { useSecrets } from "#/hooks/useSecrets";
import { DESTINATIONS } from "#/utils/destinations";
import { PALETTE } from "#/utils/palette";

import type { SceneState } from "../../types";
import {
  getAheadAnchor,
  getHoleDirections,
  getHoleScale,
  getJumpCenter,
  HOLE_DISTANCE,
  HOLE_RADIUS,
} from "../../utils/blackHole";
import { damp, PHONE_MAX_WIDTH } from "../../utils/sceneMath";
import { HoverName } from "../HoverName";
import { HOLE_FRAGMENT_SHADER, HOLE_VERTEX_SHADER } from "./utils/holeShaders";

gsap.registerPlugin(useGSAP);

// The plane reaches this many shadow radii from its center: room for the disk.
const PLANE_REACH = 5;
const PLANE_SIZE = HOLE_RADIUS * PLANE_REACH * 2;
// The flight in takes this long, straight (no ease): the growth itself speeds up.
const JUMP_SECONDS = 8;
// It moves between its place seen from outside and its place seen from the cockpit this fast,
// as the cockpit opens or closes.
const PLACE_LAMBDA = 3;
const NAME_POSITION: [number, number, number] = [0, HOLE_RADIUS * 2, 0];

// The directions to it: where it is in the sky, the cockpit's, and dead ahead.
const toward = new Vector3();
const fromCockpit = new Vector3();
const ahead = new Vector3();

// sRGB as written: the shader outputs it as it is.
function toShaderColor(hex: string) {
  return new Color().setStyle(hex, LinearSRGBColorSpace);
}

interface BlackHoleProps {
  sceneStateRef: RefObject<SceneState>;
}

// An easter egg: a black hole far out in the sky, its disk turning. It is part of the space:
// it turns with the stars as the camera does. It starts in the top right of the home view, and
// in the windshield as the site opens, drifting across as the ship goes round the sun. Once
// every planet is visited the cockpit can fly into it (`go gargantua`): the solar system drops
// away, it swings dead ahead and grows until its shadow is all there is. It stays that way
// until the visitor comes back.
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
  // 0 at its place seen from outside the ship, 1 at its place seen from the cockpit.
  const skyShareRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);

  const jumpStatus = explorer.jump.status;
  const isCockpit = explorer.cockpit.status === "open";
  const isFound = secrets.hasCrossedHorizon || exploration.visitedIds.length >= DESTINATIONS.length;

  useGSAP(
    () => {
      const jump = jumpRef.current;
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
        case "idle":
          gsap.killTweensOf(jump);
          jump.progress = 0;
          return;
        default: {
          const unknownStatus: never = jumpStatus;
          return unknownStatus;
        }
      }
    },
    { dependencies: [jumpStatus] },
  );

  useFrame(({ camera, clock, size }, delta) => {
    const { progress } = jumpRef.current;
    sceneStateRef.current.jump = progress;
    material.uniforms.uTime.value = clock.elapsedTime;
    growRef.current?.scale.setScalar(getHoleScale(progress));
    const group = groupRef.current;
    if (!group) return;

    const isPhone = size.width < PHONE_MAX_WIDTH;
    skyShareRef.current = damp({
      current: skyShareRef.current,
      target: isCockpit ? 1 : 0,
      delta,
      lambda: PLACE_LAMBDA,
    });
    const directions = getHoleDirections(isPhone);
    const front = getAheadAnchor(isPhone);
    ahead.set(front.x, front.y, 0.5).unproject(camera).sub(camera.position).normalize();
    // Its place in the sky, then dead ahead on the flight in.
    toward.set(...directions.home);
    toward.lerp(fromCockpit.set(...directions.cockpit), skyShareRef.current).normalize();
    toward.lerp(ahead, getJumpCenter(progress)).normalize();
    group.position.copy(camera.position).addScaledVector(toward, HOLE_DISTANCE);
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
      <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <circleGeometry args={[HOLE_RADIUS * 2.5, 24]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
      {isHovered ? (
        <HoverName
          name={isFound ? messages.blackHole : messages.blackHoleUnknown}
          position={NAME_POSITION}
        />
      ) : null}
    </group>
  );
}
