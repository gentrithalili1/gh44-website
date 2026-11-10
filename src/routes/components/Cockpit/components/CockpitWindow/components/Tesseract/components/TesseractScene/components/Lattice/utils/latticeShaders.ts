// A beam is made of streaks running its whole length: thin bands of warm light and dark, like
// stretched time. Each beam gets its own bands from where it sits. Light travels slowly along
// it, and it fades into the dark with distance. Colors are sRGB as given; no conversion.
export const BEAM_VERTEX_SHADER = /* glsl */ `
  varying vec3 vLocal;
  varying vec3 vNormalLocal;
  varying float vDepth;
  varying float vSeed;

  void main() {
    vLocal = position;
    vNormalLocal = normal;
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    vDepth = -view.z;
    // Where the beam sits tells it apart from the others.
    vSeed = dot(modelMatrix[3].xyz, vec3(0.731, 1.913, 2.377));
    gl_Position = projectionMatrix * view;
  }
`;

export const BEAM_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uDark;
  uniform vec3 uWarm;
  uniform vec3 uCool;
  uniform vec3 uBright;
  uniform float uTime;
  varying vec3 vLocal;
  varying vec3 vNormalLocal;
  varying float vDepth;
  varying float vSeed;

  // Bands across a face, per scene unit, coarse and fine.
  const float BANDS = 9.0;
  const float FINE_BANDS = 41.0;
  // How far the light reaches before the dark takes it.
  const float REACH = 62.0;

  float hash(float n) {
    return fract(sin(n * 12.9898) * 43758.5453);
  }

  void main() {
    // The beam runs along x: across a face is whichever of y and z the face does not look along.
    float across = abs(vNormalLocal.y) > 0.5 ? vLocal.z : vLocal.y;
    float side = abs(vNormalLocal.y) > 0.5 ? 3.0 : 7.0;
    float band = hash(floor(across * BANDS) + vSeed + side);
    float fine = hash(floor(across * FINE_BANDS) + vSeed * 1.7 + side);
    float tone = band * 0.65 + fine * 0.35;

    vec3 color = mix(uDark, uCool, smoothstep(0.25, 0.6, tone));
    color = mix(color, uWarm, smoothstep(0.5, 0.82, tone));
    color = mix(color, uBright, smoothstep(0.86, 1.0, tone));

    // Slow pulses of light run along each band, each at its own pace and place.
    float pace = 0.25 + band * 0.9;
    float pulse = 0.5 + 0.5 * sin(vLocal.x * (0.35 + fine * 0.5) - uTime * pace + band * 40.0);
    float light = 0.5 + 0.7 * pulse * pulse;

    float fade = exp(-vDepth / REACH * 3.0);
    gl_FragColor = vec4(color * light * fade, 1.0);
  }
`;
