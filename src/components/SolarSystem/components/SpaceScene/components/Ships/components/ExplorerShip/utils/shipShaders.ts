// The hull is lit by the sun at the scene's origin, like the planets: a lit side, a dim side
// that never goes black, and a thin light along its edge. Colors are sRGB as given; the light
// is worked out in linear.
export const HULL_VERTEX_SHADER = /* glsl */ `
  varying vec3 vWorld;
  varying vec3 vNormal;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const HULL_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  uniform float uGlint;
  uniform float uOpacity;
  varying vec3 vWorld;
  varying vec3 vNormal;

  // The dark side's share of the light, and the edge light's.
  const float SHADE = 0.2;
  const float RIM = 0.22;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 sun = normalize(-vWorld);
    vec3 eye = normalize(cameraPosition - vWorld);
    float facing = max(dot(normal, sun), 0.0);
    float rim = pow(1.0 - max(dot(normal, eye), 0.0), 3.0) * RIM;
    float glint = pow(max(dot(normal, normalize(sun + eye)), 0.0), 24.0) * uGlint;
    vec3 lit = pow(uColor, vec3(2.2)) * (SHADE + (1.0 - SHADE) * facing) + rim * facing + glint;
    gl_FragColor = vec4(pow(lit, vec3(1.0 / 2.2)), uOpacity);
  }
`;

// The exhaust: a cone from the engine (vAlong 0) to its tip (1), hot at the engine, thinning to
// nothing, soft at its sides and flickering along its length.
export const PLUME_VERTEX_SHADER = /* glsl */ `
  varying float vAlong;
  varying float vEdge;

  void main() {
    vAlong = position.y + 0.5;
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    vec3 normal = normalize(normalMatrix * normal);
    vEdge = abs(dot(normal, normalize(-view.xyz)));
    gl_Position = projectionMatrix * view;
  }
`;

export const PLUME_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uHotColor;
  uniform float uTime;
  uniform float uOpacity;
  varying float vAlong;
  varying float vEdge;

  const float FLICKER = 0.18;

  void main() {
    float fade = pow(1.0 - vAlong, 1.6);
    float flicker = 1.0 - FLICKER * (0.5 + 0.5 * sin(vAlong * 26.0 - uTime * 38.0));
    vec3 color = mix(uColor, uHotColor, fade * fade);
    gl_FragColor = vec4(color, fade * flicker * smoothstep(0.0, 0.7, vEdge) * uOpacity);
  }
`;
