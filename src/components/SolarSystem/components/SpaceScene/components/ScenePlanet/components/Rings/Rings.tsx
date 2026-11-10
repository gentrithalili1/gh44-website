import { useState } from "react";

import type { RingBand } from "#/components/SolarSystem/utils/rings";

import type { HoverChange } from "../../types";
import { RING_TILT } from "../../utils/ringPlane";
import { HoverName } from "../HoverName";
import { RingBandMesh } from "./components/RingBandMesh";

interface RingsProps {
  bands: RingBand[];
  // The planet's radius: it casts its shadow across the rings.
  planetSize: number;
  onHoverChange: (change: HoverChange) => void;
}

// Saturn's rings around its tipped equator. Each band names its app on hover and holds the
// planet still.
export function Rings({ bands, planetSize, onHoverChange }: RingsProps) {
  const [hoveredBandId, setHoveredBandId] = useState<string | null>(null);

  const hoveredBand = bands.find((band) => band.id === hoveredBandId);

  function handleBandHover({ bandId, isHovered }: { bandId: string; isHovered: boolean }) {
    setHoveredBandId(isHovered ? bandId : null);
    onHoverChange({ source: bandId, isHovered });
  }

  return (
    <group rotation-x={RING_TILT}>
      {bands.map((band) => (
        <RingBandMesh
          key={band.id}
          band={band}
          planetSize={planetSize}
          onHoverChange={(isHovered) => handleBandHover({ bandId: band.id, isHovered })}
        />
      ))}
      {hoveredBand ? (
        <HoverName name={hoveredBand.label} position={[0, -hoveredBand.outerRadius, 0]} />
      ) : null}
    </group>
  );
}
