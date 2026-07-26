import './protocol-04.js'

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max)
const canvas = document.querySelector('#models3d')
const textToggle = document.querySelector('#text-toggle')
let stage = null

async function initializeThreeStage() {
  try {
    const { ThreeNarrativeStage } = await import('./three-stage.js')
    stage = new ThreeNarrativeStage(canvas)
    document.documentElement.dataset.threeStage = 'ready'
    updateProductionScroll()
  } catch (error) {
    console.warn('[TWIN] Three.js narrative stage unavailable.', error)
    document.documentElement.dataset.threeStage = 'fallback'
    canvas.hidden = true
  }
}
initializeThreeStage()

function applyTextMode(enabled) {
  document.documentElement.classList.toggle('text-boost', enabled)
  textToggle.textContent = `TEXT / ${enabled ? 'MAX' : 'STD'}`
  textToggle.setAttribute('aria-pressed', String(enabled))
  localStorage.setItem('twin-text-boost', enabled ? '1' : '0')
}

applyTextMode(localStorage.getItem('twin-text-boost') === '1')
textToggle.addEventListener('click', () => applyTextMode(!document.documentElement.classList.contains('text-boost')))

let raf = 0
function updateProductionScroll() {
  const scrollable = Math.max(document.documentElement.scrollHeight - innerHeight, 1)
  const progress = clamp(scrollY / scrollable)
  if (stage) stage.setProgress(progress)
  document.documentElement.style.setProperty('--production-progress', progress.toFixed(4))
  raf = 0
}
function onProductionScroll() {
  if (!raf) raf = requestAnimationFrame(updateProductionScroll)
}
addEventListener('scroll', onProductionScroll, { passive: true })
addEventListener('resize', onProductionScroll)
updateProductionScroll()

document.documentElement.dataset.protocol = '05'
