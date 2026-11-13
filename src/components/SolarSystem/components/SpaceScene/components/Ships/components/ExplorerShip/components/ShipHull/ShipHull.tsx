import { useFrame } from "@react-three/fiber";
import { type RefObject, useRef, useState } from "react";
import {
  Color,
  DoubleSide,
  LinearSRGBColorSpace,
  type Mesh,
  type MeshBasicMaterial,
  type ShaderMaterial,
  Shape,
  Vector2,
} from "three";

import type { Point } from "#/components/SolarSystem/types";
import { PALETTE } from "#/utils/palette";

import {
  CANOPY,
  FIN_OUTLINE,
  FIN_THICKNESS,
  FUSELAGE_FLATTEN,
  FUSELAGE_PROFILE,
  getPlumeLength,
  mirrorOutline,
  NOZZLE,
  WING_OUTLINE,
  WING_THICKNESS,
  WINGTIP,
} from "../../utils/shipModel";
import {
  HULL_FRAGMENT_SHADER,
  HULL_VERTEX_SHADER,
  PLUME_FRAGMENT_SHADER,
  PLUME_VERTEX_SHADER,
} from "../../utils/shipShaders";

const QUARTER_TURN = Math.PI / 2;
const FUSELAGE_SEGMENTS = 20;
const ROUND_SEGMENTS = 16;
const BEVEL = { bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 1 };
// The glass catches the sun; the painted hull barely does.
const HULL_GLINT = 0.12;
const GLASS_GLINT = 0.9;
// The wingtip lights blink, out of step with each other.
const BLINK_SPEED = 2.6;
const BLINK_OFFSET = 1.9;
const BLINK_DIM = 0.25;

function toShape(points: readonly Point[]) {
  return new Shape(points.map((point) => new Vector2(point.x, point.y)));
}

function createGeometry() {
  return {
    fuselage: FUSELAGE_PROFILE.map((point) => new Vector2(point.x, point.y)),
    wings: [toShape(WING_OUTLINE), toShape(mirrorOutline(WING_OUTLINE))],
    fin: toShape(FIN_OUTLINE),
  };
}

// sRGB as written: the ship's shaders output it as it is.
function toShaderColor(hex: string) {
  return new Color().setStyle(hex, LinearSRGBColorSpace);
}

function createHullMaterial({ color, glint }: { color: string; glint: number }) {
  return {
    vertexShader: HULL_VERTEX_SHADER,
    fragmentShader: HULL_FRAGMENT_SHADER,
    uniforms: {
      uColor: { value: toShaderColor(color) },
      uGlint: { value: glint },
      uOpacity: { value: 1 },
    },
  };
}

function createMaterials() {
  return {
    hull: createHullMaterial({ color: PALETTE.neutral.soft, glint: HULL_GLINT }),
    trim: createHullMaterial({ color: PALETTE.clay.vivid, glint: HULL_GLINT }),
    nozzle: createHullMaterial({ color: PALETTE.neutral.vivid, glint: 0 }),
    glass: createHullMaterial({ color: PALETTE.sky.vivid, glint: GLASS_GLINT }),
    plume: {
      vertexShader: PLUME_VERTEX_SHADER,
      fragmentShader: PLUME_FRAGMENT_SHADER,
      uniforms: {
        uColor: { value: toShaderColor(PALETTE.clay.vivid) },
        uHotColor: { value: toShaderColor(PALETTE.ochre.soft) },
        uTime: { value: 0 },
        uOpacity: { value: 1 },
      },
    },
  };
}

function getBlink(time: number) {
  return Math.sin(time * BLINK_SPEED) > 0 ? 1 : BLINK_DIM;
}

interface ShipHullProps {
  // 0 idle to 1 flared, and 0 to 1 of launch thrust: the frame loop of the ship writes them.
  flareRef: RefObject<number>;
  thrustRef: RefObject<number>;
}

export function ShipHull({ flareRef, thrustRef }: ShipHullProps) {
  const [geometry] = useState(createGeometry);
  const [materials] = useState(createMaterials);
  const litMaterialsRef = useRef<(ShaderMaterial | null)[]>([]);
  const plumeRef = useRef<Mesh>(null);
  const portLightRef = useRef<MeshBasicMaterial>(null);
  const starboardLightRef = useRef<MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    // The ship's fade sets every material's opacity; the shaders read it here.
    const [first] = litMaterialsRef.current;
    const opacity = first?.opacity ?? 1;
    for (const key of ["hull", "trim", "nozzle", "glass", "plume"] as const) {
      materials[key].uniforms.uOpacity.value = opacity;
    }
    materials.plume.uniforms.uTime.value = clock.elapsedTime;

    const plume = plumeRef.current;
    if (plume) {
      const length = getPlumeLength({ flare: flareRef.current, thrust: thrustRef.current });
      plume.scale.set(1, length, 1);
      plume.position.z = NOZZLE.z + length / 2;
    }
    // Set after the group fade, which would otherwise flatten the blink.
    if (portLightRef.current) {
      portLightRef.current.opacity = opacity * getBlink(clock.elapsedTime);
    }
    if (starboardLightRef.current) {
      starboardLightRef.current.opacity = opacity * getBlink(clock.elapsedTime + BLINK_OFFSET);
    }
  });

  function keepLit(index: number) {
    return (material: ShaderMaterial | null) => {
      litMaterialsRef.current[index] = material;
    };
  }

  return (
    <group>
      <mesh rotation-x={QUARTER_TURN} scale={[1, 1, FUSELAGE_FLATTEN]}>
        <latheGeometry args={[geometry.fuselage, FUSELAGE_SEGMENTS]} />
        <shaderMaterial ref={keepLit(0)} args={[materials.hull]} side={DoubleSide} />
      </mesh>
      <mesh rotation-x={QUARTER_TURN} position-y={WING_THICKNESS / 2}>
        <extrudeGeometry args={[geometry.wings, { depth: WING_THICKNESS, ...BEVEL }]} />
        <shaderMaterial ref={keepLit(1)} args={[materials.hull]} />
      </mesh>
      <mesh rotation-y={-QUARTER_TURN} position-x={FIN_THICKNESS / 2}>
        <extrudeGeometry args={[geometry.fin, { depth: FIN_THICKNESS, ...BEVEL }]} />
        <shaderMaterial ref={keepLit(2)} args={[materials.trim]} />
      </mesh>
      <mesh position={[0, CANOPY.y, CANOPY.z]} scale={[CANOPY.width, CANOPY.height, CANOPY.length]}>
        <sphereGeometry args={[1, ROUND_SEGMENTS, ROUND_SEGMENTS / 2]} />
        <shaderMaterial ref={keepLit(3)} args={[materials.glass]} />
      </mesh>
      <mesh rotation-x={QUARTER_TURN} position-z={NOZZLE.z}>
        <cylinderGeometry
          args={[NOZZLE.radius, NOZZLE.radius * 0.8, NOZZLE.length, ROUND_SEGMENTS, 1, true]}
        />
        <shaderMaterial ref={keepLit(4)} args={[materials.nozzle]} side={DoubleSide} />
      </mesh>
      <mesh ref={plumeRef} rotation-x={QUARTER_TURN}>
        <coneGeometry args={[NOZZLE.radius * 0.9, 1, ROUND_SEGMENTS, 1, true]} />
        <shaderMaterial args={[materials.plume]} side={DoubleSide} transparent depthWrite={false} />
      </mesh>
      <mesh position={[-WINGTIP.x, WINGTIP.y, WINGTIP.z]}>
        <sphereGeometry args={[WINGTIP.radius, ROUND_SEGMENTS / 2, ROUND_SEGMENTS / 4]} />
        <meshBasicMaterial ref={portLightRef} color={PALETTE.clay.vivid} transparent />
      </mesh>
      <mesh position={[WINGTIP.x, WINGTIP.y, WINGTIP.z]}>
        <sphereGeometry args={[WINGTIP.radius, ROUND_SEGMENTS / 2, ROUND_SEGMENTS / 4]} />
        <meshBasicMaterial ref={starboardLightRef} color={PALETTE.sage.vivid} transparent />
      </mesh>
    </group>
  );
}
