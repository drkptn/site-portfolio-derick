/**
 * Black hole fragment shader (TON 618–style quasar look), raw WebGL — no Three.js needed.
 *
 * Built from a few cheap 2D approximations of what a real render shows:
 *  - event-horizon shadow (pure black disc)
 *  - thin, tilted accretion disk in front of the shadow
 *  - the far side of the disk lensed into an arc above and below the shadow
 *  - a sharp photon ring hugging the shadow
 *  - Doppler beaming: the side moving towards the viewer is brighter
 *  - Keplerian turbulence: inner gas orbits faster than outer gas
 */
export const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`

export const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uZoom;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

// Blackbody-ish ramp: deep red -> orange -> gold -> white-hot
vec3 heat(float t) {
  t = clamp(t, 0.0, 1.0);
  vec3 c = mix(vec3(0.35, 0.04, 0.0), vec3(1.0, 0.38, 0.05), smoothstep(0.0, 0.35, t));
  c = mix(c, vec3(1.0, 0.75, 0.32), smoothstep(0.35, 0.7, t));
  return mix(c, vec3(1.0, 0.97, 0.9), smoothstep(0.7, 1.0, t));
}

// Swirling gas texture in polar coordinates (Keplerian shear)
float gas(float r, float a, float t) {
  float omega = 1.6 / pow(max(r, 0.2), 1.5);
  float ang = a + t * omega * 0.35;
  return fbm(vec2(ang * 3.0 / 6.2831 * 6.0, r * 9.0 - t * 0.15)) ;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y) * uZoom;
  float t = uTime;
  float r = length(uv);
  float rs = 0.26;                  // shadow radius
  float tilt = 0.22;                // disk seen almost edge-on (cos of inclination)
  vec3 col = vec3(0.0);

  // ---- Accretion disk (projected ellipse) ----
  vec2 dp = vec2(uv.x, uv.y / tilt);
  float dr = length(dp);
  float da = atan(dp.y, dp.x);
  float inner = 0.34, outer = 1.05;
  float ring = smoothstep(inner, inner + 0.05, dr) * (1.0 - smoothstep(outer * 0.55, outer, dr));
  float temp = 1.0 - smoothstep(inner, outer, dr);
  float g = gas(dr, da, t);
  float doppler = 1.0 + 0.75 * cos(da + 3.1416);         // left side approaches -> brighter
  float diskI = ring * (0.35 + 1.1 * g) * doppler * (0.55 + temp * 1.4);
  // Far half of the disk is hidden by the shadow; near half passes in front of it
  float behind = step(0.0, uv.y) * (1.0 - smoothstep(rs * 0.92, rs * 1.02, r));
  diskI *= 1.0 - behind;
  col += heat(temp * 0.85 + g * 0.35) * diskI;

  // ---- Lensed image of the far side: an arc wrapping over and under the shadow ----
  float lr = r;
  float la = atan(uv.y, uv.x);
  float band = smoothstep(rs * 1.05, rs * 1.25, lr) * (1.0 - smoothstep(rs * 1.35, rs * 2.15, lr));
  float lg = gas(lr * 2.2, la * 1.0, t * 1.1);
  float topBias = 0.45 + 0.55 * abs(uv.y) / max(lr, 1e-3);          // brightest above/below
  float ldop = 1.0 + 0.6 * cos(la + 3.1416);
  float lensI = band * (0.3 + 0.9 * lg) * topBias * ldop * 0.95;
  col += heat(0.5 + lg * 0.35) * lensI;

  // ---- Photon ring ----
  float pr = exp(-pow((r - rs * 1.06) / 0.012, 2.0));
  col += vec3(1.0, 0.86, 0.62) * pr * (0.9 + 0.5 * cos(la + 3.1416));

  // ---- Soft glow / bloom approximation ----
  col += heat(0.45) * 0.22 * exp(-max(r - rs, 0.0) * 4.0) * step(rs, r);
  col += vec3(1.0, 0.55, 0.18) * 0.08 * exp(-abs(uv.y) * 14.0) * (1.0 - smoothstep(0.2, 1.3, abs(uv.x)));

  // ---- Event horizon shadow (applied last: the horizon is truly black) ----
  float shadow = smoothstep(rs * 0.98, rs * 1.03, r);
  // keep the near side of the disk visible in front of the shadow
  float front = step(uv.y, 0.0) * ring;
  col *= mix(1.0, shadow, 1.0 - clamp(front * 2.0, 0.0, 1.0));


  // Tonemap + gentle vignette into the page colour
  col = 1.0 - exp(-col * 1.35);
  float vig = 1.0 - smoothstep(0.75, 1.25, r);
  gl_FragColor = vec4(col * vig, 1.0);
}
`
