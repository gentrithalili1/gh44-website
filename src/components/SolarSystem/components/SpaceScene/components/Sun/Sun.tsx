import { Billboard } from "@react-three/drei";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Color, type Group, LinearSRGBColorSpace, type ShaderMaterial } from "three";

import { SUN_GLOW_RADIUS, SUN_RADIUS } from "#/components/SolarSystem/utils/space";
import { PALETTE } from "#/utils/palette";

import { messages } from "#/components/SolarSystem/messages";

import { setGroupOpacity } from "../../utils/groupOpacity";
import { damp, FADED_OPACITY, isDragRelease } from "../../utils/sceneMath";
import { HoverName } from "../HoverName";
import { addPoke, getFlareLevel } from "./utils/sunPokes";
import {
  CORONA_FRAGMENT_SHADER,
  CORONA_VERTEX_SHADER,
  SUN_FRAGMENT_SHADER,
  SUN_VERTEX_SHADER,
} from "./utils/sunShaders";

const SUN_COLOR = PALETTE.ochre.soft;
// Its cooler cells and its edge.
const SUN_COOL_COLOR = PALETTE.clay.soft;
// Its hottest cells: its own color, this far toward white.
const HOT_LIGHTEN = 0.6;
// The corona reaches this many times further than the old flat glow, thinning out on the way.
const CORONA_SCALE = 1.7;
const CORONA_RADIUS = SUN_GLOW_RADIUS * CORONA_SCALE;
const GLOW_OPACITY = 0.42;
// The glow breathes by this many system units, about every 5 seconds.
const PULSE_AMOUNT = 8;
const PULSE_SPEED = 1.2;
const SPHERE_SEGMENTS = 64;
// The sun turns once in this many seconds.
const SPIN_PERIOD = 240;
// The sun lights every planet from its center, as strongly near as far. Lambert surfaces reflect
// a 1/pi share of it: with the ambient light, the side facing the sun shows its palette color.
const LIGHT_INTENSITY = Math.PI * 0.85;
// A flare swells the glow by this share and brightens it, up to full.
const FLARE_GROWTH = 0.45;
const SCOLD_POSITION: [number, number, number] = [0, SUN_RADIUS, 0];

// A palette color with its sRGB channels as written: the shaders output them as they are.
function getShaderColor(hex: string) {
  return new Color().setStyle(hex, LinearSRGBColorSpace);
}

interface SunProps {
  isPlanetOpen: boolean;
}

// gh44: everything revolves around it, and it lights the planets. Its surface boils and its
// corona reaches out in slow streamers. Decorative, with no label; poked five times quickly it
// flares, and Floki objects (an easter egg).
export function Sun({ isPlanetOpen }: SunProps) {
  // Passed through the constructor, so each material keeps its uniforms object.
  const [surface] = useState(() => ({
    vertexShader: SUN_VERTEX_SHADER,
    fragmentShader: SUN_FRAGMENT_SHADER,
    uniforms: {
      uColor: { value: getShaderColor(SUN_COLOR) },
      uCoolColor: { value: getShaderColor(SUN_COOL_COLOR) },
      uHotColor: {
        value: getShaderColor(SUN_COLOR).lerp(getShaderColor(PALETTE.neutral.soft), HOT_LIGHTEN),
      },
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uFlare: { value: 0 },
    },
  }));
  const [corona] = useState(() => ({
    vertexShader: CORONA_VERTEX_SHADER,
    fragmentShader: CORONA_FRAGMENT_SHADER,
    uniforms: {
      uColor: { value: getShaderColor(SUN_COLOR) },
      uTime: { value: 0 },
      uOpacity: { value: GLOW_OPACITY },
      uSunShare: { value: SUN_RADIUS / CORONA_RADIUS },
    },
  }));
  const groupRef = useRef<Group>(null);
  const globeRef = useRef<Group>(null);
  const glowRef = useRef<Group>(null);
  const surfaceRef = useRef<ShaderMaterial>(null);
  const coronaRef = useRef<ShaderMaterial>(null);
  const opacityRef = useRef(1);
  // The recent pokes and when the last flare went off, in seconds of the scene's clock.
  const pokesRef = useRef<readonly number[]>([]);
  const flaredAtRef = useRef<number | null>(null);
  const nowRef = useRef(0);
  const [isScolded, setIsScolded] = useState(false);

  useFrame(({ clock }, delta) => {
    nowRef.current = clock.elapsedTime;
    const flare = getFlareLevel({ flaredAt: flaredAtRef.current, now: clock.elapsedTime });
    if (flare === 0 && flaredAtRef.current !== null) {
      flaredAtRef.current = null;
      setIsScolded(false);
    }
    surface.uniforms.uFlare.value = flare;
    const pulse = 1 + (Math.sin(clock.elapsedTime * PULSE_SPEED) * PULSE_AMOUNT) / SUN_GLOW_RADIUS;
    glowRef.current?.scale.setScalar(pulse * (1 + flare * FLARE_GROWTH));
    if (globeRef.current) {
      globeRef.current.rotation.y = (Math.PI * 2 * clock.elapsedTime) / SPIN_PERIOD;
    }
    opacityRef.current = damp({
      current: opacityRef.current,
      target: isPlanetOpen ? FADED_OPACITY : 1,
      delta,
    });
    if (groupRef.current) setGroupOpacity({ group: groupRef.current, opacity: opacityRef.current });
    surface.uniforms.uTime.value = clock.elapsedTime;
    corona.uniforms.uTime.value = clock.elapsedTime;
    // The fade sets each material's opacity; the shaders read it here.
    if (surfaceRef.current) surface.uniforms.uOpacity.value = surfaceRef.current.opacity;
    if (coronaRef.current) {
      const { opacity } = coronaRef.current;
      corona.uniforms.uOpacity.value = opacity + (1 - GLOW_OPACITY) * flare * opacityRef.current;
    }
  });

  function handleClick(event: ThreeEvent<MouseEvent>) {
    if (isDragRelease(event.delta)) return;
    event.stopPropagation();
    const result = addPoke({ pokes: pokesRef.current, now: nowRef.current });
    pokesRef.current = result.pokes;
    if (!result.isFlare) return;
    flaredAtRef.current = nowRef.current;
    setIsScolded(true);
  }

  return (
    <group ref={groupRef}>
      <Billboard>
        <group ref={glowRef}>
          <mesh>
            <planeGeometry args={[CORONA_RADIUS * 2, CORONA_RADIUS * 2]} />
            <shaderMaterial
              ref={coronaRef}
              args={[corona]}
              transparent
              depthWrite={false}
              userData={{ baseOpacity: GLOW_OPACITY }}
            />
          </mesh>
        </group>
      </Billboard>
      <group ref={globeRef}>
        {/* With a planet open, a click on the sun still goes back home. */}
        <mesh onClick={isPlanetOpen ? undefined : handleClick}>
          <sphereGeometry args={[SUN_RADIUS, SPHERE_SEGMENTS, SPHERE_SEGMENTS / 2]} />
          <shaderMaterial ref={surfaceRef} args={[surface]} transparent />
        </mesh>
      </group>
      {isScolded ? <HoverName name={messages.sunScold} position={SCOLD_POSITION} /> : null}
      <pointLight intensity={LIGHT_INTENSITY} decay={0} />
    </group>
  );
}
