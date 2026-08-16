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

export function initArcadeAudio() {
  if (ctx) return
  const ac = ensureContext()
  master = ac.createGain()
  master.gain.setValueAtTime(1, ac.currentTime)
  master.connect(ac.destination)
  startAmbient()
}
