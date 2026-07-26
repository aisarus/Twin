import { createTwinWorld } from './webgl-world-03.js'
import { TwinSoundscape } from './soundscape.js'
import { CAMERA_CHAPTERS } from './camera-path.js'

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max)
const smoothstep = (a, b, value) => {
  const t = clamp((value - a) / Math.max(b - a, 0.0001))
  return t * t * (3 - 2 * t)
}

const canvas = document.querySelector('#world')
const world = createTwinWorld(canvas)
const soundscape = new TwinSoundscape()
const rendererMode = document.querySelector('#renderer-mode')
const qualityToggle = document.querySelector('#quality-toggle')
const soundToggle = document.querySelector('#sound-toggle')

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

soundToggle.addEventListener('click', async () => {
  try {
    const enabled = await soundscape.toggle()
    soundToggle.textContent = `SOUND / ${enabled ? 'ON' : 'OFF'}`
    soundToggle.setAttribute('aria-pressed', String(enabled))
    document.body.classList.toggle('sound-on', enabled)
  } catch (error) {
    console.warn('[TWIN] Soundscape unavailable.', error)
    soundToggle.textContent = 'SOUND / N/A'
    soundToggle.disabled = true
  }
})

const loader = document.querySelector('#loader')
const loaderBar = document.querySelector('#loader-bar')
const loaderCount = document.querySelector('#loader-count')
const loaderPhase = document.querySelector('#loader-phase')
const phases = [
  'RECOVERING MEMORY',
  'MAPPING VOICE',
  'SYNTHESIZING TERRAIN',
  'CALIBRATING CAMERA PATH',
  'LINKING CONTINUITY',
  'INITIALIZING SECOND SELF',
]
const start = performance.now()
const loaderDuration = world.mode.startsWith('WEBGL') ? 3100 : 2300

function loaderFrame(now) {
  const raw = clamp((now - start) / loaderDuration)
  const eased = 1 - Math.pow(1 - raw, 3)
  const count = Math.round(eased * 100)
  loaderBar.style.width = `${count}%`
  loaderCount.textContent = String(count).padStart(3, '0')
  loaderPhase.textContent = phases[Math.min(Math.floor(count / (100 / phases.length)), phases.length - 1)]
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
const memoryFragments = [...document.querySelectorAll('.memory-fragment')]
const chapterTransition = document.querySelector('#scene-transition')
const chapterTransitionIndex = chapterTransition.querySelector('span')
const chapterTransitionName = chapterTransition.querySelector('strong')
let currentChapter = -1
let chapterTimer = 0
let raf = 0

function setChapter(progress) {
  const index = CAMERA_CHAPTERS.findIndex(chapter => progress >= chapter.start && progress < chapter.end)
  const resolved = index < 0 ? CAMERA_CHAPTERS.length - 1 : index
  if (resolved === currentChapter) return
  currentChapter = resolved
  const chapter = CAMERA_CHAPTERS[resolved]
  document.documentElement.dataset.chapter = chapter.name.toLowerCase()
  chapterTransitionIndex.textContent = String(resolved + 1).padStart(2, '0')
  chapterTransitionName.textContent = chapter.name
  chapterTransition.classList.remove('is-visible')
  requestAnimationFrame(() => chapterTransition.classList.add('is-visible'))
  clearTimeout(chapterTimer)
  chapterTimer = setTimeout(() => chapterTransition.classList.remove('is-visible'), 1250)
}

function updateScroll() {
  const scrollable = Math.max(document.documentElement.scrollHeight - innerHeight, 1)
  const progress = clamp(scrollY / scrollable)
  world.setProgress(progress)
  soundscape.setProgress(progress)
  setChapter(progress)
  progressLine.style.height = `${progress * 100}%`
  progressCount.textContent = String(Math.round(progress * 100)).padStart(2, '0')
  chapterItems.forEach((item, index) => item.classList.toggle('is-active', progress >= index / (chapterItems.length - 1) - 0.04))

  const warm = smoothstep(0.12, 0.19, progress) * (1 - smoothstep(0.29, 0.37, progress))
  sceneWash.style.opacity = String(warm * 0.30)

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

function updateMemoryField() {
  const progress = typeof world.getProgress === 'function' ? world.getProgress() : 0
  soundscape.setProgress(progress)
  for (const fragment of memoryFragments) {
    const start = Number(fragment.dataset.start)
    const end = Number(fragment.dataset.end)
    const fade = smoothstep(start, start + 0.035, progress) * (1 - smoothstep(end - 0.04, end, progress))
    if (fade < 0.002 || typeof world.projectPoint !== 'function') {
      fragment.style.opacity = '0'
      fragment.dataset.visible = 'false'
      continue
    }
    const projected = world.projectPoint({
      x: Number(fragment.dataset.x),
      y: Number(fragment.dataset.y),
      z: Number(fragment.dataset.z),
    })
    if (!projected || !projected.visible) {
      fragment.style.opacity = '0'
      fragment.dataset.visible = 'false'
      continue
    }
    const depthFade = clamp(1 - projected.depth / 118, 0.22, 1)
    const scale = clamp(projected.scale * 0.065, 0.58, 1.08)
    const blur = clamp((projected.depth - 42) / 65, 0, 1.8)
    fragment.style.setProperty('--memory-x', `${projected.x}px`)
    fragment.style.setProperty('--memory-y', `${projected.y}px`)
    fragment.style.setProperty('--memory-scale', scale.toFixed(3))
    fragment.style.setProperty('--memory-blur', `${blur.toFixed(2)}px`)
    fragment.style.opacity = String(fade * depthFade * 0.88)
    fragment.dataset.visible = 'true'
  }
  requestAnimationFrame(updateMemoryField)
}
requestAnimationFrame(updateMemoryField)

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('in-view')
  })
}, { threshold: 0.15 })

document.querySelectorAll('section h2, section h3, .origin__large, .layers__item, .ascent__route li, .trajectory__paths span')
  .forEach(element => observer.observe(element))
