import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { Group, Sprite } from "three";

import { SUN_GLOW_RADIUS, SUN_RADIUS } from "#/components/SolarSystem/utils/space";
import { PALETTE } from "#/utils/palette";

import { setGroupOpacity } from "../../utils/groupOpacity";
import { damp, FADED_OPACITY } from "../../utils/sceneMath";

const SUN_COLOR = PALETTE.ochre.soft;
const GLOW_TEXTURE_SIZE = 256;
const GLOW_OPACITY = 0.35;
// The glow breathes by this many system units, about every 5 seconds.
const PULSE_AMOUNT = 8;
const PULSE_SPEED = 1.2;
const SPHERE_SEGMENTS = 64;
// The sun lights every planet from its center, as strongly near as far.
const LIGHT_INTENSITY = 2.6;

// A radial fade from the sun's color to transparent, like the static system's gradient.
function drawGlow() {
  const canvas = document.createElement("canvas");
  canvas.width = GLOW_TEXTURE_SIZE;
  canvas.height = GLOW_TEXTURE_SIZE;
  const context = canvas.getContext("2d");
  if (context) {
    const center = GLOW_TEXTURE_SIZE / 2;
    const gradient = context.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, SUN_COLOR);
    gradient.addColorStop(1, "transparent");
    context.fillStyle = gradient;
    context.fillRect(0, 0, GLOW_TEXTURE_SIZE, GLOW_TEXTURE_SIZE);
  }

  return canvas;
}

interface SunProps {
  isPlanetOpen: boolean;
}

// gh44: everything revolves around it, and it lights the planets. Decorative: no label, no
// events.
export function Sun({ isPlanetOpen }: SunProps) {
  const [glowCanvas] = useState(drawGlow);
  const groupRef = useRef<Group>(null);
  const glowRef = useRef<Sprite>(null);
  const opacityRef = useRef(1);

  useFrame(({ clock }, delta) => {
    const pulse = 1 + (Math.sin(clock.elapsedTime * PULSE_SPEED) * PULSE_AMOUNT) / SUN_GLOW_RADIUS;
    glowRef.current?.scale.setScalar(SUN_GLOW_RADIUS * 2 * pulse);
    opacityRef.current = damp({
      current: opacityRef.current,
      target: isPlanetOpen ? FADED_OPACITY : 1,
      delta,
    });
    if (groupRef.current) setGroupOpacity({ group: groupRef.current, opacity: opacityRef.current });
  });

  return (
    <group ref={groupRef}>
      <sprite ref={glowRef}>
        <spriteMaterial transparent depthWrite={false} userData={{ baseOpacity: GLOW_OPACITY }}>
          <canvasTexture attach="map" args={[glowCanvas]} />
        </spriteMaterial>
      </sprite>
      <mesh>
        <sphereGeometry args={[SUN_RADIUS, SPHERE_SEGMENTS, SPHERE_SEGMENTS / 2]} />
        <meshBasicMaterial color={SUN_COLOR} />
      </mesh>
      <pointLight intensity={LIGHT_INTENSITY} decay={0} />
    </group>
  );
}
