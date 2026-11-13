import { TUNNEL_DEPTH } from "./warpField";

export const WARP_VERTEX_SHADER = /* glsl */ `
  attribute vec4 aSeed;
  attribute vec2 aCorner;
  uniform float uTime;
  uniform float uWarp;
  varying float vAlpha;

  const float DEPTH = ${TUNNEL_DEPTH.toFixed(1)};
  const float LENGTH = 620.0;
  const float WIDTH = 0.55;
  const float NEAR_FADE = 340.0;
  const float ALPHA = 0.8;

  void main() {
    float level = clamp(uWarp, 0.0, 1.0);
    float ahead = DEPTH - mod(aSeed.z + uTime * aSeed.w, DEPTH);
    vec2 out2 = vec2(cos(aSeed.x), sin(aSeed.x));
    vec3 point = vec3(out2 * aSeed.y, -ahead - aCorner.x * level * LENGTH);
    point.xy += vec2(-out2.y, out2.x) * aCorner.y * WIDTH;
    gl_Position = projectionMatrix * vec4(point, 1.0);
    vAlpha = ALPHA * level * (1.0 - aCorner.x) * smoothstep(0.0, NEAR_FADE, ahead)
      * smoothstep(DEPTH, DEPTH * 0.7, ahead);
  }
`;

export const WARP_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4(uColor, vAlpha);
  }
`;
