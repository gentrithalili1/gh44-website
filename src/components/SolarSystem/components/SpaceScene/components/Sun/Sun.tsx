import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { Group, Mesh } from "three";

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
const CIRCLE_SEGMENTS = 64;

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

// gh44: everything revolves around it. Decorative: no label, no events.
export function Sun({ isPlanetOpen }: SunProps) {
  const [glowCanvas] = useState(drawGlow);
  const groupRef = useRef<Group>(null);
  const glowRef = useRef<Mesh>(null);
  const opacityRef = useRef(1);

  useFrame(({ clock }, delta) => {
    const pulse = 1 + (Math.sin(clock.elapsedTime * PULSE_SPEED) * PULSE_AMOUNT) / SUN_GLOW_RADIUS;
    glowRef.current?.scale.setScalar(pulse);
    opacityRef.current = damp({
      current: opacityRef.current,
      target: isPlanetOpen ? FADED_OPACITY : 1,
      delta,
    });
    if (groupRef.current) setGroupOpacity({ group: groupRef.current, opacity: opacityRef.current });
  });

  return (
    <group ref={groupRef}>
      <mesh ref={glowRef} position={[0, 0, -2]}>
        <circleGeometry args={[SUN_GLOW_RADIUS, CIRCLE_SEGMENTS]} />
        <meshBasicMaterial transparent depthWrite={false} userData={{ baseOpacity: GLOW_OPACITY }}>
          <canvasTexture attach="map" args={[glowCanvas]} />
        </meshBasicMaterial>
      </mesh>
      <mesh position={[0, 0, -1]}>
        <circleGeometry args={[SUN_RADIUS, CIRCLE_SEGMENTS]} />
        <meshBasicMaterial color={SUN_COLOR} />
      </mesh>
    </group>
  );
}
