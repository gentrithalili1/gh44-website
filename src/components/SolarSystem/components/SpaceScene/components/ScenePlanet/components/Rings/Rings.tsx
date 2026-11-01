import type { ThreeEvent } from "@react-three/fiber";
import { useState } from "react";
import { DoubleSide } from "three";

import type { RingBand } from "#/components/SolarSystem/utils/rings";
import { PALETTE } from "#/utils/palette";
import type { ThemeToolId } from "#/utils/themeTools";

import { isDragRelease } from "../../../../utils/sceneMath";
import type { HoverChange } from "../../types";
import { HoverName } from "../HoverName";

const RING_SEGMENTS = 128;
// Flat on the orbit plane, then tipped away from the home view: seen about as open as the 2D
// drawing's tilted rings, the far half behind the planet and the near half across it.
const RING_TILT = -Math.PI / 2 - 0.45;

interface RingsProps {
  bands: RingBand[];
  onHoverChange: (change: HoverChange) => void;
  onBandClick: (bandId: ThemeToolId) => void;
}

// Saturn's rings around its tipped equator. Each band names its app on hover
// and holds the planet still; a click opens the planet at that app's install tab.
export function Rings({ bands, onHoverChange, onBandClick }: RingsProps) {
  const [hoveredBandId, setHoveredBandId] = useState<string | null>(null);

  const hoveredBand = bands.find((band) => band.id === hoveredBandId);

  function handleBandHover({ bandId, isHovered }: { bandId: string; isHovered: boolean }) {
    setHoveredBandId(isHovered ? bandId : null);
    onHoverChange({ source: bandId, isHovered });
  }

  function handleClick({ event, bandId }: { event: ThreeEvent<MouseEvent>; bandId: ThemeToolId }) {
    event.stopPropagation();
    if (isDragRelease(event.delta)) return;
    onBandClick(bandId);
  }

  return (
    <group rotation-x={RING_TILT}>
      {bands.map((band) => (
        <mesh
          key={band.id}
          onPointerOver={(event) => {
            event.stopPropagation();
            handleBandHover({ bandId: band.id, isHovered: true });
          }}
          onPointerOut={() => handleBandHover({ bandId: band.id, isHovered: false })}
          onClick={(event) => handleClick({ event, bandId: band.id })}
        >
          <ringGeometry args={[band.innerRadius, band.outerRadius, RING_SEGMENTS]} />
          {/* Unlit: each band shows its app's exact palette color. */}
          <meshBasicMaterial color={PALETTE[band.color].soft} side={DoubleSide} />
        </mesh>
      ))}
      {hoveredBand ? (
        <HoverName name={hoveredBand.label} position={[0, -hoveredBand.outerRadius, 0]} />
      ) : null}
    </group>
  );
}
