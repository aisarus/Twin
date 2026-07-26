const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max)
const lerp = (a, b, t) => a + (b - a) * t

export class TwinSoundscape {
  constructor() {
    this.context = null
    this.enabled = false
    this.progress = 0
    this.lastMarker = -1
    this.nodes = []
  }

  async ensureContext() {
    if (this.context) return this.context
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) throw new Error('Web Audio is unavailable')
    const context = new AudioContext()
    this.context = context

    this.master = context.createGain()
    this.master.gain.value = 0
    this.master.connect(context.destination)

    this.lowpass = context.createBiquadFilter()
    this.lowpass.type = 'lowpass'
    this.lowpass.frequency.value = 420
    this.lowpass.Q.value = 0.45
    this.lowpass.connect(this.master)

    this.droneGain = context.createGain()
    this.droneGain.gain.value = 0.16
    this.droneGain.connect(this.lowpass)

    const root = context.createOscillator()
    root.type = 'sine'
    root.frequency.value = 43.65
    root.detune.value = -4
    root.connect(this.droneGain)
    root.start()

    const overtone = context.createOscillator()
    overtone.type = 'triangle'
    overtone.frequency.value = 65.41
    overtone.detune.value = 5
    const overtoneGain = context.createGain()
    overtoneGain.gain.value = 0.045
    overtone.connect(overtoneGain).connect(this.lowpass)
    overtone.start()

    const noiseBuffer = context.createBuffer(1, context.sampleRate * 4, context.sampleRate)
    const channel = noiseBuffer.getChannelData(0)
    let previous = 0
    for (let i = 0; i < channel.length; i++) {
      const white = Math.random() * 2 - 1
      previous = previous * 0.985 + white * 0.015
      channel[i] = previous * 1.8
    }
    const noise = context.createBufferSource()
    noise.buffer = noiseBuffer
    noise.loop = true
    const noiseFilter = context.createBiquadFilter()
    noiseFilter.type = 'bandpass'
    noiseFilter.frequency.value = 580
    noiseFilter.Q.value = 0.38
    this.noiseGain = context.createGain()
    this.noiseGain.gain.value = 0.032
    noise.connect(noiseFilter).connect(this.noiseGain).connect(this.lowpass)
    noise.start()

    this.root = root
    this.overtone = overtone
    this.noiseFilter = noiseFilter
    this.nodes.push(root, overtone, noise)
    return context
  }

  async toggle() {
    await this.ensureContext()
    if (this.context.state === 'suspended') await this.context.resume()
    this.enabled = !this.enabled
    const now = this.context.currentTime
    this.master.gain.cancelScheduledValues(now)
    this.master.gain.setValueAtTime(this.master.gain.value, now)
    this.master.gain.linearRampToValueAtTime(this.enabled ? 0.48 : 0, now + 0.75)
    return this.enabled
  }

  setProgress(progress) {
    this.progress = clamp(progress)
    if (!this.context) return
    const now = this.context.currentTime
    const summit = Math.max(0, (this.progress - 0.72) / 0.28)
    const warm = Math.max(0, Math.min(1, (this.progress - 0.13) / 0.08)) * (1 - Math.max(0, Math.min(1, (this.progress - 0.29) / 0.09)))
    this.lowpass.frequency.setTargetAtTime(lerp(280, 1040, summit) + warm * 180, now, 0.35)
    this.noiseFilter.frequency.setTargetAtTime(lerp(430, 860, this.progress), now, 0.5)
    this.root.frequency.setTargetAtTime(lerp(43.65, 49.0, summit), now, 0.8)
    this.overtone.frequency.setTargetAtTime(lerp(65.41, 73.42, summit), now, 0.8)
    this.droneGain.gain.setTargetAtTime(0.12 + summit * 0.08 + warm * 0.025, now, 0.5)
    this.noiseGain.gain.setTargetAtTime(0.025 + (1 - summit) * 0.018, now, 0.8)

    const marker = Math.floor(this.progress * 8)
    if (this.enabled && marker > this.lastMarker && marker > 0) this.triggerMemory(marker)
    this.lastMarker = Math.max(this.lastMarker, marker)
  }

  triggerMemory(index) {
    if (!this.context || !this.enabled) return
    const now = this.context.currentTime
    const oscillator = this.context.createOscillator()
    const gain = this.context.createGain()
    const filter = this.context.createBiquadFilter()
    const frequencies = [196, 220, 246.94, 293.66, 329.63, 392]
    oscillator.type = index % 2 ? 'sine' : 'triangle'
    oscillator.frequency.value = frequencies[index % frequencies.length]
    filter.type = 'lowpass'
    filter.frequency.value = 1500
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.055, now + 0.035)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4)
    oscillator.connect(filter).connect(gain).connect(this.master)
    oscillator.start(now)
    oscillator.stop(now + 2.5)
  }

  getLabel() { return this.enabled ? 'ON' : 'OFF' }
}
