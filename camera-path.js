const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max)

const CAMERA_KEYS = [
  { p: 0.00, position: [0.0, 0.7, 12.0], target: [0.0, 0.2, -8.0], lens: 1.34, roll: 0.000 },
  { p: 0.08, position: [-0.3, 1.0, 7.0], target: [-0.2, 0.5, -19.0], lens: 1.27, roll: -0.008 },
  { p: 0.18, position: [-1.7, 1.6, -8.0], target: [-1.8, 1.4, -39.0], lens: 1.18, roll: -0.018 },
  { p: 0.29, position: [2.8, 2.7, -35.0], target: [0.3, 3.4, -66.0], lens: 1.13, roll: 0.018 },
  { p: 0.42, position: [-4.4, 5.1, -65.0], target: [1.2, 6.8, -94.0], lens: 1.08, roll: -0.026 },
  { p: 0.57, position: [4.8, 7.6, -94.0], target: [-1.0, 10.0, -124.0], lens: 1.04, roll: 0.024 },
  { p: 0.72, position: [-3.7, 11.0, -124.0], target: [0.4, 15.0, -153.0], lens: 1.07, roll: -0.018 },
  { p: 0.86, position: [2.5, 15.2, -149.0], target: [0.0, 19.0, -170.0], lens: 1.12, roll: 0.010 },
  { p: 1.00, position: [0.0, 21.0, -160.0], target: [0.0, 18.0, -194.0], lens: 1.18, roll: 0.000 },
]

function catmull(a, b, c, d, t) {
  const t2 = t * t
  const t3 = t2 * t
  return 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
}

function catmullVector(a, b, c, d, t) {
  return [
    catmull(a[0], b[0], c[0], d[0], t),
    catmull(a[1], b[1], c[1], d[1], t),
    catmull(a[2], b[2], c[2], d[2], t),
  ]
}

function findSegment(progress) {
  const p = clamp(progress)
  let index = CAMERA_KEYS.length - 2
  for (let i = 0; i < CAMERA_KEYS.length - 1; i++) {
    if (p <= CAMERA_KEYS[i + 1].p) {
      index = i
      break
    }
  }
  const current = CAMERA_KEYS[index]
  const next = CAMERA_KEYS[index + 1]
  const local = clamp((p - current.p) / Math.max(next.p - current.p, 0.0001))
  return { index, local }
}

export function cameraAt(progress, pointer = { x: 0, y: 0 }) {
  const { index, local } = findSegment(progress)
  const a = CAMERA_KEYS[Math.max(0, index - 1)]
  const b = CAMERA_KEYS[index]
  const c = CAMERA_KEYS[index + 1]
  const d = CAMERA_KEYS[Math.min(CAMERA_KEYS.length - 1, index + 2)]
  const eased = local * local * (3 - 2 * local)
  const position = catmullVector(a.position, b.position, c.position, d.position, eased)
  const target = catmullVector(a.target, b.target, c.target, d.target, eased)
  const lens = catmull(a.lens, b.lens, c.lens, d.lens, eased)
  const roll = catmull(a.roll, b.roll, c.roll, d.roll, eased)

  position[0] += pointer.x * 0.52
  position[1] -= pointer.y * 0.25
  target[0] += pointer.x * 0.15
  target[1] -= pointer.y * 0.10

  return { position, target, lens, roll, segment: index }
}

function subtract(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]] }
function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] }
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]] }
function normalize(v) {
  const length = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0] / length, v[1] / length, v[2] / length]
}

export function projectWorldPoint(point, camera, width, height) {
  const forward = normalize(subtract(camera.target, camera.position))
  let right = normalize(cross(forward, [0, 1, 0]))
  let up = normalize(cross(right, forward))
  if (camera.roll) {
    const cosine = Math.cos(camera.roll)
    const sine = Math.sin(camera.roll)
    const rolledRight = [
      right[0] * cosine + up[0] * sine,
      right[1] * cosine + up[1] * sine,
      right[2] * cosine + up[2] * sine,
    ]
    const rolledUp = [
      up[0] * cosine - right[0] * sine,
      up[1] * cosine - right[1] * sine,
      up[2] * cosine - right[2] * sine,
    ]
    right = rolledRight
    up = rolledUp
  }

  const relative = subtract(point, camera.position)
  const depth = dot(relative, forward)
  if (depth <= 0.2) return null
  const viewX = dot(relative, right)
  const viewY = dot(relative, up)
  const scale = camera.lens * height * 0.5 / depth
  const x = width * 0.5 + viewX * scale
  const y = height * 0.5 - viewY * scale
  const margin = Math.max(width, height) * 0.18
  return {
    x,
    y,
    depth,
    scale,
    visible: x > -margin && x < width + margin && y > -margin && y < height + margin,
  }
}

export const CAMERA_CHAPTERS = [
  { name: 'SIGNAL', start: 0.00, end: 0.14 },
  { name: 'ORIGIN', start: 0.14, end: 0.31 },
  { name: 'IDENTITY', start: 0.31, end: 0.48 },
  { name: 'SYSTEM', start: 0.48, end: 0.66 },
  { name: 'ASCENT', start: 0.66, end: 0.86 },
  { name: 'HORIZON', start: 0.86, end: 1.01 },
]
