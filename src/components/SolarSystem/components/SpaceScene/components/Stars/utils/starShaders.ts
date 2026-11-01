// Stars live in screen space: each sits at a spot on the screen, drifts with the camera by its
// depth (parallax) and wraps around the edges. Colors are sRGB as given; no conversion.
export const STAR_VERTEX_SHADER = /* glsl */ `
  attribute float aDepth;
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  uniform vec2 uViewport;
  uniform vec2 uOffset;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSizeBoost;
  varying float vAlpha;

  void main() {
    vec2 pixel = mod(position.xy * uViewport - uOffset * aDepth, uViewport);
    vec2 clip = pixel / uViewport * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    gl_PointSize = aSize * 2.0 * uPixelRatio * uSizeBoost;
    float twinkle = 0.35 + 0.45 * sin(uTime * aSpeed + aPhase);
    vAlpha = twinkle * aDepth + 0.1;
  }
`;

export const STAR_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    float distance = length(gl_PointCoord - 0.5);
    if (distance > 0.5) discard;
    gl_FragColor = vec4(uColor, vAlpha * smoothstep(0.5, 0.3, distance));
  }
`;

// A shooting star is a line from its head (aTail 0) fading to its tail (aTail 1).
export const SHOOTING_STAR_VERTEX_SHADER = /* glsl */ `
  attribute float aTail;
  uniform vec2 uViewport;
  uniform float uLife;
  varying float vAlpha;

  void main() {
    vec2 clip = position.xy / uViewport * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    vAlpha = uLife * (1.0 - aTail);
  }
`;

export const SHOOTING_STAR_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4(uColor, vAlpha);
  }
`;
