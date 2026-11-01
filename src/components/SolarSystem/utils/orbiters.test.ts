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
    const others = ["confirm", "work", "gh44-brain"].flatMap((id) => getOrbiters(getPlanet(id)));

    expect(rest).toEqual([]);
    expect(moon).toMatchObject({ kind: "moon", label: "the moon" });
    for (const other of others) expect(other.speed).toBeGreaterThan(moon?.speed ?? Infinity);
  });

  it("lets Earth's moon open a Gmail compose to Gentrit", () => {
    expect(getOrbiters(getPlanet("me"))[0]?.link).toEqual({
      href: "https://mail.google.com/mail/?view=cm&to=gentrithalili11@gmail.com&su=hi%20gentrit",
      label: "write in gmail",
    });
  });

  it("gives Mars two satellites", () => {
    expect(getOrbiters(getPlanet("confirm")).map(({ kind, label }) => ({ kind, label }))).toEqual([
      { kind: "satellite", label: "resolve" },
      { kind: "satellite", label: "reject" },
    ]);
  });

  it("gives Jupiter one moon per company, with JOIN highlighted in vivid", () => {
    const moons = getOrbiters(getPlanet("work"));

    expect(moons).toHaveLength(8);
    expect(moons.every((moon) => moon.kind === "moon")).toBe(true);
    expect(moons.filter((moon) => moon.isHighlighted)).toEqual([
      expect.objectContaining({ label: "JOIN · Senior Frontend Engineer", shade: "vivid" }),
    ]);
  });

  it("gives Neptune one satellite per gh44-brain agent", () => {
    expect(getOrbiters(getPlanet("gh44-brain")).map(({ kind, label }) => [kind, label])).toEqual([
      ["satellite", "implementer"],
      ["satellite", "researcher"],
      ["satellite", "verifier"],
      ["satellite", "reviewer"],
    ]);
  });

  it("gives Saturn no moons: its rings stand for the apps", () => {
    expect(getOrbiters(getPlanet("gh44-theme"))).toEqual([]);
  });

  it("keeps every orbit clear of its planet", () => {
    for (const id of ["me", "confirm", "work", "gh44-brain"]) {
      const planet = getPlanet(id);
      for (const orbiter of getOrbiters(planet)) {
        expect(orbiter.orbitRadius - orbiter.radius).toBeGreaterThan(planet.size);
      }
    }
  });
});
