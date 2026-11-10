import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Color, type Group, LinearSRGBColorSpace, MathUtils, SRGBColorSpace } from "three";

import { PALETTE, SPACE_COLORS } from "#/utils/palette";

import type { FlokiStatus } from "../../hooks/useFloki";
import {
  BODY_PARTS,
  type DogPart,
  EARS,
  EYES,
  HARNESS,
  HARNESS_LIGHTS,
  HARNESS_STRAPS,
  HEAD_PARTS,
  HEAD_PIVOT,
  JAW,
  NOSE,
  TAIL,
  TONGUE,
} from "./utils/dogParts";
import { FUR_FRAGMENT_SHADER, FUR_VERTEX_SHADER } from "./utils/furShaders";

const ROUND = 24;
const QUARTER_TURN = Math.PI / 2;
// Black fur, a shade up from black so the strands still show.
const FUR_LIFT = 0.18;
const NAME = "FLOKI";
const PLATE_PIXELS = { width: 360, height: 110 } as const;
// He breathes, pants and now and then flicks an ear; his head follows the pointer this far
// (radians) and this fast. At rest his chin is tucked a little, so he looks at the visitor.
const BREATH = { amount: 0.018, speed: 1.6 } as const;
const PANT = { amount: 0.14, speed: 7 } as const;
const HEAD_TURN = { across: 0.45, up: 0.22, tuck: 0.2, lambda: 4 } as const;
const EAR_FLICK = { amount: 0.16, every: 4.3 } as const;
const WAG = { speed: 9, lambda: 5 } as const;
const PERK = { seconds: 0.7, tall: 0.22, wide: 0.06 } as const;
const JAW_LAMBDA = 14;
// The harness lights breathe while he thinks, and stay bright while he listens and speaks.
const LIGHT_LEVELS: Record<FlokiStatus, number> = {
  idle: 0.75,
  listening: 1,
  thinking: 0.55,
  speaking: 1,
};
const LIGHT_PULSE = { amount: 0.35, speed: 5 } as const;

// sRGB as written: the fur shader outputs it as it is.
function toShaderColor(hex: string) {
  return new Color().setStyle(hex, LinearSRGBColorSpace);
}

function createFur() {
  return {
    vertexShader: FUR_VERTEX_SHADER,
    fragmentShader: FUR_FRAGMENT_SHADER,
    uniforms: {
      uFur: {
        value: toShaderColor(SPACE_COLORS.background).lerp(
          toShaderColor(SPACE_COLORS.rule),
          FUR_LIFT,
        ),
      },
      uKey: { value: toShaderColor(PALETTE.ochre.soft) },
      uRim: { value: toShaderColor(PALETTE.sky.soft) },
    },
  };
}

type Fur = ReturnType<typeof createFur>;

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

interface FurPartProps {
  part: DogPart;
  fur: Fur;
}

// One piece of him: a stretched ball, a rounded rod, or a rod that narrows.
function FurPart({ part, fur }: FurPartProps) {
  const [x, y, z] = part.rotation ?? [0, 0, 0];

  return (
    <mesh
      position={[...part.position]}
      rotation={[x, y, z]}
      scale={part.shape === "ball" ? [...part.scale] : undefined}
    >
      {part.shape === "ball" ? <sphereGeometry args={[1, ROUND, ROUND / 2]} /> : null}
      {part.shape === "rod" ? (
        <capsuleGeometry args={[part.radius, part.length, 6, ROUND / 2]} />
      ) : null}
      {part.shape === "taper" ? (
        // Built along y, its near end at the bottom: the wide end.
        <cylinderGeometry args={[part.endRadius, part.radius, part.length, ROUND / 2]} />
      ) : null}
      <shaderMaterial args={[fur]} />
    </mesh>
  );
}

interface FlokiDogProps {
  // What he is doing: his tail goes while he listens and speaks, and his lights follow.
  status: FlokiStatus;
  // How loud the mic or his voice is right now, 0 to 1: his jaw moves with it.
  getLevel?: () => number;
  // Called a good boy this many times: each one perks his ears up.
  praiseCount?: number;
}

// Floki himself: a black German shepherd sitting upright, ears up, amber eyes, tongue out, in
// his harness with its lights and his name on the chest. He breathes and pants, his head
// follows the pointer, his jaw moves with his voice, and his tail wags while he listens and
// speaks. Decorative: no events.
export function FlokiDog({ status, getLevel, praiseCount = 0 }: FlokiDogProps) {
  const [fur] = useState(createFur);
  const [plate] = useState(drawNamePlate);
  const chestRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const jawRef = useRef<Group>(null);
  const tongueRef = useRef<Group>(null);
  const tailRef = useRef<Group>(null);
  const lightsRef = useRef<Group>(null);
  const earRefs = useRef<(Group | null)[]>([]);
  const wagRef = useRef(0);
  // The praise last seen, and when his ears last perked up.
  const praiseRef = useRef(praiseCount);
  const perkedAtRef = useRef(-Infinity);

  const isLive = status === "listening" || status === "speaking";

  useFrame(({ clock, pointer }, delta) => {
    const time = clock.elapsedTime;
    chestRef.current?.scale.setScalar(1 + Math.sin(time * BREATH.speed) * BREATH.amount);
    // Speaking, his jaw follows his voice; otherwise he pants.
    const level = status === "speaking" ? (getLevel?.() ?? 0.4) : 0;
    const pant = Math.sin(time * PANT.speed) * PANT.amount;
    const jaw = jawRef.current;
    if (jaw) {
      const target = JAW.rest + (status === "speaking" ? level * JAW.open : pant * 0.25);
      jaw.rotation.x = MathUtils.damp(jaw.rotation.x, target, JAW_LAMBDA, delta);
    }
    if (tongueRef.current) tongueRef.current.scale.y = 1 + pant;
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
    if (praiseCount !== praiseRef.current) {
      praiseRef.current = praiseCount;
      perkedAtRef.current = time;
    }
    const sincePerk = time - perkedAtRef.current;
    const perk = sincePerk < PERK.seconds ? Math.sin((sincePerk / PERK.seconds) * Math.PI) : 0;
    // One quick flick, each ear in its own turn; praise stands them both up taller.
    earRefs.current.forEach((ear, index) => {
      if (!ear) return;
      ear.scale.set(1 + perk * PERK.wide, 1 + perk * PERK.tall, 1);
      const since = (time + index * (EAR_FLICK.every / 2)) % EAR_FLICK.every;
      ear.rotation.x = since < 0.3 ? Math.sin((since / 0.3) * Math.PI) * EAR_FLICK.amount : 0;
    });
    wagRef.current = MathUtils.damp(
      wagRef.current,
      isLive || perk > 0 ? 1 : 0.15,
      WAG.lambda,
      delta,
    );
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(time * WAG.speed) * TAIL.swing * wagRef.current;
    }
    const pulse =
      status === "thinking" ? Math.sin(time * LIGHT_PULSE.speed) * LIGHT_PULSE.amount : 0;
    lightsRef.current?.scale.setScalar(LIGHT_LEVELS[status] + pulse);
  });

  return (
    <group>
      <group ref={chestRef}>
        {BODY_PARTS.map((part) => (
          <FurPart key={part.id} part={part} fur={fur} />
        ))}

        <mesh position={[...HARNESS.collar.position]} rotation-x={HARNESS.collar.lean}>
          <torusGeometry args={[HARNESS.collar.radius, HARNESS.collar.tube, 8, ROUND * 2]} />
          <meshStandardMaterial color={SPACE_COLORS.rule} roughness={0.6} metalness={0.3} />
        </mesh>
        <mesh position={[...HARNESS.girth.position]} scale={[1, HARNESS.girth.stretch, 1]}>
          <torusGeometry args={[HARNESS.girth.radius, HARNESS.girth.tube, 8, ROUND * 2]} />
          <meshStandardMaterial color={SPACE_COLORS.rule} roughness={0.6} metalness={0.3} />
        </mesh>
        {HARNESS_STRAPS.map((strap) => (
          <mesh key={strap.id} position={[...strap.position]} rotation={[...strap.rotation]}>
            <boxGeometry args={[...strap.size]} />
            <meshStandardMaterial color={SPACE_COLORS.rule} roughness={0.7} metalness={0.1} />
          </mesh>
        ))}
        <mesh position={[...HARNESS.chestFrame.position]} rotation-x={HARNESS.chestFrame.lean}>
          <boxGeometry args={[...HARNESS.chestFrame.size]} />
          <meshStandardMaterial color={SPACE_COLORS.rule} roughness={0.7} metalness={0.1} />
        </mesh>
        <mesh position={[...HARNESS.chestPlate.position]} rotation-x={HARNESS.chestPlate.lean}>
          <boxGeometry args={[...HARNESS.chestPlate.size]} />
          <meshStandardMaterial color={SPACE_COLORS.background} roughness={0.5} metalness={0.4} />
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
          <group key={light.id} position={[...light.position]}>
            <group ref={light.id === HARNESS_LIGHTS[0]?.id ? lightsRef : undefined}>
              <mesh>
                <boxGeometry args={[0.04, 0.085, 0.03]} />
                <meshBasicMaterial color={PALETTE.sky.soft} />
              </mesh>
            </group>
          </group>
        ))}
      </group>

      <group ref={tailRef} position={[...TAIL.base]}>
        <mesh position={[TAIL.length / 2, 0, -TAIL.length / 4]} rotation={[0, 0.5, -QUARTER_TURN]}>
          <cylinderGeometry args={[TAIL.endRadius, TAIL.radius, TAIL.length, ROUND / 2]} />
          <shaderMaterial args={[fur]} />
        </mesh>
        <mesh position={[0.02, 0, 0]}>
          <sphereGeometry args={[TAIL.radius, ROUND / 2, ROUND / 4]} />
          <shaderMaterial args={[fur]} />
        </mesh>
      </group>

      <group ref={headRef} position={[...HEAD_PIVOT]}>
        {HEAD_PARTS.map((part) => (
          <FurPart key={part.id} part={part} fur={fur} />
        ))}
        <mesh position={[...NOSE.position]} scale={[...NOSE.scale]}>
          <sphereGeometry args={[1, ROUND, ROUND / 2]} />
          <meshStandardMaterial color="black" roughness={0.25} />
        </mesh>
        <group ref={jawRef} position={[...JAW.pivot]} rotation-x={JAW.rest}>
          <FurPart part={JAW.part} fur={fur} />
          <mesh position={[...JAW.tip.position]} scale={[...JAW.tip.scale]}>
            <sphereGeometry args={[1, ROUND / 2, ROUND / 4]} />
            <shaderMaterial args={[fur]} />
          </mesh>
          <group ref={tongueRef} position={[...TONGUE.position]} rotation-x={TONGUE.lean}>
            <mesh scale={[1, 1, 0.35]} position-y={-TONGUE.length / 2}>
              <capsuleGeometry args={[TONGUE.radius, TONGUE.length, 6, ROUND / 2]} />
              <meshStandardMaterial color={PALETTE.rose.soft} roughness={0.55} />
            </mesh>
          </group>
        </group>
        {EYES.map((eye) => (
          <group key={eye.id} position={[...eye.position]}>
            <mesh>
              <sphereGeometry args={[eye.radius, ROUND, ROUND / 2]} />
              <meshStandardMaterial
                color={PALETTE.ochre.soft}
                emissive={PALETTE.ochre.soft}
                emissiveIntensity={0.55}
                roughness={0.25}
              />
            </mesh>
            <mesh
              position={[
                eye.facing[0] * eye.radius * 0.72,
                eye.facing[1] * eye.radius * 0.72,
                eye.facing[2] * eye.radius * 0.72,
              ]}
            >
              <sphereGeometry args={[eye.radius * 0.5, ROUND / 2, ROUND / 4]} />
              <meshBasicMaterial color="black" />
            </mesh>
            <mesh
              position={[
                eye.facing[0] * eye.radius + eye.radius * 0.25,
                eye.facing[1] * eye.radius + eye.radius * 0.35,
                eye.facing[2] * eye.radius * 1.12,
              ]}
            >
              <sphereGeometry args={[eye.radius * 0.16, 8, 6]} />
              <meshBasicMaterial color={PALETTE.neutral.soft} />
            </mesh>
          </group>
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
              <shaderMaterial args={[fur]} />
            </mesh>
            {/* The inside of the ear, facing forward. */}
            <mesh position={[0, ear.height * 0.42, 0.045]} scale={[0.5, 0.62, 0.2]}>
              <coneGeometry args={[ear.radius, ear.height, 3]} />
              <meshStandardMaterial color={PALETTE.clay.soft} roughness={0.9} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
