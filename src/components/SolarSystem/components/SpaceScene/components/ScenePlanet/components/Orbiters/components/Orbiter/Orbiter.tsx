import { useCursor } from "@react-three/drei";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { type RefObject, useRef, useState } from "react";
import { type Mesh, Quaternion, Vector3 } from "three";

import type { SceneState } from "#/components/SolarSystem/components/SpaceScene/types";
import {
  isDragRelease,
  toPlanePosition,
} from "#/components/SolarSystem/components/SpaceScene/utils/sceneMath";
import type {
  Orbiter as OrbiterData,
  OrbiterCrater,
} from "#/components/SolarSystem/utils/orbiters";
import { getOrbitPosition } from "#/components/SolarSystem/utils/space";
import { getSurfaceHex } from "#/components/SolarSystem/utils/surfaceColor";

import type { HoverChange } from "../../../../types";
import { HoverName } from "../../../HoverName";

const MOON_SEGMENTS = 24;
const PAST_MOON_OPACITY = 0.75;
const CRATER_SEGMENTS = 12;
// How much a crater darkens its rock.
const CRATER_OPACITY = 0.35;
// Craters sit a hair above their rock.
const CRATER_LIFT = 1.02;
// Small moons are hard to point at: a wider, invisible target catches the pointer.
const HIT_AREA_SCALE = 2.5;
const FACING = new Vector3(0, 0, 1);

// A crater drawn on the rock's disc, moved onto its sphere on the side facing the home view and
// turned to lie flat on it.
function getCraterPlacement({ crater, radius }: { crater: OrbiterCrater; radius: number }) {
  const normal = new Vector3(
    crater.x,
    -crater.y,
    Math.sqrt(Math.max(0, radius ** 2 - crater.x ** 2 - crater.y ** 2)),
  ).normalize();

  return {
    position: normal.clone().multiplyScalar(radius * CRATER_LIFT),
    quaternion: new Quaternion().setFromUnitVectors(FACING, normal),
  };
}

interface OrbiterProps {
  orbiter: OrbiterData;
  isPlanetOpen: boolean;
  onHoverChange: (change: HoverChange) => void;
  onPlanetClick: () => void;
  sceneStateRef: RefObject<SceneState>;
}

// One moon, satellite or rock on its orbit; it names itself on hover and holds its planet
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

  const [craters] = useState(() =>
    orbiter.kind === "rock"
      ? orbiter.craters.map((crater) => ({
          crater,
          ...getCraterPlacement({ crater, radius: orbiter.radius }),
        }))
      : [],
  );

  const isMoon = orbiter.kind === "moon";
  const opacity = isMoon && !orbiter.isHighlighted ? PAST_MOON_OPACITY : 1;
  const link = isPlanetOpen ? orbiter.link : undefined;
  useCursor(isHovered && link !== undefined);

  useFrame(() => {
    angleRef.current += orbiter.speed * sceneStateRef.current.frameStep;
    meshRef.current?.position.set(
      ...toPlanePosition(
        getOrbitPosition({ radius: orbiter.orbitRadius, phase: angleRef.current }),
      ),
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
      {orbiter.kind === "satellite" ? (
        <octahedronGeometry args={[orbiter.radius]} />
      ) : (
        <sphereGeometry args={[orbiter.radius, MOON_SEGMENTS, MOON_SEGMENTS / 2]} />
      )}
      <meshLambertMaterial
        color={getSurfaceHex({ color: orbiter.color, shade: orbiter.shade })}
        transparent
        opacity={opacity}
        userData={{ baseOpacity: opacity }}
      />
      {craters.map(({ crater, position, quaternion }) => (
        <mesh key={`${crater.x},${crater.y}`} position={position} quaternion={quaternion}>
          <circleGeometry args={[crater.radius, CRATER_SEGMENTS]} />
          <meshBasicMaterial
            color={getSurfaceHex({ color: "shadow", shade: "soft" })}
            transparent
            opacity={CRATER_OPACITY}
            userData={{ baseOpacity: CRATER_OPACITY }}
          />
        </mesh>
      ))}
      <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut} onClick={handleClick}>
        <sphereGeometry
          args={[orbiter.radius * HIT_AREA_SCALE, MOON_SEGMENTS, MOON_SEGMENTS / 2]}
        />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
      {isHovered ? <HoverName name={link ? link.label : orbiter.label} /> : null}
    </mesh>
  );
}
