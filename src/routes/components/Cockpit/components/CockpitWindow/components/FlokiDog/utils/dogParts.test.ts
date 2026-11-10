import { describe, expect, it } from "vitest";

import {
  BODY_PARTS,
  EARS,
  EYES,
  HARNESS_LIGHTS,
  HARNESS_STRAPS,
  HEAD_PARTS,
  JAW,
} from "./dogParts";

describe("dogParts", () => {
  it("gives every part its own id", () => {
    const ids = [...BODY_PARTS, ...HEAD_PARTS, JAW.part].map((part) => part.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("mirrors his legs, eyes, ears, straps and lights across his middle", () => {
    const leftLeg = BODY_PARTS.find((part) => part.id === "leftUpperLeg");
    const rightLeg = BODY_PARTS.find((part) => part.id === "rightUpperLeg");

    expect(leftLeg?.position[0]).toBe(-(rightLeg?.position[0] ?? 0));
    expect(EYES[0]?.position[0]).toBe(-(EYES[1]?.position[0] ?? 0));
    expect(EARS[0]?.position[0]).toBe(-(EARS[1]?.position[0] ?? 0));
    expect(HARNESS_STRAPS[0]?.position[0]).toBe(-(HARNESS_STRAPS[1]?.position[0] ?? 0));
    expect(HARNESS_LIGHTS).toHaveLength(6);
  });

  it("stands him on the ground: nothing under it", () => {
    for (const part of BODY_PARTS) {
      expect(part.position[1]).toBeGreaterThan(0);
    }
  });

  it("opens his jaw wider to speak than at rest", () => {
    expect(JAW.open).toBeGreaterThan(JAW.rest);
  });
});
