import { CanvasTwinWorld } from './fallback-world.js'
import { cameraAt, projectWorldPoint } from './camera-path.js'

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max)
const lerp = (a, b, t) => a + (b - a) * t
const smoothstep = (a, b, value) => {
  const t = clamp((value - a) / (b - a))
  return t * t * (3 - 2 * t)
}

const vertexSource = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

const fragmentSource = `#version 300 es
precision highp float;
precision highp int;

in vec2 v_uv;
out vec4 outColor;

uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_time;
uniform float u_progress;
uniform float u_warm;
uniform float u_summit;
uniform int u_quality;
uniform vec3 u_cameraPos;
uniform vec3 u_cameraTarget;
uniform float u_lens;
uniform float u_cameraRoll;

#define PI 3.14159265359
#define MAX_STEPS 68
#define MIST_STEPS 8
#define MATERIAL_TERRAIN 0.0
#define MATERIAL_TWIN 1.0
#define MATERIAL_SIGNAL 2.0

float saturate(float x) { return clamp(x, 0.0, 1.0); }
float hash11(float p) { return fract(sin(p * 127.1) * 43758.5453123); }
float hash21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
vec2 hash22(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.52;
  mat2 rotation = mat2(0.80, -0.60, 0.60, 0.80);
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise2(p);
    p = rotation * p * 2.03 + 11.7;
    amplitude *= 0.49;
  }
  return value;
}

float peak(float z, float center, float width, float height) {
  float q = (z - center) / width;
  return exp(-q * q) * height;
}

float terrainHeight(vec2 xz) {
  float x = xz.x;
  float z = xz.y;
  float span = 3.7 + abs(z) * 0.034;
  float ridge = exp(-pow(x / span, 2.0));
  float spine = peak(z, -39.0, 16.0, 8.6)
              + peak(z, -91.0, 22.0, 14.8)
              + peak(z, -137.0, 15.0, 10.0)
              + peak(z, -169.0, 13.0, 16.5);
  float broad = peak(z, -72.0, 51.0, 3.0) + peak(z, -154.0, 34.0, 5.8);
  float largeNoise = noise2(vec2(x * 0.16, z * 0.075));
  float detailNoise = noise2(vec2(x * 0.43, z * 0.19) + 17.3);
  float erosion = (largeNoise - 0.5) * 3.8 + (detailNoise - 0.5) * 1.15;
  float strata = sin(x * 1.12 + z * 0.18) * 0.42 + sin(x * 0.36 - z * 0.41) * 0.28;
  float sideRidges = exp(-pow((abs(x) - 8.0) / 4.5, 2.0)) * sin(z * 0.17 + abs(x) * 0.8) * 1.2;
  return -5.6 + ridge * (spine + broad + erosion + strata) + sideRidges;
}

vec3 terrainNormal(vec3 p) {
  float e = u_quality == 0 ? 0.22 : 0.10;
  float h = terrainHeight(p.xz);
  return normalize(vec3(
    h - terrainHeight(p.xz + vec2(e, 0.0)),
    e,
    h - terrainHeight(p.xz + vec2(0.0, e))
  ));
}

float sdSphere(vec3 p, float radius) { return length(p) - radius; }
float sdCapsule(vec3 p, vec3 a, vec3 b, float radius) {
  vec3 pa = p - a;
  vec3 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - radius;
}
float sdRoundBox(vec3 p, vec3 halfSize, float radius) {
  vec3 q = abs(p) - halfSize;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - radius;
}
float sdTorusZ(vec3 p, vec2 radii) {
  vec2 q = vec2(length(p.xy) - radii.x, p.z);
  return length(q) - radii.y;
}

float monumentMap(vec3 p, out float material) {
  vec3 q = p - vec3(0.0, 19.0, -170.0);
  float leftBody = sdCapsule(q, vec3(-1.35, -3.2, 0.0), vec3(-0.85, 1.65, 0.0), 0.54);
  float rightBody = sdCapsule(q, vec3(1.35, -3.2, 0.0), vec3(0.85, 1.65, 0.0), 0.54);
  float leftHead = sdSphere(q - vec3(-0.72, 2.55, 0.0), 0.76);
  float rightHead = sdSphere(q - vec3(0.72, 2.55, 0.0), 0.76);
  float shoulders = sdCapsule(q, vec3(-1.15, 0.85, 0.0), vec3(1.15, 0.85, 0.0), 0.28);
  float bodies = min(min(leftBody, rightBody), min(leftHead, rightHead));
  bodies = min(bodies, shoulders);
  float plinth = sdRoundBox(q - vec3(0.0, -3.75, 0.0), vec3(3.8, 0.34, 1.65), 0.22);
  float halo = sdTorusZ(q - vec3(0.0, 0.6, 0.45), vec2(4.25, 0.075));
  float signal = sdSphere(q - vec3(0.0, 0.45, -0.15), 0.25);
  float darkForm = min(bodies, plinth);
  float luminous = min(halo, signal);
  if (luminous < darkForm) {
    material = MATERIAL_SIGNAL;
    return luminous;
  }
  material = MATERIAL_TWIN;
  return darkForm;
}

float sceneDistance(vec3 p, out float material) {
  float ground = p.y - terrainHeight(p.xz);
  float monumentMaterial = MATERIAL_TWIN;
  float monument = monumentMap(p, monumentMaterial);
  if (monument < ground) {
    material = monumentMaterial;
    return monument;
  }
  material = MATERIAL_TERRAIN;
  return ground;
}

vec3 monumentNormal(vec3 p) {
  float e = u_quality == 0 ? 0.025 : 0.012;
  float m;
  float center = monumentMap(p, m);
  return normalize(vec3(
    monumentMap(p + vec3(e, 0.0, 0.0), m) - center,
    monumentMap(p + vec3(0.0, e, 0.0), m) - center,
    monumentMap(p + vec3(0.0, 0.0, e), m) - center
  ));
}

float raymarchScene(vec3 ro, vec3 rd, out vec3 hitPos, out float travel, out float material) {
  float t = 0.3;
  float maxDistance = mix(122.0, 205.0, float(u_quality) / 2.0);
  int stepLimit = u_quality == 0 ? 36 : (u_quality == 1 ? 56 : 74);
  float hit = 0.0;
  material = MATERIAL_TERRAIN;
  for (int i = 0; i < 74; i++) {
    if (i >= stepLimit) break;
    vec3 p = ro + rd * t;
    float sampleMaterial;
    float distanceToScene = sceneDistance(p, sampleMaterial);
    float epsilon = 0.015 + t * 0.00145;
    if (distanceToScene < epsilon) {
      hit = 1.0;
      hitPos = p;
      travel = t;
      material = sampleMaterial;
      break;
    }
    t += clamp(distanceToScene * 0.52, 0.045, 2.8);
    if (t > maxDistance || p.y > 44.0) break;
  }
  if (hit < 0.5) {
    hitPos = ro + rd * t;
    travel = t;
  }
  return hit;
}

float cloudDensity(vec2 p, float threshold) {
  float n = fbm(p);
  n += 0.18 * noise2(p * 3.1 + 4.0);
  return smoothstep(threshold, 0.86, n);
}

vec4 cloudLayer(vec3 ro, vec3 rd, float height, float scale, float drift, float softness) {
  float denom = rd.y;
  if (abs(denom) < 0.015) return vec4(0.0);
  float t = (height - ro.y) / denom;
  if (t < 0.0 || t > 190.0) return vec4(0.0);
  vec2 p = (ro.xz + rd.xz * t) * scale;
  p += vec2(u_time * drift, -u_time * drift * 0.37);
  float density = cloudDensity(p, softness);
  float horizonFade = 1.0 - smoothstep(18.0, 190.0, t);
  float directional = smoothstep(-0.22, 0.42, rd.y + 0.18);
  return vec4(vec3(density), density * horizonFade * directional);
}

float volumetricMist(vec3 ro, vec3 rd, float maxTravel) {
  int sampleLimit = u_quality == 0 ? 4 : (u_quality == 1 ? 6 : 8);
  float limit = min(maxTravel, 76.0);
  float accumulation = 0.0;
  for (int i = 0; i < MIST_STEPS; i++) {
    if (i >= sampleLimit) break;
    float fi = float(i);
    float jitter = hash11(fi * 19.7 + floor(u_time * 0.35)) * 0.65;
    float t = (fi + 0.35 + jitter) / float(sampleLimit) * limit;
    vec3 p = ro + rd * t;
    vec2 flow = p.xz * 0.055 + vec2(p.y * 0.11, -p.y * 0.07) + vec2(u_time * 0.008, 0.0);
    float density = noise2(flow) * 0.68 + noise2(flow * 2.17 + 9.4) * 0.32;
    density = smoothstep(0.53, 0.84, density);
    float valley = exp(-abs(p.y - 1.4) * 0.17) + exp(-abs(p.y - 8.0) * 0.24) * 0.36;
    float distanceFade = 1.0 - t / max(limit, 0.001);
    accumulation += density * valley * distanceFade;
  }
  return saturate(accumulation / float(sampleLimit) * 1.85);
}

float particles(vec2 uv, vec3 ro, vec3 rd) {
  vec2 grid = uv * vec2(92.0, 54.0);
  vec2 cell = floor(grid);
  vec2 local = fract(grid) - 0.5;
  float id = hash21(cell);
  vec2 jitter = hash22(cell) - 0.5;
  float point = smoothstep(0.055, 0.0, length(local - jitter * 0.72));
  float flicker = 0.45 + 0.55 * sin(u_time * (0.8 + id * 2.2) + id * 31.0);
  float depthBand = smoothstep(0.08, 0.55, hash21(cell + floor(ro.z * 0.07)));
  float reveal = mix(0.28, 1.0, smoothstep(0.12, 0.42, u_progress));
  return point * flicker * depthBand * reveal * 0.54;
}

vec3 skyColor(vec3 rd) {
  float horizon = pow(saturate(1.0 - abs(rd.y + 0.02)), 3.0);
  vec3 dark = mix(vec3(0.012, 0.021, 0.027), vec3(0.045, 0.019, 0.012), u_warm);
  vec3 upper = mix(vec3(0.028, 0.065, 0.085), vec3(0.12, 0.038, 0.017), u_warm);
  upper = mix(upper, vec3(0.09, 0.17, 0.22), u_summit);
  vec3 color = mix(dark, upper, saturate(rd.y * 0.75 + 0.52));
  color += horizon * mix(vec3(0.035, 0.078, 0.095), vec3(0.17, 0.055, 0.022), u_warm);
  vec3 sunDir = normalize(vec3(-0.38, 0.26, -0.88));
  float halo = pow(saturate(dot(rd, sunDir)), 15.0);
  color += halo * mix(vec3(0.22, 0.35, 0.42), vec3(0.52, 0.18, 0.07), u_warm) * (0.16 + u_summit * 0.36);
  return color;
}

vec3 shadeTerrain(vec3 p, vec3 rd, float travel) {
  vec3 normal = terrainNormal(p);
  vec3 lightDir = normalize(vec3(-0.48, 0.72, 0.38));
  float diffuse = saturate(dot(normal, lightDir));
  float rim = pow(saturate(1.0 - dot(normal, -rd)), 3.0);
  float altitude = saturate((p.y + 6.0) / 28.0);
  float stratum = 0.5 + 0.5 * sin(p.y * 5.2 + fbm(p.xz * 0.24) * 5.0);
  float memoryBand = pow(saturate(1.0 - abs(sin((p.z + fbm(p.xz * 0.12) * 8.0) * 0.34))), 18.0);
  float memoryWindow = smoothstep(-152.0, -34.0, p.z) * (1.0 - smoothstep(-24.0, -10.0, p.z));
  vec3 shadow = mix(vec3(0.010, 0.028, 0.038), vec3(0.056, 0.019, 0.011), u_warm);
  vec3 lit = mix(vec3(0.10, 0.19, 0.23), vec3(0.34, 0.105, 0.045), u_warm);
  lit = mix(lit, vec3(0.17, 0.30, 0.34), u_summit * 0.45);
  vec3 color = mix(shadow, lit, diffuse * 0.78 + altitude * 0.18);
  color += rim * mix(vec3(0.15, 0.29, 0.34), vec3(0.38, 0.12, 0.05), u_warm) * 0.38;
  color += stratum * 0.018 * (0.35 + altitude);
  color += mix(vec3(0.10, 0.38, 0.46), vec3(0.78, 0.25, 0.10), u_warm) * memoryBand * memoryWindow * 0.16;
  float summitIce = (1.0 - smoothstep(-174.0, -158.0, p.z)) * pow(saturate(normal.y), 3.0);
  color += vec3(0.19, 0.37, 0.43) * summitIce * u_summit * 0.25;
  float fog = 1.0 - exp(-travel * mix(0.026, 0.016, u_summit));
  fog += (fbm(p.xz * 0.035 + u_time * 0.004) - 0.5) * 0.12;
  return mix(color, skyColor(rd) * 0.82, saturate(fog));
}

vec3 shadeMonument(vec3 p, vec3 rd, float travel, float material) {
  vec3 normal = monumentNormal(p);
  vec3 lightDir = normalize(vec3(-0.42, 0.67, 0.54));
  float diffuse = saturate(dot(normal, lightDir));
  float rim = pow(saturate(1.0 - dot(normal, -rd)), 2.2);
  if (material > 1.5) {
    float pulse = 0.78 + 0.22 * sin(u_time * 1.7);
    vec3 signal = mix(vec3(0.44, 0.78, 0.88), vec3(0.93, 0.42, 0.20), u_warm * 0.45);
    return signal * (1.35 + pulse * 0.75 + rim);
  }
  vec3 obsidian = mix(vec3(0.018, 0.028, 0.034), vec3(0.055, 0.023, 0.018), u_warm);
  vec3 edge = mix(vec3(0.20, 0.42, 0.49), vec3(0.63, 0.19, 0.08), u_warm);
  vec3 color = obsidian + edge * (diffuse * 0.18 + rim * 0.58);
  float seam = pow(saturate(1.0 - abs(sin((p.y + p.x * 0.4) * 4.6))), 26.0);
  color += edge * seam * 0.07;
  float fog = 1.0 - exp(-travel * 0.012);
  return mix(color, skyColor(rd) * 0.74, fog);
}

vec3 coreOverlay(vec2 uv, vec3 background) {
  float exit = smoothstep(0.07, 0.29, u_progress);
  float alpha = 1.0 - exit;
  if (alpha <= 0.001) return background;
  vec2 center = vec2(0.0, 0.055) + u_pointer * vec2(0.025, -0.017);
  vec2 q = uv - center;
  q.x *= u_resolution.x / u_resolution.y;
  float angle = atan(q.y, q.x);
  float radius = length(q);
  float breathing = 1.0 + sin(u_time * 1.34) * 0.025;
  float edge = 0.128 * breathing * (1.0 + sin(angle * 5.0 + u_time * 0.72) * 0.045 + sin(angle * 9.0 - u_time * 0.43) * 0.018);
  float shell = smoothstep(0.010, 0.0, abs(radius - edge));
  float inner = smoothstep(edge, 0.0, radius);
  float glow = exp(-radius * 14.0) * 0.78 + exp(-radius * 4.2) * 0.13;
  float rings = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float ellipse = length(vec2(q.x, q.y / (0.32 + fi * 0.075)));
    float ringRadius = 0.16 + fi * 0.023 + sin(u_time * (0.25 + fi * 0.03) + fi) * 0.004;
    rings += smoothstep(0.004, 0.0, abs(ellipse - ringRadius)) * (0.18 - fi * 0.024);
  }
  vec3 coreColor = mix(vec3(0.77, 0.86, 0.88), vec3(0.94, 0.56, 0.36), u_warm * 0.65);
  vec3 result = background + coreColor * (glow * 0.42 + shell * 0.84 + rings) * alpha;
  result = mix(result, coreColor * 0.42 + result, inner * 0.18 * alpha);
  return result;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = (frag * 2.0 - u_resolution.xy) / u_resolution.y;

  vec3 forward = normalize(u_cameraTarget - u_cameraPos);
  vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
  vec3 up = normalize(cross(right, forward));
  float cosine = cos(u_cameraRoll);
  float sine = sin(u_cameraRoll);
  vec3 rolledRight = right * cosine + up * sine;
  vec3 rolledUp = up * cosine - right * sine;
  vec3 rd = normalize(forward * u_lens + rolledRight * uv.x + rolledUp * uv.y);

  vec3 color = skyColor(rd);
  float terrainReveal = smoothstep(0.17, 0.36, u_progress);
  vec3 hitPos;
  float travel;
  float material;
  float rawHit = raymarchScene(u_cameraPos, rd, hitPos, travel, material);
  if (rawHit > 0.5) {
    vec3 surfaceColor = material < 0.5 ? shadeTerrain(hitPos, rd, travel) : shadeMonument(hitPos, rd, travel, material);
    color = mix(color, surfaceColor, terrainReveal);
  }

  vec4 lowCloud = cloudLayer(u_cameraPos, rd, 2.2, 0.050, 0.0048, 0.50);
  vec4 midCloud = cloudLayer(u_cameraPos, rd, 8.5, 0.037, -0.0032, 0.52);
  vec4 highCloud = cloudLayer(u_cameraPos, rd, 15.5, 0.026, 0.0020, 0.55);
  float cloudReveal = smoothstep(0.20, 0.47, u_progress) * (0.55 + 0.45 * u_summit);
  vec3 cloudTint = mix(vec3(0.18, 0.28, 0.32), vec3(0.40, 0.14, 0.065), u_warm);
  cloudTint = mix(cloudTint, vec3(0.29, 0.42, 0.46), u_summit * 0.6);
  float cloudAlpha = saturate((lowCloud.a * 0.55 + midCloud.a * 0.50 + highCloud.a * 0.34) * cloudReveal);
  color = mix(color, cloudTint, cloudAlpha * (rawHit > 0.5 ? 0.48 : 0.82));

  float mist = volumetricMist(u_cameraPos, rd, rawHit > 0.5 ? travel : 76.0) * terrainReveal;
  vec3 mistTint = mix(vec3(0.10, 0.19, 0.23), vec3(0.31, 0.085, 0.035), u_warm);
  mistTint = mix(mistTint, vec3(0.19, 0.31, 0.35), u_summit * 0.62);
  color = mix(color, mistTint, mist * (rawHit > 0.5 ? 0.43 : 0.62));

  float stars = particles(v_uv, u_cameraPos, rd);
  color += mix(vec3(0.42, 0.65, 0.72), vec3(0.80, 0.34, 0.17), u_warm) * stars;

  float horizonBeam = pow(saturate(dot(rd, normalize(vec3(0.0, 0.06, -1.0)))), 90.0) * u_summit;
  color += vec3(0.34, 0.61, 0.70) * horizonBeam * 0.72;

  color = coreOverlay(uv, color);

  float vignette = smoothstep(1.45, 0.28, length(uv * vec2(0.74, 0.92)));
  color *= mix(0.57, 1.0, vignette);
  float grain = hash21(frag + fract(u_time) * 173.0) - 0.5;
  color += grain * 0.025;
  color = pow(max(color, 0.0), vec3(0.92));

  outColor = vec4(color, 1.0);
}`

function compileShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || 'Unknown shader compilation error'
    gl.deleteShader(shader)
    throw new Error(message)
  }
  return shader
}

function createProgram(gl) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource)
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  gl.deleteShader(vertexShader)
  gl.deleteShader(fragmentShader)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) || 'Unknown WebGL program link error'
    gl.deleteProgram(program)
    throw new Error(message)
  }
  return program
}

class WebGLTwinWorld {
  constructor(canvas) {
    this.canvas = canvas
    this.gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    })
    if (!this.gl) throw new Error('WebGL 2 is unavailable')

    this.mode = 'WEBGL / PROTOCOL 0.3'
    this.program = createProgram(this.gl)
    this.progress = 0
    this.targetProgress = 0
    this.pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
    this.quality = this.pickInitialQuality()
    this.renderScale = [0.56, 0.72, 0.90][this.quality]
    this.frameSamples = []
    this.lastFrameTime = performance.now()
    this.frameCount = 0
    this.adaptiveLocked = false
    this.startTime = performance.now()
    this.locations = this.getLocations()
    this.createGeometry()
    this.bindEvents()
    this.resize()
    requestAnimationFrame(time => this.frame(time))
  }

  pickInitialQuality() {
    const memory = navigator.deviceMemory || 4
    const cores = navigator.hardwareConcurrency || 4
    const mobile = matchMedia('(max-width: 800px)').matches
    if (this.reducedMotion || mobile || memory <= 3 || cores <= 4) return 0
    if (memory >= 8 && cores >= 8) return 2
    return 1
  }

  getLocations() {
    const gl = this.gl
    const uniform = name => gl.getUniformLocation(this.program, name)
    return {
      position: gl.getAttribLocation(this.program, 'a_position'),
      resolution: uniform('u_resolution'), pointer: uniform('u_pointer'), time: uniform('u_time'),
      progress: uniform('u_progress'), warm: uniform('u_warm'), summit: uniform('u_summit'),
      quality: uniform('u_quality'), cameraPos: uniform('u_cameraPos'), cameraTarget: uniform('u_cameraTarget'),
      lens: uniform('u_lens'), cameraRoll: uniform('u_cameraRoll'),
    }
  }

  createGeometry() {
    const gl = this.gl
    this.vao = gl.createVertexArray()
    gl.bindVertexArray(this.vao)
    this.buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(this.locations.position)
    gl.vertexAttribPointer(this.locations.position, 2, gl.FLOAT, false, 0, 0)
    gl.bindVertexArray(null)
  }

  bindEvents() {
    this.resizeHandler = () => this.resize()
    this.pointerHandler = event => {
      this.pointer.tx = (event.clientX / window.innerWidth - 0.5) * 2
      this.pointer.ty = (event.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('resize', this.resizeHandler)
    window.addEventListener('pointermove', this.pointerHandler, { passive: true })
    this.canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault()
      document.documentElement.dataset.renderer = 'lost'
    })
    this.canvas.addEventListener('webglcontextrestored', () => location.reload())
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const width = Math.max(1, Math.round(innerWidth * dpr * this.renderScale))
    const height = Math.max(1, Math.round(innerHeight * dpr * this.renderScale))
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width
      this.canvas.height = height
      this.canvas.style.width = `${innerWidth}px`
      this.canvas.style.height = `${innerHeight}px`
      this.gl.viewport(0, 0, width, height)
    }
  }

  setProgress(progress) { this.targetProgress = clamp(progress) }
  getProgress() { return this.progress }
  projectPoint(point) {
    return projectWorldPoint([point.x, point.y, point.z], cameraAt(this.progress, this.pointer), innerWidth, innerHeight)
  }

  setQuality(level, lock = true) {
    this.quality = clamp(Math.round(level), 0, 2)
    this.renderScale = [0.56, 0.72, 0.90][this.quality]
    this.adaptiveLocked = lock
    this.resize()
    window.dispatchEvent(new CustomEvent('twinqualitychange', { detail: { quality: this.quality, label: this.getQualityLabel() } }))
    return this.quality
  }

  cycleQuality() { return this.setQuality((this.quality + 1) % 3, true) }
  getQualityLabel() { return ['LOW', 'MED', 'HIGH'][this.quality] }

  adaptQuality(frameTime) {
    if (this.adaptiveLocked || this.frameCount < 150) return
    this.frameSamples.push(frameTime)
    if (this.frameSamples.length < 90) return
    const average = this.frameSamples.reduce((sum, value) => sum + value, 0) / this.frameSamples.length
    this.frameSamples.length = 0
    if (average > 25 && this.quality > 0) this.setQuality(this.quality - 1, false)
    if (average < 14.5 && this.quality < 2) this.setQuality(this.quality + 1, false)
  }

  frame(now) {
    const frameTime = now - this.lastFrameTime
    this.lastFrameTime = now
    this.frameCount++
    this.adaptQuality(frameTime)
    this.progress += (this.targetProgress - this.progress) * (this.reducedMotion ? 0.18 : 0.055)
    this.pointer.x += (this.pointer.tx - this.pointer.x) * 0.042
    this.pointer.y += (this.pointer.ty - this.pointer.y) * 0.042

    const gl = this.gl
    const elapsed = (now - this.startTime) / 1000
    const camera = cameraAt(this.progress, this.pointer)
    const warm = smoothstep(0.13, 0.20, this.progress) * (1 - smoothstep(0.29, 0.38, this.progress))
    const summit = smoothstep(0.79, 0.98, this.progress)

    gl.useProgram(this.program)
    gl.bindVertexArray(this.vao)
    gl.uniform2f(this.locations.resolution, this.canvas.width, this.canvas.height)
    gl.uniform2f(this.locations.pointer, this.pointer.x, this.pointer.y)
    gl.uniform1f(this.locations.time, elapsed)
    gl.uniform1f(this.locations.progress, this.progress)
    gl.uniform1f(this.locations.warm, warm)
    gl.uniform1f(this.locations.summit, summit)
    gl.uniform1i(this.locations.quality, this.quality)
    gl.uniform3fv(this.locations.cameraPos, camera.position)
    gl.uniform3fv(this.locations.cameraTarget, camera.target)
    gl.uniform1f(this.locations.lens, camera.lens)
    gl.uniform1f(this.locations.cameraRoll, camera.roll)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    gl.bindVertexArray(null)

    requestAnimationFrame(next => this.frame(next))
  }

  destroy() {
    window.removeEventListener('resize', this.resizeHandler)
    window.removeEventListener('pointermove', this.pointerHandler)
    this.gl.deleteBuffer(this.buffer)
    this.gl.deleteVertexArray(this.vao)
    this.gl.deleteProgram(this.program)
  }
}

export function createTwinWorld(canvas) {
  try {
    const world = new WebGLTwinWorld(canvas)
    document.documentElement.dataset.renderer = 'webgl'
    return world
  } catch (error) {
    console.warn('[TWIN] WebGL renderer failed; using Canvas fallback.', error)
    document.documentElement.dataset.renderer = 'canvas'
    const fallbackCanvas = canvas.cloneNode(false)
    canvas.replaceWith(fallbackCanvas)
    return new CanvasTwinWorld(fallbackCanvas)
  }
}
