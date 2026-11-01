// A planet label on screen, in pixels: `x` is its center, `y` its top.
export type LabelBox = { id: string; x: number; y: number; width: number; height: number };

type LabelNudge = { x: number; y: number };

type GetLabelNudgesParams = {
  labels: LabelBox[];
  // The least space between two labels.
  gap: number;
};

// Passes run until no label moves; this only stops a pathological case from spinning a frame.
const MAX_PASSES = 50;

type LabelPair = { label: LabelBox; other: LabelBox };

// The way from `other` to `label` before any nudge: steady frame to frame, so the nudges change
// smoothly as the planets move.
function getPushDirection({ label, other }: LabelPair) {
  const x = label.x - other.x;
  const y = label.y - other.y;
  const length = Math.hypot(x, y);

  return length === 0 ? { x: 1, y: 0 } : { x: x / length, y: y / length };
}

type GetPushParams = {
  // From `other` to `label`, with the nudges so far.
  offset: LabelNudge;
  // How far apart they must be on each axis.
  clearance: LabelNudge;
  direction: LabelNudge;
};

// How much further apart, along `direction`, two labels must move to clear each other on either
// axis.
function getPush({ offset, clearance, direction }: GetPushParams) {
  const pushes = (["x", "y"] as const)
    .filter((axis) => direction[axis] !== 0)
    .map(
      (axis) =>
        (clearance[axis] - offset[axis] * Math.sign(direction[axis])) / Math.abs(direction[axis]),
    );

  return Math.max(0, Math.min(...pushes));
}

// How far each label moves so no two come closer than `gap`: two labels that would touch move
// apart along the line between them, each taking half. No label moves more than its own height,
// so it always stays by its planet; a crowd too tight for that may still touch.
export function getLabelNudges({ labels, gap }: GetLabelNudgesParams) {
  const nudges = new Map<string, LabelNudge>(labels.map((label) => [label.id, { x: 0, y: 0 }]));

  for (let pass = 0; pass < MAX_PASSES; pass++) {
    let isSettled = true;
    labels.forEach((label, index) => {
      for (const other of labels.slice(index + 1)) {
        const nudge = nudges.get(label.id);
        const otherNudge = nudges.get(other.id);
        if (!nudge || !otherNudge) continue;
        const offset = {
          x: label.x + nudge.x - (other.x + otherNudge.x),
          y: label.y + nudge.y - (other.y + otherNudge.y),
        };
        const clearance = {
          x: (label.width + other.width) / 2 + gap,
          y: (offset.y >= 0 ? other.height : label.height) + gap,
        };
        const isTouching = Math.abs(offset.x) < clearance.x && Math.abs(offset.y) < clearance.y;
        if (!isTouching) continue;

        isSettled = false;
        const direction = getPushDirection({ label, other });
        const push = getPush({ offset, clearance, direction }) / 2;
        nudge.x += direction.x * push;
        nudge.y += direction.y * push;
        otherNudge.x -= direction.x * push;
        otherNudge.y -= direction.y * push;
      }
    });
    if (isSettled) break;
  }

  for (const label of labels) {
    const nudge = nudges.get(label.id);
    if (!nudge) continue;
    const length = Math.hypot(nudge.x, nudge.y);
    if (length <= label.height) continue;
    nudge.x *= label.height / length;
    nudge.y *= label.height / length;
  }

  return nudges;
}
