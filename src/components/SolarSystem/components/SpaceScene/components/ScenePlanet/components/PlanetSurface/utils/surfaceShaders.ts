import { NOISE_GLSL } from "#/components/SolarSystem/components/SpaceScene/utils/noiseShader";

// Shared by the globe and its air: where the fragment and the planet's center are in the scene.
export const SURFACE_VERTEX_SHADER = /* glsl */ `
  varying vec3 vLocal;
  varying vec3 vWorld;
  varying vec3 vCenter;
  varying vec3 vNormal;
  // The way to the sun, as the turning globe sees it.
  varying vec3 vLocalSun;

  void main() {
    vLocal = position;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vLocalSun = normalize(-world.xyz) * mat3(modelMatrix);
    vCenter = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

// The globe: its painted map pushed around by noise, weather on top, then lit by the sun at the
// scene's origin. The map's colors are sRGB as painted; the light is added in linear and the
// result written back as sRGB.
export const SURFACE_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uSeed;
  uniform float uWarp;
  uniform vec3 uGrain;
  uniform float uDrift;
  uniform float uMottle;
  uniform float uRelief;
  uniform float uBands;
  uniform float uClouds;
  uniform float uCaps;
  uniform float uGlint;
  uniform float uNightLights;
  uniform float uAir;
  uniform float uFill;
  uniform vec3 uBase;
  uniform vec3 uAirColor;
  uniform vec3 uCloudColor;
  uniform vec3 uSunColor;
  uniform vec3 uRingNormal;
  uniform vec2 uRingSpan;
  varying vec3 vLocal;
  varying vec3 vWorld;
  varying vec3 vCenter;
  varying vec3 vNormal;
  varying vec3 vLocalSun;

  const float TURN = 6.28318530718;
  // The night side keeps this share of its color, so a planet seen from behind is still there.
  const float NIGHT = 0.07;
  const float DETAIL_SCALE = 2.5;
  // The most a slope lightens or darkens its ground.
  const float RELIEF_SHADE = 0.35;

  ${NOISE_GLSL}

  vec3 toLinear(vec3 color) { return pow(color, vec3(2.2)); }

  // Where a direction from the center lands on the map, as three's sphere wraps it.
  vec2 getMapUv(vec3 direction) {
    return vec2(atan(direction.z, -direction.x) / TURN, 0.5 + asin(clamp(direction.y, -1.0, 1.0)) / 3.14159265359);
  }

  void main() {
    vec3 point = normalize(vLocal);
    vec3 grain = point * uGrain + uSeed + vec3(0.0, uTime * uDrift, 0.0);
    vec3 push = vec3(snoise(grain), snoise(grain + 19.19), snoise(grain + 47.47));
    // A finer push on top: coasts and band edges come out ragged, not round.
    vec3 fine = grain * 3.1;
    push += 0.4 * vec3(snoise(fine + 5.5), snoise(fine + 23.3), snoise(fine + 61.7));
    vec3 warped = normalize(point + uWarp * push);

    vec3 texel = texture2D(uMap, getMapUv(warped)).rgb;
    // Painted features (land, storms) differ from the planet's own color; open sea does not.
    float feature = smoothstep(0.02, 0.2, distance(texel, uBase));
    vec3 color = toLinear(texel);

    float detail = fbm(point * uGrain * DETAIL_SCALE + uSeed);
    color *= 1.0 + uMottle * detail;
    color *= 1.0 + uBands * snoise(vec3(uSeed, warped.y * 9.0, 0.3));

    float cap = step(0.001, uCaps) * smoothstep(uCaps, uCaps + 0.05, abs(warped.y) + 0.04 * push.x);
    color = mix(color, toLinear(uCloudColor), cap);

    // Clouds turn a little faster than the ground under them.
    float cloudTurn = uTime * 0.02;
    vec3 cloudPoint = vec3(
      point.x * cos(cloudTurn) - point.z * sin(cloudTurn),
      point.y,
      point.x * sin(cloudTurn) + point.z * cos(cloudTurn)
    );
    float cover = 0.0;
    if (uClouds > 0.0) {
      cover = uClouds * smoothstep(0.05, 0.55, fbm(cloudPoint * 2.6 + 0.4 * push + uSeed + 7.0));
      color = mix(color, toLinear(uCloudColor), cover);
    }

    vec3 normal = normalize(vNormal);
    vec3 toEye = normalize(cameraPosition - vWorld);
    // An open planet turns its lit side part of the way toward the visitor, like a portrait's
    // fill light: the terminator stays, the surface shows.
    vec3 toSun = normalize(mix(normalize(-vWorld), toEye, uFill));
    float facing = dot(normal, toSun);
    float day = smoothstep(-0.12, 0.6, facing);
    if (uRelief > 0.0) {
      // Ground that rises toward the sun faces away from it, and is darker; ice and clouds
      // lie smooth over it.
      float ahead = fbm(normalize(point + normalize(vLocalSun) * 0.05) * uGrain * DETAIL_SCALE + uSeed);
      float slope = clamp((detail - ahead) * 1.8, -1.0, 1.0);
      day *= 1.0 + RELIEF_SHADE * uRelief * slope * (1.0 - cover) * (1.0 - cap);
    }

    // The rings' shadow: toward the sun, does the light cross a ring first?
    float towardRings = dot(toSun, uRingNormal);
    if (uRingSpan.y > 0.0 && abs(towardRings) > 0.0001) {
      float reach = dot(vCenter - vWorld, uRingNormal) / towardRings;
      float across = length(vWorld + toSun * reach - vCenter);
      float inRings = smoothstep(uRingSpan.x, uRingSpan.x * 1.04, across) * (1.0 - smoothstep(uRingSpan.y * 0.97, uRingSpan.y, across));
      day *= 1.0 - 0.55 * inRings * step(0.0, reach);
    }

    float rim = 1.0 - max(dot(normal, toEye), 0.0);
    vec3 lit = color * (NIGHT + (1.0 - NIGHT) * day);
    lit *= 1.0 - 0.3 * pow(rim, 3.0);

    vec3 halfway = normalize(toSun + toEye);
    float glint = pow(max(dot(normal, halfway), 0.0), 48.0) * uGlint * (1.0 - feature) * (1.0 - cover) * day;
    lit += toLinear(uSunColor) * glint;

    float lights = smoothstep(0.5, 0.7, snoise(point * 34.0 + uSeed)) * feature * (1.0 - cap);
    lit += toLinear(uSunColor) * lights * uNightLights * (1.0 - day) * (1.0 - 0.8 * cover) * 0.5;

    // Air scatters the sun along the edge, on the day side most.
    lit = mix(lit, toLinear(uAirColor), pow(rim, 2.5) * uAir * (0.1 + 0.9 * day) * 0.75);

    gl_FragColor = vec4(pow(lit, vec3(1.0 / 2.2)), uOpacity);
  }
`;

// The air: a shell around the globe that glows where a line of sight passes just over the edge,
// brightest right at it and on the sunlit side.
export const AIR_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  uniform float uRadius;
  uniform float uShellRadius;
  uniform float uStrength;
  uniform float uOpacity;
  varying vec3 vWorld;
  varying vec3 vCenter;

  void main() {
    vec3 ray = normalize(vWorld - cameraPosition);
    vec3 nearest = cameraPosition + ray * dot(vCenter - cameraPosition, ray);
    float distance = length(nearest - vCenter);
    float height = clamp((distance - uRadius) / (uShellRadius - uRadius), 0.0, 1.0);
    float glow = pow(1.0 - height, 3.0) * smoothstep(uRadius * 0.9, uRadius, distance);
    float day = smoothstep(-0.35, 0.4, dot(normalize(nearest - vCenter), normalize(-vCenter)));
    gl_FragColor = vec4(uColor, glow * (0.1 + 0.9 * day) * uStrength * uOpacity);
  }
`;
