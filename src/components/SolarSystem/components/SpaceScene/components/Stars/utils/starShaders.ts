// Stars sit on a far shell around the system and twinkle; they keep their pixel size at any
// distance. Each leans a little cool or warm of the shared tint, as real stars do. Colors are
// sRGB as given; no conversion.
export const STAR_VERTEX_SHADER = /* glsl */ `
  attribute float aDepth;
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aHue;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSizeBoost;
  varying float vAlpha;
  varying float vHue;

  void main() {
    vHue = aHue;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * 2.0 * uPixelRatio * uSizeBoost;
    float twinkle = 0.35 + 0.45 * sin(uTime * aSpeed + aPhase);
    vAlpha = twinkle * aDepth + 0.1;
  }
`;

export const STAR_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uCoolColor;
  uniform vec3 uWarmColor;
  varying float vAlpha;
  varying float vHue;

  // The most a star leans away from the shared tint.
  const float LEAN = 0.45;

  void main() {
    float distance = length(gl_PointCoord - 0.5);
    if (distance > 0.5) discard;
    vec3 lean = vHue < 0.0 ? uCoolColor : uWarmColor;
    vec3 color = mix(uColor, lean, abs(vHue) * LEAN);
    gl_FragColor = vec4(color, vAlpha * smoothstep(0.5, 0.3, distance));
  }
`;

// The nebula: a painted map on a shell just inside the stars, multiplied by their tint.
export const NEBULA_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const NEBULA_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    vec4 texel = texture2D(uMap, vUv);
    gl_FragColor = vec4(texel.rgb * uColor, texel.a);
  }
`;

// Shooting stars are streaks on the star shell, from their head (aTail 0) fading to their tail
// (aTail 1); each corner carries its meteor's life, so one draw holds them all.
export const SHOOTING_STAR_VERTEX_SHADER = /* glsl */ `
  attribute float aTail;
  attribute float aLife;
  varying float vAlpha;

  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vAlpha = aLife * (1.0 - aTail);
  }
`;

export const SHOOTING_STAR_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4(uColor, vAlpha);
  }
`;
