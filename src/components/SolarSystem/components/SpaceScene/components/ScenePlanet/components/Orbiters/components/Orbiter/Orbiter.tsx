import { useCursor } from "@react-three/drei";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { type RefObject, useRef, useState } from "react";
import type { Mesh } from "three";

import type { SceneState } from "#/components/SolarSystem/components/SpaceScene/types";
import {
  isDragRelease,
  toScenePosition,
} from "#/components/SolarSystem/components/SpaceScene/utils/sceneMath";
import type { Orbiter as OrbiterData } from "#/components/SolarSystem/utils/orbiters";
import { getTiltedPoint } from "#/components/SolarSystem/utils/space";
import { getSurfaceHex } from "#/components/SolarSystem/utils/surfaceColor";

import type { HoverChange } from "../../../../types";
import { HoverName } from "../../../HoverName";

const MOON_SEGMENTS = 24;
// Four segments draw a diamond: a satellite.
const SATELLITE_SEGMENTS = 4;
const PAST_MOON_OPACITY = 0.75;
const CRATER_SEGMENTS = 12;
// How much a crater darkens its rock.
const CRATER_OPACITY = 0.35;
// Craters sit a hair above their rock.
const CRATER_LIFT = 0.05;
// A hair toward the camera, so the orbiter covers its own orbit line.
const ORBITER_LIFT = 0.5;
// Small moons are hard to point at: a wider, invisible target catches the pointer.
const HIT_AREA_SCALE = 2.5;

interface OrbiterProps {
  orbiter: OrbiterData;
  isPlanetOpen: boolean;
  onHoverChange: (change: HoverChange) => void;
  onPlanetClick: () => void;
  sceneStateRef: RefObject<SceneState>;
}

// One moon, satellite or rock on its tilted orbit; it names itself on hover and holds its planet
// still. While its planet is open, an orbiter with a link (Earth's moon) opens it; otherwise a
// click opens the planet.
export function Orbiter({
  orbiter,
  isPlanetOpen,
  onHoverChange,
  onPlanetClick,
  sceneStateRef,
}: OrbiterProps) {
  const meshRef = useRef<Mesh>(null);
  const angleRef = useRef(orbiter.phase);
  const [isHovered, setIsHovered] = useState(false);

  const isRound = orbiter.kind !== "satellite";
  const isMoon = orbiter.kind === "moon";
  const opacity = isMoon && !orbiter.isHighlighted ? PAST_MOON_OPACITY : 1;
  const link = isPlanetOpen ? orbiter.link : undefined;
  useCursor(isHovered && link !== undefined);

  useFrame(() => {
    angleRef.current += orbiter.speed * sceneStateRef.current.frameStep;
    const point = getTiltedPoint({ radius: orbiter.orbitRadius, angle: angleRef.current });
    meshRef.current?.position.set(
      ...toScenePosition({ ...point, depth: point.depth + ORBITER_LIFT }),
    );
  });

  function handlePointerOver(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    setIsHovered(true);
    onHoverChange({ source: orbiter.id, isHovered: true });
  }

  function handlePointerOut() {
    setIsHovered(false);
    onHoverChange({ source: orbiter.id, isHovered: false });
  }

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    if (isDragRelease(event.delta)) return;
    if (link) {
      window.open(link.href, "_blank", "noopener,noreferrer");
      return;
    }
    onPlanetClick();
  }

  return (
    <mesh ref={meshRef}>
      <circleGeometry args={[orbiter.radius, isRound ? MOON_SEGMENTS : SATELLITE_SEGMENTS]} />
      <meshBasicMaterial
        color={getSurfaceHex({ color: orbiter.color, shade: orbiter.shade })}
        transparent
        opacity={opacity}
        userData={{ baseOpacity: opacity }}
      />
      {orbiter.kind === "rock"
        ? orbiter.craters.map((crater) => (
            <mesh
              key={`${crater.x},${crater.y}`}
              position={toScenePosition({ ...crater, depth: CRATER_LIFT })}
            >
              <circleGeometry args={[crater.radius, CRATER_SEGMENTS]} />
              <meshBasicMaterial
                color={getSurfaceHex({ color: "shadow", shade: "soft" })}
                transparent
                opacity={CRATER_OPACITY}
                userData={{ baseOpacity: CRATER_OPACITY }}
              />
            </mesh>
          ))
        : null}
      <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut} onClick={handleClick}>
        <circleGeometry args={[orbiter.radius * HIT_AREA_SCALE, MOON_SEGMENTS]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
          userData={{ baseOpacity: 0 }}
        />
      </mesh>
      {isHovered ? <HoverName name={link ? link.label : orbiter.label} /> : null}
    </mesh>
  );
}
