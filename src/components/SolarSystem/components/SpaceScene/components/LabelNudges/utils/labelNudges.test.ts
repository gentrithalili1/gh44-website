import { describe, expect, it } from "vitest";

import { getLabelNudges, type LabelBox } from "./labelNudges";

const GAP = 6;

function getNudgedBoxes({ labels, gap }: { labels: LabelBox[]; gap: number }) {
  const nudges = getLabelNudges({ labels, gap });

  return labels.map((label) => ({
    ...label,
    x: label.x + (nudges.get(label.id)?.x ?? 0),
    y: label.y + (nudges.get(label.id)?.y ?? 0),
  }));
}

function getTouchingPairs(boxes: LabelBox[]) {
  return boxes.flatMap((box, index) =>
    boxes
      .slice(index + 1)
      .filter(
        (other) =>
          Math.abs(box.x - other.x) < (box.width + other.width) / 2 &&
          box.y < other.y + other.height &&
          other.y < box.y + box.height,
      )
      .map((other) => `${box.id}/${other.id}`),
  );
}

// Label sizes as Chrome draws them on a 360 wide phone.
const ME = { id: "me", width: 17, height: 29 };
const CONFIRM = { id: "gh44-confirm", width: 78, height: 29 };
const WORK = { id: "work", width: 35, height: 29 };
const THEME = { id: "gh44-theme", width: 87, height: 29 };
const BRAIN = { id: "gh44-brain", width: 87, height: 29 };

describe("getLabelNudges", () => {
  it("leaves labels that are apart where they are", () => {
    const labels = [
      { ...ME, x: 100, y: 100 },
      { ...CONFIRM, x: 250, y: 300 },
    ];

    expect(getNudgedBoxes({ labels, gap: GAP })).toEqual(labels);
  });

  it.each([
    {
      name: "me and gh44-confirm side by side, as on a 360 wide phone",
      labels: [
        { ...ME, x: 160, y: 361 },
        { ...CONFIRM, x: 145, y: 372 },
      ],
    },
  ])("keeps $name from touching", ({ labels }) => {
    expect(getTouchingPairs(getNudgedBoxes({ labels, gap: GAP }))).toEqual([]);
  });

  it.each([
    {
      name: "the inner planets bunched around the sun",
      labels: [
        { ...ME, x: 180, y: 380 },
        { ...CONFIRM, x: 178, y: 384 },
        { ...WORK, x: 186, y: 376 },
        { ...THEME, x: 170, y: 390 },
      ],
    },
    {
      name: "all five planets on top of each other",
      labels: [
        { ...ME, x: 180, y: 380 },
        { ...CONFIRM, x: 181, y: 381 },
        { ...WORK, x: 179, y: 382 },
        { ...THEME, x: 182, y: 379 },
        { ...BRAIN, x: 180, y: 383 },
      ],
    },
  ])("never moves a label more than one label height from its planet: $name", ({ labels }) => {
    const nudges = getLabelNudges({ labels, gap: GAP });

    for (const label of labels) {
      const nudge = nudges.get(label.id) ?? { x: 0, y: 0 };
      expect(Math.hypot(nudge.x, nudge.y)).toBeLessThanOrEqual(label.height + 1e-9);
    }
  });
});
