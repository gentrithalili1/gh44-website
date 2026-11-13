import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { type RefObject, useRef, useState } from "react";
import {
  Color,
  LinearFilter,
  LinearSRGBColorSpace,
  type Mesh,
  RepeatWrapping,
  type ShaderMaterial,
} from "three";

import { getSpinPeriod } from "#/components/SolarSystem/utils/motion";
import { getSurfaceHex } from "#/components/SolarSystem/utils/surfaceColor";
import { PALETTE, SPACE_COLORS } from "#/utils/palette";
import type { PlanetBody } from "#/utils/planets";

import type { SceneState } from "../../../../types";
import { damp } from "../../../../utils/sceneMath";
import { RING_NORMAL } from "../../utils/ringPlane";
import { Atmosphere } from "./components/Atmosphere";
import { getSurfaceLook } from "./utils/surfaceLook";
import { getSurfacePaint, type SurfacePaint } from "./utils/surfacePaint";
import { SURFACE_FRAGMENT_SHADER, SURFACE_VERTEX_SHADER } from "./utils/surfaceShaders";

// The map wrapped around a planet, in pixels: twice as wide as tall, like any globe's.
const MAP_WIDTH = 1024;
const MAP_HEIGHT = 512;
const SPHERE_SEGMENTS = 48;
const FULL_TURN = Math.PI * 2;
// The air around a planet is its own color, this far toward white.
const AIR_LIGHTEN = 0.35;
// How far an open planet's light swings from the sun toward the visitor (0 to 1).
const OPEN_FILL = 0.55;
const FILL_LAMBDA = 2;
// Each planet's noise starts somewhere else, so no two surfaces match.
const SEED_SCALE = 10;

function getShaderColor(hex: string) {
  return new Color().setStyle(hex, LinearSRGBColorSpace);
}

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
  // The open planet shows more of its lit side.
  isOpen: boolean;
  // Where the planet's rings lie, from its center: they shade the globe.
  ringSpan?: { innerRadius: number; outerRadius: number };
  sceneStateRef: RefObject<SceneState>;
  onPointerOver?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: () => void;
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
}

export function PlanetSurface({
  planet,
  isOpen,
  ringSpan,
  sceneStateRef,
  onPointerOver,
  onPointerOut,
  onClick,
}: PlanetSurfaceProps) {
  const [map] = useState(() => drawSurfaceMap(planet));
  const look = getSurfaceLook(planet.realPlanet);
  const [airColor] = useState(() =>
    getShaderColor(PALETTE[planet.color].soft).lerp(
      getShaderColor(PALETTE.neutral.soft),
      AIR_LIGHTEN,
    ),
  );
  // Passed through the constructor, so the material keeps this uniforms object.
  const [material] = useState(() => ({
    vertexShader: SURFACE_VERTEX_SHADER,
    fragmentShader: SURFACE_FRAGMENT_SHADER,
    uniforms: {
      uMap: { value: null },
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uSeed: { value: planet.orbit.phase * SEED_SCALE },
      uWarp: { value: look.warp },
      uGrain: { value: [...look.grain] },
      uDrift: { value: look.drift },
      uMottle: { value: look.mottle },
      uRelief: { value: look.relief },
      uBands: { value: look.bands },
      uClouds: { value: look.clouds },
      uCaps: { value: look.caps },
      uGlint: { value: look.glint },
      uNightLights: { value: look.nightLights },
      uAir: { value: look.air },
      uFill: { value: 0 },
      uBase: { value: getShaderColor(PALETTE[planet.color].soft) },
      uAirColor: { value: airColor },
      uCloudColor: { value: getShaderColor(SPACE_COLORS.foreground) },
      uSunColor: { value: getShaderColor(PALETTE.ochre.soft) },
      uRingNormal: { value: [...RING_NORMAL] },
      uRingSpan: { value: [ringSpan?.innerRadius ?? 0, ringSpan?.outerRadius ?? 0] },
    },
  }));
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const spinTimeRef = useRef(0);

  useFrame((_, delta) => {
    spinTimeRef.current += sceneStateRef.current.frameStep;
    material.uniforms.uTime.value = spinTimeRef.current;
    material.uniforms.uFill.value = damp({
      current: material.uniforms.uFill.value,
      target: isOpen ? OPEN_FILL : 0,
      delta,
      lambda: FILL_LAMBDA,
    });
    // The planet's fade sets the material's opacity; the shader reads it here.
    if (materialRef.current) material.uniforms.uOpacity.value = materialRef.current.opacity;
    if (meshRef.current) {
      meshRef.current.rotation.y = (FULL_TURN * spinTimeRef.current) / getSpinPeriod(planet);
    }
  });

  return (
    <>
      <mesh
        ref={meshRef}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={onClick}
      >
        <sphereGeometry args={[planet.size, SPHERE_SEGMENTS, SPHERE_SEGMENTS / 2]} />
        <shaderMaterial ref={materialRef} args={[material]} transparent>
          {/* No mipmaps: the shader picks its own spot on the map, and they would draw a seam. */}
          <canvasTexture
            attach="uniforms-uMap-value"
            args={[map]}
            wrapS={RepeatWrapping}
            minFilter={LinearFilter}
            generateMipmaps={false}
          />
        </shaderMaterial>
      </mesh>
      {look.air > 0 ? (
        <Atmosphere radius={planet.size} color={airColor} strength={look.air} />
      ) : null}
    </>
  );
}
