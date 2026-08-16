let ctx = null
let master = null
let ambientStarted = false

const PENTATONIC = [261.63, 293.66, 329.63, 392.0, 440.0]

function ensureContext() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    ctx = new AC()
  }
  if (ctx.state === 'suspended') {
    ctx.resume()
  }
  return ctx
}

function startAmbient() {
  if (ambientStarted || !ctx) return
  ambientStarted = true

  const now = ctx.currentTime

  const drone = ctx.createOscillator()
  drone.type = 'sine'
  drone.frequency.setValueAtTime(55, now)

  const droneGain = ctx.createGain()
  droneGain.gain.setValueAtTime(0.0001, now)
  droneGain.gain.exponentialRampToValueAtTime(0.05, now + 1.5)

  const lfo = ctx.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.setValueAtTime(0.15, now)
  const lfoGain = ctx.createGain()
  lfoGain.gain.setValueAtTime(0.03, now)
  lfo.connect(lfoGain)
  lfoGain.connect(droneGain.gain)

  drone.connect(droneGain)
  droneGain.connect(master)
  drone.start(now)
  lfo.start(now)

  scheduleBlips()
}

function scheduleBlips() {
  if (!ctx || !ambientStarted) return

  const delay = 2500 + Math.random() * 3500
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const freq = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)]
  const now = ctx.currentTime + delay / 1000

  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, now)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.035, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)

  osc.connect(gain)
  gain.connect(master)
  osc.start(now)
  osc.stop(now + 0.4)

  setTimeout(scheduleBlips, delay + 400)
}

function tone(freq, { type = 'square', duration = 0.1, volume = 0.08, delay = 0, slideTo = null }) {
  if (!ctx || !master) return
  const now = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, now)
  if (slideTo) {
    osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration)
  }
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  osc.connect(gain)
  gain.connect(master)
  osc.start(now)
  osc.stop(now + duration + 0.05)
}

export function playPlace() {
  tone(740, { type: 'triangle', duration: 0.09, volume: 0.12 })
}

export function playHover() {
  tone(1250, { type: 'sine', duration: 0.035, volume: 0.03 })
}

export function playWin() {
  ;[523, 659, 784, 1047].forEach((f, i) =>
    tone(f, { type: 'square', duration: 0.14, volume: 0.09, delay: i * 0.11 }),
  )
}

export function playLose() {
  ;[523, 415, 349, 262].forEach((f, i) =>
    tone(f, { type: 'square', duration: 0.16, volume: 0.09, delay: i * 0.13 }),
  )
}

export function playDraw() {
  ;[392, 392].forEach((f, i) =>
    tone(f, { type: 'triangle', duration: 0.12, volume: 0.08, delay: i * 0.14 }),
  )
}

export function playCoin() {
  tone(988, { type: 'square', duration: 0.07, volume: 0.08 })
  tone(1319, { type: 'square', duration: 0.16, volume: 0.08, delay: 0.09 })
}

export function initArcadeAudio() {
  if (ctx) return
  const ac = ensureContext()
  master = ac.createGain()
  master.gain.setValueAtTime(1, ac.currentTime)
  master.connect(ac.destination)
  startAmbient()
}
