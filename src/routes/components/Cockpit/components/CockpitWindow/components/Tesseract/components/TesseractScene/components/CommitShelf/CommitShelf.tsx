import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Color, type InstancedMesh, Object3D } from "three";

import { PALETTE, SPACE_COLORS } from "#/utils/palette";

import { BOOK, getBookPositions, getShelfSize } from "./utils/shelfBooks";

// Books take turns between these colors; the one picked glows.
const BOOK_COLORS = [PALETTE.ochre.soft, PALETTE.clay.soft, SPACE_COLORS.faint, SPACE_COLORS.rule];
const PICKED_COLOR = PALETTE.neutral.soft;
// The picked book stands out of the shelf by this much.
const PICKED_LIFT = 0.12;
// Books not picked are dimmed to this share of their color.
const DIM = 0.55;

const placer = new Object3D();
const tint = new Color();

interface CommitShelfProps {
  count: number;
  // The book in view, from 0.
  selectedIndex: number;
  onSelect: (index: number) => void;
  // A book was clicked: the message goes back.
  onPick: (index: number) => void;
}

// The shelf in the tesseract: one book per commit. The book under the pointer is the one in
// view; clicking it sends the message back.
export function CommitShelf({ count, selectedIndex, onSelect, onPick }: CommitShelfProps) {
  const [positions] = useState(() => getBookPositions({ count }));
  const [size] = useState(() => getShelfSize({ count }));
  const booksRef = useRef<InstancedMesh>(null);

  // Every frame, so the picked book eases out of the shelf and back.
  useFrame(() => {
    const books = booksRef.current;
    if (!books) return;
    positions.forEach(([x, y], index) => {
      const isPicked = index === selectedIndex;
      placer.position.set(x, y, isPicked ? PICKED_LIFT : 0);
      placer.updateMatrix();
      books.setMatrixAt(index, placer.matrix);
      tint.set(isPicked ? PICKED_COLOR : (BOOK_COLORS[index % BOOK_COLORS.length] ?? PICKED_COLOR));
      if (!isPicked) tint.multiplyScalar(DIM);
      books.setColorAt(index, tint);
    });
    books.instanceMatrix.needsUpdate = true;
    if (books.instanceColor) books.instanceColor.needsUpdate = true;
  });

  function handlePointerMove(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    if (event.instanceId !== undefined && event.instanceId !== selectedIndex) {
      onSelect(event.instanceId);
    }
  }

  // A click between two books still picks: the one in view.
  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    onPick(event.instanceId ?? selectedIndex);
  }

  return (
    <group>
      <mesh position-z={-BOOK.depth} onClick={handleClick}>
        <boxGeometry args={[size.width, size.height, BOOK.depth / 2]} />
        <meshBasicMaterial color={SPACE_COLORS.background} />
      </mesh>
      <instancedMesh
        ref={booksRef}
        args={[undefined, undefined, count]}
        onPointerMove={handlePointerMove}
        onClick={handleClick}
      >
        <boxGeometry args={[BOOK.width, BOOK.height, BOOK.depth]} />
        <meshBasicMaterial />
      </instancedMesh>
    </group>
  );
}
