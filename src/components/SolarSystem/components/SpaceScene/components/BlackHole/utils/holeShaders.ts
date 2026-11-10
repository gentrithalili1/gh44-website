import { NOISE_GLSL } from "#/components/SolarSystem/components/SpaceScene/utils/noiseShader";

// The black hole on a flat plane facing the camera: a black shadow, a thin ring of light at its
// edge, the far side of its disk bent into a halo over and under it, and the near side of the
// disk as a flat band across the front. The side turning toward the viewer is brighter. Colors
// are sRGB as given; no conversion.
export const HOLE_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const HOLE_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uCoolColor;
  uniform vec3 uHotColor;
  uniform float uTime;
  uniform float uOpacity;
  // The shadow's radius, as a share of the plane's half-size.
  uniform float uShadowShare;
  varying vec2 vUv;

  ${NOISE_GLSL}

  // How flat the disk looks: seen almost edge on.
  const float TILT = 0.11;

  void main() {
    vec2 point = (vUv * 2.0 - 1.0) / uShadowShare;
    float reach = length(point);
    float angle = atan(point.y, point.x);

    float shadow = smoothstep(1.0, 0.96, reach);
    float doppler = 1.0 - 0.55 * smoothstep(-1.5, 1.5, point.x);

    float haloGrain = 0.6 + 0.4 * snoise(vec3(cos(angle) * 2.0, sin(angle) * 2.0, reach * 3.0 - uTime * 0.2));
    float halo = smoothstep(1.0, 1.1, reach) * smoothstep(1.8, 1.1, reach) * haloGrain;
    float ring = smoothstep(0.05, 0.0, abs(reach - 1.03));

    float diskReach = length(vec2(point.x, point.y / TILT));
    float diskAngle = atan(point.y / TILT, point.x);
    float swirl = 0.5 + 0.5 * snoise(vec3(cos(diskAngle - uTime * 0.3) * 1.5, sin(diskAngle - uTime * 0.3) * 1.5, diskReach * 1.6));
    float band = smoothstep(1.25, 1.6, diskReach) * smoothstep(4.4, 2.0, diskReach) * (0.5 + 0.5 * swirl);
    // The near side crosses in front of the shadow; the far side is hidden behind it.
    band *= max(step(point.y, 0.0), 1.0 - shadow);

    vec3 haloColor = mix(uColor, uHotColor, 0.35) * doppler;
    vec3 bandColor = mix(uCoolColor, mix(uColor, uHotColor, 0.3), smoothstep(3.6, 1.3, diskReach)) * (0.5 + doppler);
    float haloLevel = clamp(halo * 0.95 + ring * 0.8, 0.0, 1.0) * (0.4 + 0.6 * doppler);
    float bandLevel = clamp(band * 1.3, 0.0, 1.0);

    // Over black inside the shadow, over the sky outside it.
    vec3 color = mix(haloColor, bandColor, bandLevel);
    float light = max(haloLevel, bandLevel);
    float alpha = max(shadow, light);
    gl_FragColor = vec4(color * (alpha > 0.0 ? light / alpha : 0.0), alpha * uOpacity);
  }
`;
