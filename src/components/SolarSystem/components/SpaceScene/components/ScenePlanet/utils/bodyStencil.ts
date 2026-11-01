import { AlwaysStencilFunc, EqualStencilFunc, ReplaceStencilOp } from "three";

// A planet's body marks the pixels it covers with its own stencil ref, so its spinning surface
// can draw only there.
export function getBodyStencilMark(stencilRef: number) {
  return {
    stencilWrite: true,
    stencilRef,
    stencilFunc: AlwaysStencilFunc,
    stencilZPass: ReplaceStencilOp,
  } as const;
}

// Draws only on the body with the same ref, so surface features slide off its disc's edge
// instead of past it or onto another planet.
export function getBodyStencilClip(stencilRef: number) {
  return { stencilWrite: true, stencilRef, stencilFunc: EqualStencilFunc } as const;
}
