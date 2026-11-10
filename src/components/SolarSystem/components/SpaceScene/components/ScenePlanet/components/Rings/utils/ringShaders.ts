// A ring band in its app's exact color, grainy along its radius like ice and dust, and dark
// where the planet stands between it and the sun at the scene's origin. Colors are sRGB as
// given; no conversion.
export const RING_VERTEX_SHADER = /* glsl */ `
  varying vec3 vWorld;
  varying vec3 vCenter;
  varying float vRadius;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vCenter = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    vRadius = length(position.xy);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const RING_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPlanetRadius;
  uniform float uOpacity;
  varying vec3 vWorld;
  varying vec3 vCenter;
  varying float vRadius;

  // The planet's shadow keeps this share of the band's color.
  const float SHADE = 0.2;

  float hash(float value) { return fract(sin(value * 127.1) * 43758.5453); }

  // Smooth random steps along the radius: lanes of denser and thinner ring.
  float lanes(float value) {
    float cell = floor(value);
    float blend = smoothstep(0.0, 1.0, fract(value));
    return mix(hash(cell), hash(cell + 1.0), blend);
  }

  void main() {
    vec3 toSun = normalize(-vWorld);
    vec3 toCenter = vCenter - vWorld;
    float along = dot(toCenter, toSun);
    float miss = length(toCenter - toSun * along);
    float lit = along > 0.0 ? smoothstep(uPlanetRadius * 0.94, uPlanetRadius * 1.03, miss) : 1.0;

    float spread = vRadius / uPlanetRadius;
    float grain = 0.8 + 0.2 * mix(lanes(spread * 46.0), lanes(spread * 150.0), 0.4);
    gl_FragColor = vec4(uColor * grain * mix(SHADE, 1.0, lit), uOpacity);
  }
`;
