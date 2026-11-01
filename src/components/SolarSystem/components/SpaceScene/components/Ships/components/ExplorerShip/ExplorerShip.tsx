import { useGSAP } from "@gsap/react";
import { Html, useCursor } from "@react-three/drei";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { useNavigate } from "@tanstack/react-router";
import gsap from "gsap";
import { type RefObject, useRef, useState } from "react";
import { type Group, type Mesh, MeshBasicMaterial, Shape, Vector2 } from "three";

import { messages } from "#/components/SolarSystem/messages";
import type { PlanetState, Point } from "#/components/SolarSystem/types";
import {
  getShipAngle,
  getShipPose,
  SHIP_CANOPY,
  SHIP_ENGINE,
  SHIP_HULL,
  SHIP_LENGTH,
  SHIP_SCALE,
  type ShipPose,
} from "#/components/SolarSystem/utils/ship";
import { getOrbitPosition } from "#/components/SolarSystem/utils/space";
import { useExplorer } from "#/hooks/useExplorer";
import { PALETTE } from "#/utils/palette";
import { findPlanet } from "#/utils/planets";

import type { SceneState } from "../../../../types";
import { setGroupOpacity } from "../../../../utils/groupOpacity";
import { damp, FADED_OPACITY, getOrbitPace, toScenePosition } from "../../../../utils/sceneMath";
import { getFlightPose } from "./utils/shipFlight";
import { getTrailPuff, PUFF_COUNT } from "./utils/shipTrail";

gsap.registerPlugin(useGSAP);

// Behind every planet, moon and ring (they reach 75 units toward the camera and away from it),
// so a planet passing by covers the ship, never the other way round.
const SHIP_DEPTH = -80;
// On a phone the ship would be a speck: it never draws shorter than this many pixels.
const SHIP_MIN_LENGTH_PX = 34;
// It bobs toward and away from the sun, and rocks a little, slowly.
const BOB_UNITS = 1.4;
const BOB_SPEED = 1.1;
const TILT_RADIANS = 0.07;
const TILT_SPEED = 0.7;
// How fast the bob settles when the ship stops, and picks up again.
const BOB_LAMBDA = 3;
// The engine glows softly, flickers a little, and flares while hovered, while the cockpit is
// open and in flight.
const GLOW_IDLE = 0.45;
const GLOW_FLARED = 1;
const GLOW_FLICKER = 0.08;
const GLOW_FLICKER_SPEED = 9;
const GLOW_HOVER_GROWTH = 0.5;
const GLOW_TEXTURE_SIZE = 64;
// The glow's solid core, as a share of its radius.
const GLOW_CORE = 0.2;
// The pointer target: a circle around the whole ship, easier to hit than its outline.
const HIT_RADIUS = 10;
const CIRCLE_SEGMENTS = 32;
const PUFF_RADIUS = 0.9;
const PUFF_IDS = Array.from({ length: PUFF_COUNT }, (_, index) => index);
// Over the labels, like the names of hovered moons.
const LABEL_Z_INDEX_RANGE = [2, 0];

// After `go` the cockpit shows its confirmation this long, then closes and the ship flies:
// it turns toward the planet, then flies at it, about 700ms in all.
const CONFIRM_SECONDS = 0.6;
const TURN_SECONDS = 0.25;
const TRAVEL_SECONDS = 0.5;
const TRAVEL_STARTS_INTO_TURN = 0.6;
const TURN_EASE = "power2.inOut";
const TRAVEL_EASE = "power2.in";

// Under the hull, so the glow spills out from behind the tail.
const ENGINE_POSITION = toScenePosition({ ...SHIP_ENGINE, depth: -0.1 });

function createShape(points: readonly Point[]) {
  return new Shape(
    points.map((point) => {
      const [x, y] = toScenePosition(point);
      return new Vector2(x, y);
    }),
  );
}

// A radial fade from the engine's color to transparent.
function drawEngineGlow() {
  const canvas = document.createElement("canvas");
  canvas.width = GLOW_TEXTURE_SIZE;
  canvas.height = GLOW_TEXTURE_SIZE;
  const context = canvas.getContext("2d");
  if (context) {
    const center = GLOW_TEXTURE_SIZE / 2;
    const gradient = context.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, PALETTE.terracotta.vivid);
    gradient.addColorStop(GLOW_CORE, PALETTE.terracotta.vivid);
    gradient.addColorStop(1, "transparent");
    context.fillStyle = gradient;
    context.fillRect(0, 0, GLOW_TEXTURE_SIZE, GLOW_TEXTURE_SIZE);
  }

  return canvas;
}

function createShipShapes() {
  return { hull: createShape(SHIP_HULL), canopy: createShape(SHIP_CANOPY) };
}

// Where the ship is headed from where, and how far through the turn and the trip (GSAP drives
// both).
type ShipFlight = { planetId: string | null; home: ShipPose; turn: number; travel: number };

// Like a planet's state: off its orbit for the launch, stepped back behind an open planet.
function getShipState({ isFlying, isFaded }: { isFlying: boolean; isFaded: boolean }): PlanetState {
  if (isFlying) return "current";

  return isFaded ? "faded" : "idle";
}

function setMaterialOpacity({ mesh, opacity }: { mesh: Mesh | null; opacity: number }) {
  if (mesh?.material instanceof MeshBasicMaterial) mesh.material.opacity = opacity;
}

interface ExplorerShipProps {
  openPlanetId: string | undefined;
  sceneStateRef: RefObject<SceneState>;
}

// The gh44 explorer orbits the sun between Mars and Jupiter on the scene clock, nose first,
// bobbing, its engine glowing and now and then puffing a trail. It holds still while hovered.
// Clicking it opens the cockpit: the camera flies in and follows it, its engine flared. On
// `go` it turns toward the planet and flies there, then the page opens. It steps back, and takes
// no clicks, while a planet is open.
export function ExplorerShip({ openPlanetId, sceneStateRef }: ExplorerShipProps) {
  const explorer = useExplorer();
  const navigate = useNavigate();
  const [shapes] = useState(createShipShapes);
  const [glowCanvas] = useState(drawEngineGlow);
  const groupRef = useRef<Group>(null);
  const scaleRef = useRef<Group>(null);
  const bodyRef = useRef<Group>(null);
  const glowRef = useRef<Mesh>(null);
  const puffMeshesRef = useRef<(Mesh | null)[]>([]);
  const timeRef = useRef(0);
  // Seconds of orbit: the scene clock, at the ship's pace.
  const orbitTimeRef = useRef(0);
  const opacityRef = useRef(1);
  const glowLevelRef = useRef(GLOW_IDLE);
  const bobLevelRef = useRef(1);
  const flightRef = useRef<ShipFlight>({
    planetId: null,
    home: getShipPose(getShipAngle(0)),
    turn: 0,
    travel: 0,
  });
  const [isHovered, setIsHovered] = useState(false);

  const isFlying = explorer.flight.status === "flying";
  // With the cockpit open it cruises on, the camera following: space slides past the windshield.
  const isCockpitOpen = explorer.cockpit.status === "open";
  // Over an open planet the cockpit still flies to the ship, so it comes forward for it.
  const isFaded = openPlanetId !== undefined && !isCockpitOpen && !isFlying;
  // The cockpit covers the ship, so a hover from before it opened no longer counts.
  const isActive = isHovered && !isFaded && !isCockpitOpen;
  useCursor(isActive);

  // `go`: a beat for the confirmation, the cockpit closes, the ship turns and flies, and the page
  // opens on arrival; the camera's own flight takes over from there.
  useGSAP(
    () => {
      if (explorer.flight.status !== "flying") return;
      const { destination } = explorer.flight;
      const flight = flightRef.current;
      flight.planetId = destination.name;
      flight.home = sceneStateRef.current.shipPose;
      flight.turn = 0;
      flight.travel = 0;
      gsap
        .timeline({
          onComplete: () => {
            flight.planetId = null;
            // Back home unseen: it fades in again behind the open planet.
            opacityRef.current = 0;
            explorer.endFlight();
            void navigate({ to: "/$planetId", params: { planetId: destination.name } });
          },
        })
        .call(explorer.closeCockpit, undefined, CONFIRM_SECONDS)
        .to(flight, { turn: 1, duration: TURN_SECONDS, ease: TURN_EASE }, CONFIRM_SECONDS)
        .to(
          flight,
          { travel: 1, duration: TRAVEL_SECONDS, ease: TRAVEL_EASE },
          CONFIRM_SECONDS + TURN_SECONDS * TRAVEL_STARTS_INTO_TURN,
        );
    },
    { dependencies: [explorer.flight] },
  );

  useFrame(({ camera }, delta) => {
    const group = groupRef.current;
    const body = bodyRef.current;
    if (!group || !body) return;
    const sceneState = sceneStateRef.current;
    timeRef.current += sceneState.frameStep;
    const time = timeRef.current;

    orbitTimeRef.current +=
      getOrbitPace({ state: getShipState({ isFlying, isFaded }), isHovered: isActive }) *
      sceneState.frameStep;
    const orbitAngle = getShipAngle(orbitTimeRef.current);

    const flight = flightRef.current;
    const planet = flight.planetId ? findPlanet(flight.planetId) : undefined;
    const planetAngle = planet ? sceneState.planetAngles.get(planet.id) : undefined;
    const pose =
      planet && planetAngle !== undefined
        ? getFlightPose({
            home: flight.home,
            homeHeading: flight.home.heading,
            target: getOrbitPosition({ radius: planet.orbit.radius, phase: planetAngle }),
            stopDistance: planet.size,
            turn: flight.turn,
            travel: flight.travel,
          })
        : { ...getShipPose(orbitAngle), fade: 1 };
    sceneState.shipPose = { x: pose.x, y: pose.y, heading: pose.heading };

    bobLevelRef.current = damp({
      current: bobLevelRef.current,
      target: isFlying ? 0 : 1,
      delta,
      lambda: BOB_LAMBDA,
    });
    const bobLevel = bobLevelRef.current;
    // Toward and away from the sun.
    const bob = getOrbitPosition({
      radius: Math.sin(time * BOB_SPEED) * BOB_UNITS * bobLevel,
      phase: orbitAngle,
    });
    group.position.set(
      ...toScenePosition({ x: pose.x + bob.x, y: pose.y + bob.y, depth: SHIP_DEPTH }),
    );
    scaleRef.current?.scale.setScalar(
      Math.max(SHIP_SCALE, SHIP_MIN_LENGTH_PX / (SHIP_LENGTH * camera.zoom)),
    );
    // The screen's clockwise turn is negative around the camera's axis.
    body.rotation.z = -(pose.heading + Math.sin(time * TILT_SPEED) * TILT_RADIANS * bobLevel);

    opacityRef.current = damp({
      current: opacityRef.current,
      target: isFaded ? FADED_OPACITY : 1,
      delta,
    });
    const opacity = opacityRef.current * pose.fade;
    setGroupOpacity({ group, opacity });

    glowLevelRef.current = damp({
      current: glowLevelRef.current,
      target: isActive || isCockpitOpen || isFlying ? GLOW_FLARED : GLOW_IDLE,
      delta,
    });
    const glowLevel = glowLevelRef.current;
    const flicker = Math.sin(time * GLOW_FLICKER_SPEED) * GLOW_FLICKER;
    setMaterialOpacity({ mesh: glowRef.current, opacity: (glowLevel + flicker) * opacity });
    glowRef.current?.scale.setScalar(1 + (glowLevel - GLOW_IDLE) * GLOW_HOVER_GROWTH);

    puffMeshesRef.current.forEach((mesh, index) => {
      if (!mesh) return;
      const puff = getTrailPuff({ index, time });
      mesh.visible = puff !== null;
      if (!puff) return;
      mesh.position.set(
        ...toScenePosition({ x: SHIP_ENGINE.x + puff.x, y: SHIP_ENGINE.y + puff.y }),
      );
      mesh.scale.setScalar(puff.scale);
      setMaterialOpacity({ mesh, opacity: puff.opacity * opacity });
    });
  });

  // On board while mounted: `go` waits for this ship's flight.
  function handleGroupRef(group: Group | null) {
    groupRef.current = group;
    if (!group) return;
    const leaveShip = explorer.boardShip();
    return () => {
      groupRef.current = null;
      leaveShip();
    };
  }

  function handlePointerOver(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    setIsHovered(true);
  }

  function handlePointerOut() {
    setIsHovered(false);
  }

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    explorer.openCockpit();
  }

  return (
    <group ref={handleGroupRef}>
      <group ref={scaleRef}>
        <group ref={bodyRef}>
          <mesh
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onClick={isFaded ? undefined : handleClick}
          >
            <circleGeometry args={[HIT_RADIUS, CIRCLE_SEGMENTS]} />
            <meshBasicMaterial colorWrite={false} depthWrite={false} />
          </mesh>
          {PUFF_IDS.map((id) => (
            <mesh
              key={id}
              ref={(mesh) => {
                puffMeshesRef.current[id] = mesh;
              }}
              visible={false}
            >
              <circleGeometry args={[PUFF_RADIUS, CIRCLE_SEGMENTS]} />
              <meshBasicMaterial color={PALETTE.terracotta.soft} transparent depthWrite={false} />
            </mesh>
          ))}
          <mesh ref={glowRef} position={ENGINE_POSITION}>
            <circleGeometry args={[SHIP_ENGINE.radius, CIRCLE_SEGMENTS]} />
            <meshBasicMaterial transparent depthWrite={false}>
              <canvasTexture attach="map" args={[glowCanvas]} />
            </meshBasicMaterial>
          </mesh>
          <mesh>
            <shapeGeometry args={[shapes.hull]} />
            <meshBasicMaterial color={PALETTE.neutral.vivid} />
          </mesh>
          <mesh position={[0, 0, 0.1]}>
            <shapeGeometry args={[shapes.canopy]} />
            <meshBasicMaterial color={PALETTE.terracotta.soft} />
          </mesh>
        </group>
        {isActive && !isFlying ? (
          <Html
            position={[0, -HIT_RADIUS, 0]}
            zIndexRange={LABEL_Z_INDEX_RANGE}
            className="pointer-events-none"
          >
            <span
              role="tooltip"
              className="flex -translate-x-1/2 translate-y-1 flex-col items-center rounded-sm bg-background px-1.5 py-0.5 text-label-sub whitespace-nowrap"
            >
              <span className="text-foreground">{messages.shipName}</span>
              <span className="text-terracotta">{messages.shipAction}</span>
            </span>
          </Html>
        ) : null}
      </group>
    </group>
  );
}
