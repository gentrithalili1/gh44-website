import { Material, type Object3D } from "three";

type SetGroupOpacityParams = { group: Object3D; opacity: number };

// Fades every material under a group. Each material keeps its own opacity in
// `userData.baseOpacity` (1 when unset), and the group's opacity multiplies it. A settled fade
// costs nothing: the group remembers the opacity it last applied.
export function setGroupOpacity({ group, opacity }: SetGroupOpacityParams) {
  if (group.userData.appliedOpacity === opacity) return;
  group.userData.appliedOpacity = opacity;
  group.traverse((object) => {
    if (!("material" in object)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!(material instanceof Material)) continue;
      const baseOpacity: unknown = material.userData.baseOpacity;
      material.transparent = true;
      material.opacity = (typeof baseOpacity === "number" ? baseOpacity : 1) * opacity;
    }
  });
}
