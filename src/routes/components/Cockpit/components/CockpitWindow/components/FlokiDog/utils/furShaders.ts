import { NOISE_GLSL } from "#/components/SolarSystem/components/SpaceScene/utils/noiseShader";

export const FUR_VERTEX_SHADER = /* glsl */ `
  varying vec3 vLocal;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vLocal = position;
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    vView = -view.xyz;
    vNormal = normalMatrix * normal;
    gl_Position = projectionMatrix * view;
  }
`;

export const FUR_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uFur;
  uniform vec3 uKey;
  uniform vec3 uRim;
  varying vec3 vLocal;
  varying vec3 vNormal;
  varying vec3 vView;

  ${NOISE_GLSL}

  // Where the warm light comes from, in view space: up and to the front right.
  const vec3 KEY_DIRECTION = vec3(0.45, 0.6, 0.66);

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 eye = normalize(vView);
    // Strands: long along the part, thin across it; a finer grain on top.
    float strand = 0.5 + 0.5 * snoise(vec3(vLocal.x * 60.0, vLocal.y * 4.0, vLocal.z * 60.0));
    float grain = 0.5 + 0.5 * snoise(vLocal * 140.0);
    float hair = strand * 0.7 + grain * 0.3;

    float facing = max(dot(normal, KEY_DIRECTION), 0.0);
    float edge = pow(1.0 - max(dot(normal, eye), 0.0), 2.6);
    float sheen = pow(max(dot(normal, normalize(KEY_DIRECTION + eye)), 0.0), 14.0);

    vec3 color = uFur * (0.75 + 0.5 * hair) * (0.4 + 1.0 * facing);
    color += uKey * facing * hair * 0.03;
    color += uRim * edge * (0.5 + 0.5 * hair) * 0.32;
    color += uKey * sheen * strand * 0.1;
    gl_FragColor = vec4(color, 1.0);
  }
`;
