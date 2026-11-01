import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { type RefObject, useRef, useState } from "react";
import { type Mesh, SRGBColorSpace } from "three";

import { getSpinPeriod } from "#/components/SolarSystem/utils/motion";
import { getSurfaceHex } from "#/components/SolarSystem/utils/surfaceColor";
import { PALETTE } from "#/utils/palette";
import type { PlanetBody } from "#/utils/planets";

import type { SceneState } from "../../../../types";
import { getSurfacePaint, type SurfacePaint } from "./utils/surfacePaint";

// The map wrapped around a planet, in pixels: twice as wide as tall, like any globe's.
const MAP_WIDTH = 512;
const MAP_HEIGHT = 256;
const SPHERE_SEGMENTS = 48;
const FULL_TURN = Math.PI * 2;

function paintSurface({
  context,
  paint,
}: {
  context: CanvasRenderingContext2D;
  paint: SurfacePaint;
}) {
  context.globalAlpha = paint.opacity;
  context.fillStyle = getSurfaceHex(paint);
  switch (paint.kind) {
    case "stripe":
      context.fillRect(
        0,
        paint.top * MAP_HEIGHT,
        MAP_WIDTH,
        (paint.bottom - paint.top) * MAP_HEIGHT,
      );
      return;
    case "spot":
      context.beginPath();
      context.ellipse(
        paint.u * MAP_WIDTH,
        paint.v * MAP_HEIGHT,
        paint.radiusU * MAP_WIDTH,
        paint.radiusV * MAP_HEIGHT,
        0,
        0,
        FULL_TURN,
      );
      context.fill();
      return;
    default: {
      const unknownPaint: never = paint;
      return unknownPaint;
    }
  }
}

// The planet's color, with its bands and features painted on.
function drawSurfaceMap(planet: PlanetBody) {
  const canvas = document.createElement("canvas");
  canvas.width = MAP_WIDTH;
  canvas.height = MAP_HEIGHT;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = PALETTE[planet.color].soft;
    context.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    for (const paint of getSurfacePaint(planet)) paintSurface({ context, paint });
  }

  return canvas;
}

interface PlanetSurfaceProps {
  planet: PlanetBody;
  sceneStateRef: RefObject<SceneState>;
  onPointerOver?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: () => void;
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
}

// The planet's globe, its surface painted on, turning on its own axis at its own pace.
export function PlanetSurface({
  planet,
  sceneStateRef,
  onPointerOver,
  onPointerOut,
  onClick,
}: PlanetSurfaceProps) {
  const [map] = useState(() => drawSurfaceMap(planet));
  const meshRef = useRef<Mesh>(null);
  // Seconds of spin. It runs on the scene clock alone: hovering or opening the planet stops its
  // orbit, not its turning.
  const spinTimeRef = useRef(0);

  useFrame(() => {
    spinTimeRef.current += sceneStateRef.current.frameStep;
    if (meshRef.current) {
      meshRef.current.rotation.y = (FULL_TURN * spinTimeRef.current) / getSpinPeriod(planet);
    }
  });

  return (
    <mesh ref={meshRef} onPointerOver={onPointerOver} onPointerOut={onPointerOut} onClick={onClick}>
      <sphereGeometry args={[planet.size, SPHERE_SEGMENTS, SPHERE_SEGMENTS / 2]} />
      <meshLambertMaterial>
        <canvasTexture attach="map" args={[map]} colorSpace={SRGBColorSpace} />
      </meshLambertMaterial>
    </mesh>
  );
}
