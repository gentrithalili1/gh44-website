import { describe, expect, it } from "vitest";

import { findPlanet, type Planet } from "#/utils/planets";

import { getOrbiters } from "./orbiters";

function getPlanet(id: string): Planet {
  const planet = findPlanet(id);
  if (!planet) throw new Error(`No planet ${id}`);
  return planet;
}

describe("getOrbiters", () => {
  it("gives Earth one moon, slower than any other orbiter", () => {
    const [moon, ...rest] = getOrbiters(getPlanet("me"));
    const others = ["gh44-confirm", "work", "gh44-brain"].flatMap((id) =>
      getOrbiters(getPlanet(id)),
    );

    expect(rest).toEqual([]);
    expect(moon).toMatchObject({ kind: "moon" });
    expect(moon?.label).toBeUndefined();
    for (const other of others) expect(other.speed).toBeGreaterThan(moon?.speed ?? Infinity);
  });

  it("gives Mars Phobos and Deimos: small lumpy rocks, Phobos the bigger, closer and faster", () => {
    const [phobos, deimos] = getOrbiters(getPlanet("gh44-confirm"));

    expect([phobos, deimos].map((moon) => [moon?.kind, moon?.label])).toEqual([
      ["rock", "phobos · resolve"],
      ["rock", "deimos · reject"],
    ]);
    if (phobos?.kind !== "rock" || deimos?.kind !== "rock")
      throw new Error("Mars' moons are rocks");
    expect(phobos.radius).toBeGreaterThan(deimos.radius);
    expect(phobos.orbitRadius).toBeLessThan(deimos.orbitRadius);
    expect(phobos.speed).toBeGreaterThan(deimos.speed);
    for (const moon of [phobos, deimos]) expect(moon.stretch).not.toEqual({ x: 1, y: 1, z: 1 });
  });

  it("gives Jupiter one moon per company, with JOIN highlighted in vivid", () => {
    const moons = getOrbiters(getPlanet("work"));

    expect(moons).toHaveLength(8);
    expect(moons.every((moon) => moon.kind === "moon")).toBe(true);
    expect(moons.filter((moon) => moon.isHighlighted)).toEqual([
      expect.objectContaining({ label: "JOIN · Senior Frontend Engineer", shade: "vivid" }),
    ]);
  });

  it("gives Neptune one gray rock moon per gh44-brain agent, each its own size", () => {
    const rocks = getOrbiters(getPlanet("gh44-brain"));

    expect(rocks.map(({ kind, label, color }) => [kind, label, color])).toEqual([
      ["rock", "implementer", "neutral"],
      ["rock", "researcher", "neutral"],
      ["rock", "verifier", "neutral"],
      ["rock", "reviewer", "neutral"],
    ]);
    expect(new Set(rocks.map((rock) => rock.radius)).size).toBe(4);
  });

  it("scars every rock with a few darker craters that stay on it", () => {
    for (const rock of getOrbiters(getPlanet("gh44-brain"))) {
      if (rock.kind !== "rock") throw new Error("Neptune's moons are rocks");
      expect(rock.craters.length).toBeGreaterThanOrEqual(2);
      for (const crater of rock.craters) {
        expect(Math.hypot(crater.x, crater.y) + crater.radius).toBeLessThan(rock.radius);
      }
    }
  });

  it("gives Saturn no moons: its rings stand for the apps", () => {
    expect(getOrbiters(getPlanet("gh44-theme"))).toEqual([]);
  });

  it("keeps every orbit clear of its planet", () => {
    for (const id of ["me", "gh44-confirm", "work", "gh44-brain"]) {
      const planet = getPlanet(id);
      for (const orbiter of getOrbiters(planet)) {
        expect(orbiter.orbitRadius - orbiter.radius).toBeGreaterThan(planet.size);
      }
    }
  });
});
