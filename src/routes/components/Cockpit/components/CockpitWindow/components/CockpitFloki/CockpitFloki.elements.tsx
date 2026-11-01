import type { ReactNode } from "react";

import type { FlokiStatus } from "../../hooks/useFloki";

// Floki's head in a 100 x 100 box: a robotic German shepherd, front on, ears straight up.
const LEFT_EAR = "M30 31 L17 3 L9 40 Z";
const RIGHT_EAR = "M70 31 L83 3 L91 40 Z";
const LEFT_INNER_EAR = "M27 29 L18 12 L14 35 Z";
const RIGHT_INNER_EAR = "M73 29 L82 12 L86 35 Z";
const HEAD = "M30 27 H70 L86 42 L81 62 L66 72 L60 94 H40 L34 72 L19 62 L14 42 Z";
const MUZZLE = "M38 54 H62 L59 92 H41 Z";
const FOREHEAD_SEAM = "M50 27 V46 M41 33 L50 40 L59 33";
// Tan cheek plates, the shepherd's markings.
const CHEEK_PLATES = "M19 62 L31 58 L34 72 L38 54 L24 52 Z M81 62 L69 58 L66 72 L62 54 L76 52 Z";
const NOSE = "M44 86 H56 L54 92 H46 Z";
// Almond visor eyes: friendly, not fierce.
const LEFT_EYE = "M28 48 Q35 42.5 42 48.5 Q35 53 28 48 Z";
const RIGHT_EYE = "M72 48 Q65 42.5 58 48.5 Q65 53 72 48 Z";

interface FlokiHeadProps {
  status: FlokiStatus;
  // The voice grille, laid over the muzzle.
  grille: ReactNode;
}

// Plates in the console's graphite, seams in its rule color, and lavender light where he is
// alive: ears, eyes and the grille. The eyes dim while he stands by and pulse while he thinks.
export function FlokiHead({ status, grille }: FlokiHeadProps) {
  return (
    <span
      data-status={status}
      className="group/head relative block aspect-square h-full max-w-full"
    >
      <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 size-full">
        <path d={LEFT_EAR} className="fill-surface stroke-rule stroke-[1.2]" />
        <path d={RIGHT_EAR} className="fill-surface stroke-rule stroke-[1.2]" />
        <path d={LEFT_INNER_EAR} className="fill-lavender/15" />
        <path d={RIGHT_INNER_EAR} className="fill-lavender/15" />
        <path
          d={HEAD}
          className="fill-bg-subtle stroke-rule stroke-[1.2] [stroke-linejoin:round]"
        />
        <path d={CHEEK_PLATES} className="fill-ochre/30 stroke-rule stroke-[0.8]" />
        <path d={FOREHEAD_SEAM} className="fill-none stroke-rule stroke-[0.8]" />
        <path d={MUZZLE} className="fill-surface stroke-rule stroke-[1] [stroke-linejoin:round]" />
        <path d={NOSE} className="fill-night" />
        {[LEFT_EYE, RIGHT_EYE].map((eye) => (
          <path
            key={eye}
            d={eye}
            className="fill-lavender opacity-50 transition-opacity duration-300 group-data-[status=idle]/head:animate-light-blink group-data-[status=listening]/head:opacity-100 group-data-[status=speaking]/head:opacity-100 group-data-[status=thinking]/head:animate-light-blink group-data-[status=thinking]/head:opacity-90"
          />
        ))}
      </svg>
      <span className="absolute top-[58%] left-[41%] h-[24%] w-[18%]">{grille}</span>
    </span>
  );
}
