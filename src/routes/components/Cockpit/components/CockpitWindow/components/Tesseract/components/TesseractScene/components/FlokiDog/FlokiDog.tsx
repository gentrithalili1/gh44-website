import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Color, type Group, MathUtils, SRGBColorSpace } from "three";

import { PALETTE, SPACE_COLORS } from "#/utils/palette";

import {
  BODY_PARTS,
  type DogPart,
  EARS,
  EYES,
  HARNESS,
  HARNESS_LIGHTS,
  HEAD_PARTS,
  HEAD_PIVOT,
  NOSE,
  TAIL,
  TONGUE,
} from "./utils/dogParts";

const ROUND = 20;
const QUARTER_TURN = Math.PI / 2;
// Black fur, a shade up from the page so his shape still reads in the dark.
const FUR_LIFT = 0.16;
const NAME = "FLOKI";
const PLATE_PIXELS = { width: 360, height: 110 } as const;
// He breathes, pants and now and then flicks an ear; his head follows the pointer this far
// (radians) and this fast.
const BREATH = { amount: 0.018, speed: 1.6 } as const;
const PANT = { amount: 0.16, speed: 7 } as const;
// At rest his chin is tucked a little, so he looks at the visitor, not over them.
const HEAD_TURN = { across: 0.45, up: 0.22, tuck: 0.2, lambda: 4 } as const;
const EAR_FLICK = { amount: 0.16, every: 4.3 } as const;
const WAG = { speed: 9, lambda: 5 } as const;

function getFurColor() {
  return new Color(SPACE_COLORS.background).lerp(new Color(SPACE_COLORS.rule), FUR_LIFT);
}

// His name in light on the chest plate.
function drawNamePlate() {
  const canvas = document.createElement("canvas");
  canvas.width = PLATE_PIXELS.width;
  canvas.height = PLATE_PIXELS.height;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = SPACE_COLORS.background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = `700 ${canvas.height * 0.62}px "Lilex Variable", ui-monospace, monospace`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.shadowColor = PALETTE.sky.soft;
    context.shadowBlur = 18;
    context.fillStyle = PALETTE.sky.soft;
    context.fillText(NAME, canvas.width / 2, canvas.height / 2 + 4);
  }

  return canvas;
}

interface FurProps {
  part: DogPart;
  color: Color;
}

// One piece of him: a stretched ball or a rounded rod.
function Fur({ part, color }: FurProps) {
  const rotation = part.rotation ? ([...part.rotation] as const) : undefined;

  return (
    <mesh
      position={[...part.position]}
      rotation={rotation ? [rotation[0], rotation[1], rotation[2]] : undefined}
      scale={part.shape === "ball" ? [...part.scale] : undefined}
    >
      {part.shape === "ball" ? (
        <sphereGeometry args={[1, ROUND, ROUND / 2]} />
      ) : (
        <capsuleGeometry args={[part.radius, part.length, 6, ROUND / 2]} />
      )}
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  );
}

interface FlokiDogProps {
  // Something he likes just happened (a book was picked): his tail goes.
  isHappy: boolean;
}

// Floki himself: a black German shepherd sitting upright, ears up, amber eyes, tongue out, in
// his harness with its lights and his name on the chest. He breathes and pants, his head
// follows the pointer, and his tail wags when he is happy. Decorative: no events.
export function FlokiDog({ isHappy }: FlokiDogProps) {
  const [fur] = useState(getFurColor);
  const [plate] = useState(drawNamePlate);
  const chestRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const tongueRef = useRef<Group>(null);
  const tailRef = useRef<Group>(null);
  const earRefs = useRef<(Group | null)[]>([]);
  const wagRef = useRef(0);

  useFrame(({ clock, pointer }, delta) => {
    const time = clock.elapsedTime;
    chestRef.current?.scale.setScalar(1 + Math.sin(time * BREATH.speed) * BREATH.amount);
    if (tongueRef.current) {
      tongueRef.current.scale.y = 1 + Math.sin(time * PANT.speed) * PANT.amount;
    }
    const head = headRef.current;
    if (head) {
      head.rotation.y = MathUtils.damp(
        head.rotation.y,
        pointer.x * HEAD_TURN.across,
        HEAD_TURN.lambda,
        delta,
      );
      head.rotation.x = MathUtils.damp(
        head.rotation.x,
        HEAD_TURN.tuck - pointer.y * HEAD_TURN.up,
        HEAD_TURN.lambda,
        delta,
      );
    }
    // One quick flick, each ear in its own turn.
    earRefs.current.forEach((ear, index) => {
      if (!ear) return;
      const since = (time + index * (EAR_FLICK.every / 2)) % EAR_FLICK.every;
      ear.rotation.x = since < 0.3 ? Math.sin((since / 0.3) * Math.PI) * EAR_FLICK.amount : 0;
    });
    wagRef.current = MathUtils.damp(wagRef.current, isHappy ? 1 : 0.15, WAG.lambda, delta);
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(time * WAG.speed) * TAIL.swing * wagRef.current;
    }
  });

  return (
    <group>
      <group ref={chestRef}>
        {BODY_PARTS.map((part) => (
          <Fur key={part.id} part={part} color={fur} />
        ))}

        <mesh position={[...HARNESS.collar.position]} rotation-x={HARNESS.collar.lean}>
          <torusGeometry args={[HARNESS.collar.radius, HARNESS.collar.tube, 8, ROUND * 2]} />
          <meshStandardMaterial color={SPACE_COLORS.rule} roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[...HARNESS.strap.position]} scale={[1, HARNESS.strap.stretch, 1]}>
          <torusGeometry args={[HARNESS.strap.radius, HARNESS.strap.tube, 8, ROUND * 2]} />
          <meshStandardMaterial color={SPACE_COLORS.rule} roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[...HARNESS.chestPlate.position]} rotation-x={HARNESS.chestPlate.lean}>
          <boxGeometry args={[...HARNESS.chestPlate.size]} />
          <meshStandardMaterial color={SPACE_COLORS.rule} roughness={0.7} metalness={0.1} />
        </mesh>
        <mesh position={[...HARNESS.backPlate.position]} rotation-x={HARNESS.backPlate.lean}>
          <boxGeometry args={[...HARNESS.backPlate.size]} />
          <meshStandardMaterial color={SPACE_COLORS.rule} roughness={0.7} metalness={0.1} />
        </mesh>
        <mesh position={[...HARNESS.namePlate.position]} rotation-x={HARNESS.namePlate.lean}>
          <planeGeometry args={[...HARNESS.namePlate.size]} />
          <meshBasicMaterial>
            <canvasTexture attach="map" args={[plate]} colorSpace={SRGBColorSpace} />
          </meshBasicMaterial>
        </mesh>
        {HARNESS_LIGHTS.map((light) => (
          <mesh key={light.id} position={[...light.position]}>
            <boxGeometry args={[0.045, 0.09, 0.03]} />
            <meshBasicMaterial color={PALETTE.sky.soft} />
          </mesh>
        ))}
      </group>

      <group ref={tailRef} position={[...TAIL.base]}>
        <mesh position={[TAIL.length / 2, 0, -TAIL.length / 4]} rotation={[0, 0.5, QUARTER_TURN]}>
          <capsuleGeometry args={[TAIL.radius, TAIL.length, 6, ROUND / 2]} />
          <meshStandardMaterial color={fur} roughness={0.95} />
        </mesh>
      </group>

      <group ref={headRef} position={[...HEAD_PIVOT]}>
        {HEAD_PARTS.map((part) => (
          <Fur key={part.id} part={part} color={fur} />
        ))}
        <mesh position={[...NOSE.position]}>
          <sphereGeometry args={[NOSE.radius, ROUND, ROUND / 2]} />
          <meshStandardMaterial color={SPACE_COLORS.background} roughness={0.35} />
        </mesh>
        <group ref={tongueRef} position={[...TONGUE.position]} rotation-x={TONGUE.lean}>
          <mesh scale={[1, 1, 0.4]} position-y={-TONGUE.length / 2}>
            <capsuleGeometry args={[TONGUE.radius, TONGUE.length, 6, ROUND / 2]} />
            <meshStandardMaterial color={PALETTE.rose.soft} roughness={0.6} />
          </mesh>
        </group>
        {EYES.map((eye) => (
          <mesh key={eye.id} position={[...eye.position]}>
            <sphereGeometry args={[eye.radius, ROUND, ROUND / 2]} />
            <meshStandardMaterial
              color={PALETTE.ochre.soft}
              emissive={PALETTE.ochre.soft}
              emissiveIntensity={0.9}
              roughness={0.3}
            />
          </mesh>
        ))}
        {EARS.map((ear, index) => (
          <group
            key={ear.id}
            ref={(group) => {
              earRefs.current[index] = group;
            }}
            position={[...ear.position]}
            rotation-z={ear.lean}
          >
            <mesh position-y={ear.height / 2} scale={[1, 1, 0.5]} rotation-y={Math.PI / 4}>
              <coneGeometry args={[ear.radius, ear.height, 4]} />
              <meshStandardMaterial color={fur} roughness={0.95} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
