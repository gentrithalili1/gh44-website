import type { ThreeEvent } from "@react-three/fiber";
import { useState } from "react";
import { DoubleSide } from "three";

import type { RingBand } from "#/components/SolarSystem/utils/rings";
import { PALETTE } from "#/utils/palette";

import type { HoverChange } from "../../types";
import { TILTED_PLANE_ROTATION } from "../../utils/sceneGeometry";
import { HoverName } from "../HoverName";

const RING_SEGMENTS = 128;

interface RingsProps {
  bands: RingBand[];
  onHoverChange: (change: HoverChange) => void;
  onPlanetClick: () => void;
}

// Saturn's rings on the tilted plane: the near half crosses in front of the planet, the far
// half behind. Each band names its app on hover and holds the planet still; a click opens it.
export function Rings({ bands, onHoverChange, onPlanetClick }: RingsProps) {
  const [hoveredBandId, setHoveredBandId] = useState<string | null>(null);

  const hoveredBand = bands.find((band) => band.id === hoveredBandId);

  function handleBandHover({ bandId, isHovered }: { bandId: string; isHovered: boolean }) {
    setHoveredBandId(isHovered ? bandId : null);
    onHoverChange({ source: bandId, isHovered });
  }

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    onPlanetClick();
  }

  return (
    <group rotation-x={TILTED_PLANE_ROTATION}>
      {bands.map((band) => (
        <mesh
          key={band.id}
          onPointerOver={(event) => {
            event.stopPropagation();
            handleBandHover({ bandId: band.id, isHovered: true });
          }}
          onPointerOut={() => handleBandHover({ bandId: band.id, isHovered: false })}
          onClick={handleClick}
        >
          <ringGeometry args={[band.innerRadius, band.outerRadius, RING_SEGMENTS]} />
          <meshBasicMaterial color={PALETTE[band.color].soft} side={DoubleSide} />
        </mesh>
      ))}
      {hoveredBand ? (
        <HoverName name={hoveredBand.label} position={[0, -hoveredBand.outerRadius, 0]} />
      ) : null}
    </group>
  );
}
