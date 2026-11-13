import { NOISE_GLSL } from "#/components/SolarSystem/components/SpaceScene/utils/noiseShader";

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

    float haloTurn = angle - uTime * 0.5;
    float haloGrain = 0.5 + 0.5 * snoise(vec3(cos(haloTurn) * 2.4, sin(haloTurn) * 2.4, reach * 3.0));
    float halo = smoothstep(1.0, 1.1, reach) * smoothstep(1.8, 1.1, reach) * haloGrain;
    float ring = smoothstep(0.05, 0.0, abs(reach - 1.03));

    float diskReach = length(vec2(point.x, point.y / TILT));
    float diskAngle = atan(point.y / TILT, point.x);
    // Streaks of gas run round the disk, the inner ones faster than the outer.
    float turn = diskAngle - uTime * (1.6 / max(diskReach, 1.0));
    float streaks = 0.5 + 0.5 * snoise(vec3(cos(turn) * 2.6, sin(turn) * 2.6, diskReach * 2.4));
    float clumps = 0.5 + 0.5 * snoise(vec3(cos(turn * 2.0) * 1.4, sin(turn * 2.0) * 1.4, diskReach * 0.8 + 7.0));
    float swirl = streaks * 0.65 + clumps * 0.35;
    float band = smoothstep(1.25, 1.6, diskReach) * smoothstep(4.4, 2.0, diskReach) * (0.3 + 0.7 * swirl);
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
