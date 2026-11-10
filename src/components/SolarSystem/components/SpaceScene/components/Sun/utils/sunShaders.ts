import { NOISE_GLSL } from "#/components/SolarSystem/components/SpaceScene/utils/noiseShader";

// The sun's surface: slow boiling cells between a cooler and a hotter color, darker toward the
// edge. Colors are sRGB as given; no conversion.
export const SUN_VERTEX_SHADER = /* glsl */ `
  varying vec3 vLocal;
  varying vec3 vWorld;
  varying vec3 vNormal;

  void main() {
    vLocal = position;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const SUN_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uCoolColor;
  uniform vec3 uHotColor;
  uniform float uTime;
  uniform float uOpacity;
  varying vec3 vLocal;
  varying vec3 vWorld;
  varying vec3 vNormal;

  ${NOISE_GLSL}

  void main() {
    vec3 point = normalize(vLocal);
    float swell = fbm(point * 2.4 + vec3(0.0, uTime * 0.04, 0.0));
    float cells = fbm(point * 7.0 + swell * 0.8 - vec3(uTime * 0.07, 0.0, uTime * 0.03));
    float heat = clamp(0.5 + 0.7 * swell + 0.5 * cells, 0.0, 1.0);

    vec3 color = mix(uCoolColor, uColor, smoothstep(0.1, 0.5, heat));
    color = mix(color, uHotColor, smoothstep(0.6, 1.0, heat) * 0.7);

    float rim = 1.0 - max(dot(normalize(vNormal), normalize(cameraPosition - vWorld)), 0.0);
    color = mix(color, uCoolColor, pow(rim, 2.5) * 0.55);
    gl_FragColor = vec4(color, uOpacity);
  }
`;

// The corona: a flat glow facing the camera, fading from the sun's edge outward, with slow
// streamers reaching further in some directions than others.
export const CORONA_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const CORONA_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uOpacity;
  // The sun's radius, as a share of the glow's.
  uniform float uSunShare;
  varying vec2 vUv;

  ${NOISE_GLSL}

  void main() {
    vec2 offset = vUv * 2.0 - 1.0;
    float distance = length(offset);
    vec2 direction = offset / max(distance, 0.0001);
    // 0 at the sun's edge, 1 at the glow's.
    float reach = clamp((distance - uSunShare) / (1.0 - uSunShare), 0.0, 1.0);

    float streamers = 0.5 + 0.5 * snoise(vec3(direction * 2.2, uTime * 0.06));
    float fine = 0.5 + 0.5 * snoise(vec3(direction * 7.0, uTime * 0.11 + 4.0));
    float length_ = mix(0.55, 1.0, streamers * 0.75 + fine * 0.25);

    float glow = pow(1.0 - clamp(reach / length_, 0.0, 1.0), 2.6);
    // Behind the sun's own disc the glow stays full, so no dark seam shows at its edge.
    float alpha = distance < uSunShare ? 1.0 : glow;
    gl_FragColor = vec4(uColor, alpha * uOpacity * (1.0 - smoothstep(0.92, 1.0, distance)));
  }
`;
