import { Html } from "@react-three/drei";

// Over the panel's back link and labels: names show only while hovered.
const HOVER_NAME_Z_INDEX_RANGE = [2, 0];

interface HoverNameProps {
  name: string;
  position?: [number, number, number];
}

// A small name tag above whatever is hovered in the scene: a moon, a satellite or a ring band.
export function HoverName({ name, position }: HoverNameProps) {
  return (
    <Html
      position={position}
      zIndexRange={HOVER_NAME_Z_INDEX_RANGE}
      className="pointer-events-none"
    >
      <span
        role="tooltip"
        className="block -translate-x-1/2 -translate-y-[calc(100%+0.5rem)] rounded-sm bg-background px-1.5 py-0.5 text-label-sub whitespace-nowrap text-foreground"
      >
        {name}
      </span>
    </Html>
  );
}
