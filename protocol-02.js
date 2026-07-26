import { createTwinWorld } from './webgl-world.js'

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max)
const smoothstep = (a, b, value) => {
  const t = clamp((value - a) / (b - a))
  return t * t * (3 - 2 * t)
}

const canvas = document.querySelector('#world')
const world = createTwinWorld(canvas)
const rendererMode = document.querySelector('#renderer-mode')
const qualityToggle = document.querySelector('#quality-toggle')

function syncRendererStatus() {
  rendererMode.textContent = world.mode
  qualityToggle.textContent = `Q / ${world.getQualityLabel()}`
  qualityToggle.setAttribute('aria-label', `Rendering quality: ${world.getQualityLabel()}. Click to change.`)
}

qualityToggle.addEventListener('click', () => {
  world.cycleQuality()
  syncRendererStatus()
})
window.addEventListener('twinqualitychange', syncRendererStatus)
syncRendererStatus()

const loader = document.querySelector('#loader')
const loaderBar = document.querySelector('#loader-bar')
const loaderCount = document.querySelector('#loader-count')
const loaderPhase = document.querySelector('#loader-phase')
const phases = [
  'RECOVERING MEMORY',
  'MAPPING VOICE',
  'COMPILING TERRAIN',
  'LINKING CONTINUITY',
  'INITIALIZING SECOND SELF',
]
const start = performance.now()
const loaderDuration = world.mode.startsWith('WEBGL') ? 2800 : 2200

function loaderFrame(now) {
  const raw = clamp((now - start) / loaderDuration)
  const eased = 1 - Math.pow(1 - raw, 3)
  const count = Math.round(eased * 100)
  loaderBar.style.width = `${count}%`
  loaderCount.textContent = String(count).padStart(3, '0')
  loaderPhase.textContent = phases[Math.min(Math.floor(count / 20), phases.length - 1)]
  if (raw < 1) {
    requestAnimationFrame(loaderFrame)
  } else {
    setTimeout(() => {
      loader.classList.add('loader--done')
      document.body.classList.add('is-ready')
      setTimeout(() => loader.remove(), 900)
    }, 220)
  }
}
requestAnimationFrame(loaderFrame)

const progressLine = document.querySelector('#progress-line')
const progressCount = document.querySelector('#progress-count')
const chapterItems = [...document.querySelectorAll('#progress-chapters li')]
const architecture = document.querySelector('#architecture')
const architectureTrack = document.querySelector('#architecture-track')
const architectureCount = document.querySelector('#architecture-count')
const architectureBar = document.querySelector('#architecture-bar')
const sceneWash = document.querySelector('#scene-wash')
let raf = 0

function updateScroll() {
  const scrollable = Math.max(document.documentElement.scrollHeight - innerHeight, 1)
  const progress = clamp(scrollY / scrollable)
  world.setProgress(progress)
  progressLine.style.height = `${progress * 100}%`
  progressCount.textContent = String(Math.round(progress * 100)).padStart(2, '0')
  chapterItems.forEach((item, index) => item.classList.toggle('is-active', progress >= index / (chapterItems.length - 1) - 0.04))

  const warm = smoothstep(0.12, 0.19, progress) * (1 - smoothstep(0.29, 0.37, progress))
  sceneWash.style.opacity = String(warm * 0.34)

  const rect = architecture.getBoundingClientRect()
  const travel = Math.max(architecture.offsetHeight - innerHeight, 1)
  const local = clamp(-rect.top / travel)
  const mobile = innerWidth <= 800
  const cardTravel = mobile ? 88 : 66
  architectureTrack.style.transform = `translate3d(${local * -cardTravel * 4}vw,0,0)`
  architectureCount.textContent = `${String(Math.round(local * 100)).padStart(2, '0')}%`
  architectureBar.style.width = `${local * 100}%`
  raf = 0
}

function onScroll() {
  if (!raf) raf = requestAnimationFrame(updateScroll)
}
addEventListener('scroll', onScroll, { passive: true })
addEventListener('resize', onScroll)
updateScroll()

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('in-view')
  })
}, { threshold: 0.15 })

document.querySelectorAll('section h2, section h3, .origin__large, .layers__item, .ascent__route li, .trajectory__paths span')
  .forEach(element => observer.observe(element))
