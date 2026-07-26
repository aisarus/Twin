import { cameraAt, projectWorldPoint } from './camera-path.js'

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max)
const lerp = (a, b, t) => a + (b - a) * t
const smoothstep = (a, b, value) => {
  const t = clamp((value - a) / (b - a))
  return t * t * (3 - 2 * t)
}

class SeededRandom {
  constructor(seed = 8361) { this.seed = seed >>> 0 }
  next() {
    this.seed = (1664525 * this.seed + 1013904223) >>> 0
    return this.seed / 4294967296
  }
}

export class CanvasTwinWorld {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d', { alpha: false })
    this.mode = 'CANVAS FALLBACK'
    this.quality = 0
    this.progress = 0
    this.targetProgress = 0
    this.pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    this.time = 0
    this.random = new SeededRandom()
    this.particles = this.createParticles(760)
    this.terrain = this.createTerrain()
    this.resize()
    window.addEventListener('resize', () => this.resize())
    window.addEventListener('pointermove', event => {
      this.pointer.tx = (event.clientX / window.innerWidth - 0.5) * 2
      this.pointer.ty = (event.clientY / window.innerHeight - 0.5) * 2
    }, { passive: true })
    requestAnimationFrame(time => this.frame(time))
  }

  resize() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.35)
    this.canvas.width = Math.round(this.width * this.dpr)
    this.canvas.height = Math.round(this.height * this.dpr)
    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    this.focal = Math.min(this.width, this.height) * 0.92
  }

  setProgress(progress) { this.targetProgress = clamp(progress) }
  setQuality() { return this.quality }
  cycleQuality() { return this.quality }
  getQualityLabel() { return 'FALLBACK' }
  destroy() {}

  createParticles(count) {
    return Array.from({ length: count }, () => ({
      x: (this.random.next() - 0.5) * 38,
      y: (this.random.next() - 0.36) * 18,
      z: 7 - this.random.next() * 180,
      size: 0.25 + this.random.next() * 1.15,
      pulse: this.random.next() * Math.PI * 2,
      warm: this.random.next() > 0.88,
    }))
  }

  heightAt(x, z) {
    const ridge = Math.exp(-Math.pow(x / (4.1 + Math.abs(z) * 0.035), 2))
    const peakA = Math.exp(-Math.pow((z + 40) / 16, 2)) * 8.4
    const peakB = Math.exp(-Math.pow((z + 91) / 22, 2)) * 14.5
    const peakC = Math.exp(-Math.pow((z + 135) / 13, 2)) * 8.2
    const summit = Math.exp(-Math.pow((z + 169) / 13, 2)) * 16.5
    const erosion = Math.sin(x * 1.35 + z * 0.22) * 0.78 + Math.sin(x * 0.43 - z * 0.39) * 0.48
    return ridge * (peakA + peakB + peakC + summit + erosion) - 5.4 + Math.sin((x + z) * 1.7) * 0.12
  }

  createTerrain() {
    const rows = 70
    const columns = 34
    const result = []
    for (let row = 0; row < rows; row++) {
      const z = -12 - row * 2.25
      const line = []
      for (let column = 0; column < columns; column++) {
        const x = lerp(-18, 18, column / (columns - 1))
        line.push({ x, y: this.heightAt(x, z), z })
      }
      result.push(line)
    }
    return result
  }

  camera() { return cameraAt(this.progress, this.pointer) }

  project(point, camera) {
    return projectWorldPoint([point.x, point.y, point.z], camera, this.width, this.height)
  }

  getProgress() { return this.progress }
  projectPoint(point) { return this.project(point, this.camera()) }

  background() {
    const warm = smoothstep(0.14, 0.2, this.progress) * (1 - smoothstep(0.31, 0.39, this.progress))
    const summit = smoothstep(0.8, 1, this.progress)
    const gradient = this.ctx.createRadialGradient(this.width * 0.5, this.height * 0.42, 0, this.width * 0.5, this.height * 0.5, Math.max(this.width, this.height) * 0.8)
    const r = Math.round(lerp(5, 23, warm) + summit * 3)
    const g = Math.round(lerp(8, 10, warm) + summit * 9)
    const b = Math.round(lerp(10, 7, warm) + summit * 14)
    gradient.addColorStop(0, `rgb(${r + 5},${g + 10},${b + 13})`)
    gradient.addColorStop(1, `rgb(${r},${g},${b})`)
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.width, this.height)
  }

  drawParticles(camera) {
    const mountain = smoothstep(0.2, 0.45, this.progress)
    for (const particle of this.particles) {
      const drift = Math.sin(this.time * 0.00025 + particle.pulse) * 0.13
      const point = this.project({ x: particle.x + drift, y: particle.y, z: particle.z }, camera)
      if (!point || point.x < -20 || point.x > this.width + 20 || point.y < -20 || point.y > this.height + 20) continue
      const alpha = clamp((1 - point.depth / 145) * (0.18 + mountain * 0.55), 0.02, 0.58) * (0.65 + Math.sin(this.time * 0.0015 + particle.pulse) * 0.35)
      const size = clamp(particle.size * point.scale * 0.02, 0.35, 2.1)
      this.ctx.fillStyle = particle.warm ? `rgba(215,126,87,${alpha})` : `rgba(200,224,232,${alpha})`
      this.ctx.fillRect(point.x, point.y, size, size)
    }
  }

  drawTerrain(camera) {
    const reveal = smoothstep(0.2, 0.42, this.progress)
    if (reveal <= 0.01) return
    for (let row = this.terrain.length - 2; row >= 0; row--) {
      const current = this.terrain[row]
      const next = this.terrain[row + 1]
      for (let col = 0; col < current.length - 1; col++) {
        const points = [current[col], current[col + 1], next[col + 1], next[col]].map(point => this.project(point, camera))
        if (points.some(point => !point)) continue
        const averageDepth = points.reduce((sum, point) => sum + point.depth, 0) / 4
        const fog = clamp(1 - averageDepth / 115)
        const lift = clamp((current[col].y + 6) / 17)
        const alpha = reveal * fog * 0.56
        this.ctx.beginPath()
        this.ctx.moveTo(points[0].x, points[0].y)
        for (let i = 1; i < points.length; i++) this.ctx.lineTo(points[i].x, points[i].y)
        this.ctx.closePath()
        this.ctx.fillStyle = `rgba(${Math.round(10 + lift * 24)},${Math.round(23 + lift * 32)},${Math.round(31 + lift * 42)},${alpha})`
        this.ctx.fill()
      }
    }
  }

  drawMonument(camera) {
    const reveal = smoothstep(0.73, 0.92, this.progress)
    if (reveal < 0.01) return
    const project = (x, y, z) => this.project({ x, y, z }, camera)
    const leftBase = project(-1.35, 15.8, -170)
    const leftHead = project(-0.72, 21.55, -170)
    const rightBase = project(1.35, 15.8, -170)
    const rightHead = project(0.72, 21.55, -170)
    const center = project(0, 19.45, -170)
    if (!leftBase || !leftHead || !rightBase || !rightHead || !center) return
    this.ctx.save()
    this.ctx.globalCompositeOperation = 'screen'
    this.ctx.lineCap = 'round'
    this.ctx.strokeStyle = `rgba(123,190,207,${0.34 * reveal})`
    this.ctx.lineWidth = Math.max(1, 5 * leftHead.scale * 0.08)
    this.ctx.beginPath(); this.ctx.moveTo(leftBase.x, leftBase.y); this.ctx.lineTo(leftHead.x, leftHead.y); this.ctx.stroke()
    this.ctx.beginPath(); this.ctx.moveTo(rightBase.x, rightBase.y); this.ctx.lineTo(rightHead.x, rightHead.y); this.ctx.stroke()
    const radius = Math.max(7, center.scale * 4.25)
    this.ctx.strokeStyle = `rgba(137,211,225,${0.22 * reveal})`
    this.ctx.lineWidth = 1
    this.ctx.beginPath(); this.ctx.arc(center.x, center.y, radius, 0, Math.PI * 2); this.ctx.stroke()
    const glow = this.ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, radius * 0.65)
    glow.addColorStop(0, `rgba(153,227,237,${0.28 * reveal})`); glow.addColorStop(1, 'rgba(0,0,0,0)')
    this.ctx.fillStyle = glow; this.ctx.beginPath(); this.ctx.arc(center.x, center.y, radius * 0.65, 0, Math.PI * 2); this.ctx.fill()
    this.ctx.restore()
  }

  drawCore() {
    const exit = smoothstep(0.08, 0.29, this.progress)
    const alpha = 1 - exit
    if (alpha < 0.01) return
    const cx = this.width * 0.5 + this.pointer.x * 14
    const cy = this.height * 0.47 + this.pointer.y * 8 - exit * this.height * 0.25
    const base = Math.min(this.width, this.height) * lerp(0.135, 0.075, exit)
    this.ctx.save()
    this.ctx.translate(cx, cy)
    this.ctx.globalCompositeOperation = 'screen'
    const glow = this.ctx.createRadialGradient(0, 0, 0, 0, 0, base * 2.2)
    glow.addColorStop(0, `rgba(226,211,194,${0.25 * alpha})`)
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    this.ctx.fillStyle = glow
    this.ctx.beginPath(); this.ctx.arc(0, 0, base * 2.2, 0, Math.PI * 2); this.ctx.fill()
    for (let ring = 0; ring < 7; ring++) {
      const radius = base * (0.7 + ring * 0.08)
      this.ctx.beginPath()
      for (let i = 0; i <= 96; i++) {
        const angle = (i / 96) * Math.PI * 2
        const deform = 1 + Math.sin(angle * (3 + ring % 3) + this.time * 0.001 + ring) * 0.07
        const x = Math.cos(angle) * radius * deform
        const y = Math.sin(angle) * radius * deform * (0.74 + ring * 0.022)
        if (i === 0) this.ctx.moveTo(x, y); else this.ctx.lineTo(x, y)
      }
      this.ctx.strokeStyle = `rgba(${210 - ring * 8},${201 - ring * 10},${190 - ring * 11},${alpha * (0.35 - ring * 0.025)})`
      this.ctx.lineWidth = ring === 0 ? 1.3 : 0.7
      this.ctx.stroke()
    }
    this.ctx.restore()
  }

  frame(time) {
    this.time = time
    this.progress += (this.targetProgress - this.progress) * 0.055
    this.pointer.x += (this.pointer.tx - this.pointer.x) * 0.04
    this.pointer.y += (this.pointer.ty - this.pointer.y) * 0.04
    const camera = this.camera()
    this.background()
    this.drawParticles(camera)
    this.drawTerrain(camera)
    this.drawMonument(camera)
    this.drawCore()
    requestAnimationFrame(next => this.frame(next))
  }
}
