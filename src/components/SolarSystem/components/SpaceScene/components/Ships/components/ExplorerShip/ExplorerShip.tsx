import { useGSAP } from "@gsap/react";
import { Billboard, Html, useCursor } from "@react-three/drei";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { useNavigate } from "@tanstack/react-router";
import gsap from "gsap";
import { type RefObject, useRef, useState } from "react";
import { type Group, Material, type Mesh, PerspectiveCamera, type Sprite } from "three";

import { messages } from "#/components/SolarSystem/messages";
import type { PlanetState } from "#/components/SolarSystem/types";
import {
  getShipAngle,
  getShipPose,
  SHIP_ENGINE,
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
import {
  damp,
  FADED_OPACITY,
  getOrbitPace,
  getPixelsPerUnit,
  getPlaneYaw,
  isDragRelease,
  toPlanePosition,
} from "../../../../utils/sceneMath";
import { ShipHull } from "./components/ShipHull";
import { getFlightPose } from "./utils/shipFlight";
import { getBank } from "./utils/shipModel";
import { getTrailPuff, PUFF_COUNT } from "./utils/shipTrail";

gsap.registerPlugin(useGSAP);

// On a phone the ship would be a speck: it never draws shorter than this many pixels.
const SHIP_MIN_LENGTH_PX = 41;
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
const SPHERE_SEGMENTS = 12;
const PUFF_RADIUS = 0.9;
// It rolls into its turns: roll first, then the heading.
const BODY_ROTATION_ORDER = "YXZ";
const BANK_LAMBDA = 7;
const PUFF_IDS = Array.from({ length: PUFF_COUNT }, (_, index) => index);
// The name hangs just under the hull, closer than the pointer target's edge.
const LABEL_DROP = 4;
// Over the labels, like the names of hovered moons.
const LABEL_Z_INDEX_RANGE = [2, 0];

// After `go` the cockpit shows its confirmation this long, then closes and the ship flies:
// it turns toward the planet, then flies at it, under a second in all.
const CONFIRM_SECONDS = 0.6;
const TURN_SECONDS = 0.3;
const TRAVEL_SECONDS = 0.6;
const TRAVEL_STARTS_INTO_TURN = 0.6;
const TURN_EASE = "power2.inOut";
const TRAVEL_EASE = "power2.in";
// The jump: the stars start to stretch while the confirmation still shows, seen through the
// windshield, and the engine opens up as the ship leaves. On arrival the jump ends with a
// brake that dips just past rest.
const WARP_STARTS_AT = 0.15;
const WARP_IN_SECONDS = 0.55;
const WARP_IN_EASE = "power2.in";
const WARP_OUT_SECONDS = 0.7;
const WARP_OUT_EASE = "back.out(2.2)";
const THRUST_SECONDS = 0.3;

// Just behind the tail, so the glow spills out from it.
const ENGINE_POSITION = toPlanePosition(SHIP_ENGINE);

// A radial fade from the engine's color to transparent.
function drawEngineGlow() {
  const canvas = document.createElement("canvas");
  canvas.width = GLOW_TEXTURE_SIZE;
  canvas.height = GLOW_TEXTURE_SIZE;
  const context = canvas.getContext("2d");
  if (context) {
    const center = GLOW_TEXTURE_SIZE / 2;
    const gradient = context.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, PALETTE.clay.vivid);
    gradient.addColorStop(GLOW_CORE, PALETTE.clay.vivid);
    gradient.addColorStop(1, "transparent");
    context.fillStyle = gradient;
    context.fillRect(0, 0, GLOW_TEXTURE_SIZE, GLOW_TEXTURE_SIZE);
  }

  return canvas;
}

// Where the ship is headed from where, how far through the turn and the trip, how far into the
// jump the stars are and how hard the engine pushes (GSAP drives them all).
type ShipFlight = {
  planetId: string | null;
  home: ShipPose;
  turn: number;
  travel: number;
  warp: number;
  thrust: number;
};

// Like a planet's state: off its orbit for the launch, stepped back behind an open planet.
function getShipState({ isFlying, isFaded }: { isFlying: boolean; isFaded: boolean }): PlanetState {
  if (isFlying) return "current";

  return isFaded ? "faded" : "idle";
}

function setMaterialOpacity({
  object,
  opacity,
}: {
  object: Mesh | Sprite | null;
  opacity: number;
}) {
  if (object?.material instanceof Material) object.material.opacity = opacity;
}

interface ExplorerShipProps {
  openPlanetId: string | undefined;
  sceneStateRef: RefObject<SceneState>;
}

// The gh44 explorer orbits the sun between Mars and Jupiter on the scene clock, nose first,
// bobbing, its engine burning and now and then puffing a trail. It holds still while hovered.
// Clicking it opens the cockpit: the camera flies in and follows it, its engine flared. On
// `go` the stars stretch, it banks toward the planet and flies there, then the page opens. It steps back while a
// planet is open, and still opens the cockpit from there, coming forward while hovered.
export function ExplorerShip({ openPlanetId, sceneStateRef }: ExplorerShipProps) {
  const explorer = useExplorer();
  const navigate = useNavigate();
  const [glowCanvas] = useState(drawEngineGlow);
  const groupRef = useRef<Group>(null);
  const scaleRef = useRef<Group>(null);
  const bodyRef = useRef<Group>(null);
  const glowRef = useRef<Sprite>(null);
  const puffMeshesRef = useRef<(Mesh | null)[]>([]);
  const timeRef = useRef(0);
  // Seconds of orbit: the scene clock, at the ship's pace.
  const orbitTimeRef = useRef(0);
  const opacityRef = useRef(1);
  const glowLevelRef = useRef(GLOW_IDLE);
  const bobLevelRef = useRef(1);
  // 0 idle to 1 flared, for the exhaust; and the roll and heading of the last frame.
  const flareRef = useRef(0);
  const thrustRef = useRef(0);
  const bankRef = useRef(0);
  const headingRef = useRef<number | null>(null);
  const flightRef = useRef<ShipFlight>({
    planetId: null,
    home: getShipPose(getShipAngle(0)),
    turn: 0,
    travel: 0,
    warp: 0,
    thrust: 0,
  });
  const [isHovered, setIsHovered] = useState(false);

  const isFlying = explorer.flight.status === "flying";
  // With the cockpit open it cruises on, the camera following: space slides past the windshield.
  const isCockpitOpen = explorer.cockpit.status === "open";
  // Over an open planet the cockpit still flies to the ship, so it comes forward for it.
  const isFaded = openPlanetId !== undefined && !isCockpitOpen && !isFlying;
  // The cockpit covers the ship, so a hover from before it opened no longer counts.
  const isActive = isHovered && !isCockpitOpen;
  useCursor(isActive);
  // Named like a planet while it orbits; behind an open planet only while pointed at.
  const isLabelShown = !isFlying && !isCockpitOpen && (!isFaded || isActive);

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
      const travelStartsAt = CONFIRM_SECONDS + TURN_SECONDS * TRAVEL_STARTS_INTO_TURN;
      function arrive() {
        flight.planetId = null;
        // Back home unseen: it fades in again behind the open planet.
        opacityRef.current = 0;
        // The flight ends once the page is open, so the camera never turns for home in between.
        void navigate({ to: "/$planetId", params: { planetId: destination.name } }).finally(
          explorer.endFlight,
        );
      }
      gsap
        .timeline()
        .to(flight, { warp: 1, duration: WARP_IN_SECONDS, ease: WARP_IN_EASE }, WARP_STARTS_AT)
        .call(explorer.closeCockpit, undefined, CONFIRM_SECONDS)
        .to(flight, { turn: 1, duration: TURN_SECONDS, ease: TURN_EASE }, CONFIRM_SECONDS)
        .to(flight, { travel: 1, duration: TRAVEL_SECONDS, ease: TRAVEL_EASE }, travelStartsAt)
        .to(flight, { thrust: 1, duration: THRUST_SECONDS, ease: TRAVEL_EASE }, travelStartsAt)
        .call(arrive)
        .set(flight, { thrust: 0 })
        .to(flight, { warp: 0, duration: WARP_OUT_SECONDS, ease: WARP_OUT_EASE });
    },
    { dependencies: [explorer.flight] },
  );

  useFrame(({ camera, size }, delta) => {
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
    sceneState.warp = flight.warp;
    thrustRef.current = flight.thrust;

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
    const position = toPlanePosition({ x: pose.x + bob.x, y: pose.y + bob.y });
    group.position.set(...position);
    if (camera instanceof PerspectiveCamera) {
      const pixelsPerUnit = getPixelsPerUnit({ camera, viewport: size, position });
      scaleRef.current?.scale.setScalar(
        Math.max(SHIP_SCALE, SHIP_MIN_LENGTH_PX / (SHIP_LENGTH * pixelsPerUnit)),
      );
    }
    body.rotation.y = getPlaneYaw(
      pose.heading + Math.sin(time * TILT_SPEED) * TILT_RADIANS * bobLevel,
    );
    const turnRate = delta > 0 ? (pose.heading - (headingRef.current ?? pose.heading)) / delta : 0;
    headingRef.current = pose.heading;
    bankRef.current = damp({
      current: bankRef.current,
      target: getBank(turnRate),
      delta,
      lambda: BANK_LAMBDA,
    });
    body.rotation.z = bankRef.current;

    opacityRef.current = damp({
      current: opacityRef.current,
      // Pointed at, a stepped-back ship comes forward: it opens the cockpit from any page.
      target: isFaded && !isActive ? FADED_OPACITY : 1,
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
    flareRef.current = (glowLevel - GLOW_IDLE) / (GLOW_FLARED - GLOW_IDLE);
    const flicker = Math.sin(time * GLOW_FLICKER_SPEED) * GLOW_FLICKER;
    setMaterialOpacity({ object: glowRef.current, opacity: (glowLevel + flicker) * opacity });
    glowRef.current?.scale.setScalar(
      SHIP_ENGINE.radius * 2 * (1 + (glowLevel - GLOW_IDLE) * GLOW_HOVER_GROWTH),
    );

    puffMeshesRef.current.forEach((mesh, index) => {
      if (!mesh) return;
      const puff = getTrailPuff({ index, time });
      mesh.visible = puff !== null;
      if (!puff) return;
      mesh.position.set(
        ...toPlanePosition({ x: SHIP_ENGINE.x + puff.x, y: SHIP_ENGINE.y + puff.y }),
      );
      mesh.scale.setScalar(puff.scale);
      setMaterialOpacity({ object: mesh, opacity: puff.opacity * opacity });
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
    if (isDragRelease(event.delta)) return;
    explorer.openCockpit();
  }

  return (
    <group ref={handleGroupRef}>
      <group ref={scaleRef}>
        <group ref={bodyRef} rotation-order={BODY_ROTATION_ORDER}>
          <mesh
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onClick={handleClick}
          >
            <sphereGeometry args={[HIT_RADIUS, SPHERE_SEGMENTS, SPHERE_SEGMENTS / 2]} />
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
              <sphereGeometry args={[PUFF_RADIUS, SPHERE_SEGMENTS, SPHERE_SEGMENTS / 2]} />
              <meshBasicMaterial color={PALETTE.clay.soft} transparent depthWrite={false} />
            </mesh>
          ))}
          <sprite ref={glowRef} position={ENGINE_POSITION}>
            <spriteMaterial transparent depthWrite={false}>
              <canvasTexture attach="map" args={[glowCanvas]} />
            </spriteMaterial>
          </sprite>
          <ShipHull flareRef={flareRef} thrustRef={thrustRef} />
        </group>
        {isLabelShown ? (
          // Hangs under the ship as seen: it turns to face the camera.
          <Billboard>
            <Html
              position={[0, -LABEL_DROP, 0]}
              zIndexRange={LABEL_Z_INDEX_RANGE}
              className="pointer-events-none"
            >
              <span className="flex -translate-x-1/2 translate-y-1 flex-col items-center text-center whitespace-nowrap">
                <span
                  data-active={isActive ? "" : undefined}
                  className="text-label tracking-label text-muted transition-colors data-active:text-foreground"
                >
                  {messages.shipName}
                </span>
                {isActive ? (
                  <span role="tooltip" className="text-label-sub text-clay">
                    {messages.shipAction}
                  </span>
                ) : null}
              </span>
            </Html>
          </Billboard>
        ) : null}
      </group>
    </group>
  );
}
