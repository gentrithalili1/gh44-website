import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { type Group, MathUtils } from "three";

import { PALETTE } from "#/utils/palette";

import type { FlokiStatus } from "../../../../hooks/useFloki";
import { FlokiDog } from "../../../FlokiDog";

import { CommitShelf } from "./components/CommitShelf";
import { getShelfSize } from "./components/CommitShelf/utils/shelfBooks";
import { Lattice } from "./components/Lattice";
import type { Sightline } from "./components/Lattice/utils/latticeBeams";

// The camera looks in from just outside the open cell, a little above Floki's middle.
const CAMERA = { position: [0, 1.1, 9.6], fov: 50, near: 0.1, far: 120 } as const;
// It looks a little under him, which lifts him and leaves room for the shelf.
const LOOK_AT = [0, -0.25, 0] as const;
// No beam of the lattice comes this close to the line from behind Floki to the camera.
const SIGHTLINE: Sightline = { from: [0, -1, -2], to: [0, 1.1, 9.6], clearance: 3.3 };
// It sways a little, and leans with the pointer: scene units.
const SWAY = { amount: 0.5, speed: 0.11, pointer: 0.9, lambda: 2 } as const;
// Floki floats in the middle of the cell, his middle at the cell's: he bobs and turns slowly.
const DOG = { scale: 1.6, drop: -1.2 } as const;
const FLOAT = { bob: 0.12, bobSpeed: 0.6, turn: 0.22, turnSpeed: 0.27, tip: 0.06 } as const;
// The shelf hangs under him, toward the camera, tipped up to face it, clear of the talk box.
const SHELF = { position: [0, -1.3, 3.2], tip: -0.5, fill: 0.62, scale: 0.74 } as const;
const HALF_FOV = MathUtils.degToRad(CAMERA.fov / 2);

interface FloatingSceneProps {
  commitCount: number;
  selectedIndex: number;
  // What Floki is doing: he perks up while he listens and speaks.
  flokiStatus: FlokiStatus;
  onSelect: (index: number) => void;
}

function FloatingScene({ commitCount, selectedIndex, flokiStatus, onSelect }: FloatingSceneProps) {
  const dogRef = useRef<Group>(null);
  const size = useThree((state) => state.size);

  // On a narrow screen the shelf shrinks to fit across it.
  const shelfDistance = CAMERA.position[2] - SHELF.position[2];
  const visibleWidth = 2 * shelfDistance * Math.tan(HALF_FOV) * (size.width / size.height);
  const shelfScale = Math.min(
    SHELF.scale,
    (visibleWidth * SHELF.fill) / getShelfSize({ count: commitCount }).width,
  );

  useFrame(({ camera, clock, pointer }, delta) => {
    const time = clock.elapsedTime;
    const [x, y, z] = CAMERA.position;
    camera.position.x = MathUtils.damp(
      camera.position.x,
      x + Math.sin(time * SWAY.speed) * SWAY.amount + pointer.x * SWAY.pointer,
      SWAY.lambda,
      delta,
    );
    camera.position.y = MathUtils.damp(
      camera.position.y,
      y + Math.cos(time * SWAY.speed * 1.3) * SWAY.amount * 0.5 + pointer.y * SWAY.pointer * 0.5,
      SWAY.lambda,
      delta,
    );
    camera.position.z = z;
    camera.lookAt(...LOOK_AT);

    const dog = dogRef.current;
    if (!dog) return;
    dog.position.y = DOG.drop + Math.sin(time * FLOAT.bobSpeed) * FLOAT.bob;
    dog.rotation.y = Math.sin(time * FLOAT.turnSpeed) * FLOAT.turn;
    dog.rotation.z = Math.sin(time * FLOAT.turnSpeed * 1.7) * FLOAT.tip;
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      {/* The lattice's warm light from the front, and a cool edge from behind. */}
      <directionalLight color={PALETTE.ochre.soft} intensity={2.4} position={[3, 5, 7]} />
      <directionalLight color={PALETTE.sky.soft} intensity={2.4} position={[-4, 3, -6]} />
      <Lattice sightline={SIGHTLINE} />
      <group ref={dogRef} scale={DOG.scale}>
        <FlokiDog status={flokiStatus} />
      </group>
      <group position={[...SHELF.position]} rotation-x={SHELF.tip} scale={shelfScale}>
        <CommitShelf count={commitCount} selectedIndex={selectedIndex} onSelect={onSelect} />
      </group>
    </>
  );
}

interface TesseractSceneProps extends FloatingSceneProps {}

// The inside of the black hole, in 3D: the lattice, Floki floating in its middle, and the shelf
// of commits under him.
export function TesseractScene(props: TesseractSceneProps) {
  return (
    <Canvas
      // No tone mapping: palette colors as in styles.css.
      flat
      dpr={[1, 2]}
      camera={CAMERA}
      aria-hidden="true"
    >
      <FloatingScene {...props} />
    </Canvas>
  );
}
