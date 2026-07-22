/**
 * Pack reveal sound effects backed by static assets in /public/sounds.
 */

const STORAGE_KEY = 'packrip-sound-muted'

type SoundName = 'flip' | 'fanfare'

const SOUND_SRC: Record<SoundName, string> = {
  flip: '/sounds/card-flip.mp3',
  fanfare: '/sounds/fanfare.mp3',
}

let muted = false
const listeners = new Set<() => void>()
const pool = new Map<SoundName, HTMLAudioElement[]>()

function readMutedFromStorage(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(STORAGE_KEY) === '1'
}

if (typeof window !== 'undefined') {
  muted = readMutedFromStorage()
}

function getAudio(name: SoundName): HTMLAudioElement {
  const src = SOUND_SRC[name]
  const stack = pool.get(name) ?? []
  const idle = stack.find((el) => el.paused || el.ended)

  if (idle) {
    idle.currentTime = 0
    return idle
  }

  const audio = new Audio(src)
  audio.preload = 'auto'
  stack.push(audio)
  pool.set(name, stack)
  return audio
}

/** Warm audio elements on first user gesture (browser autoplay policy). */
export function primeAudio(): void {
  if (typeof window === 'undefined' || muted) return
  for (const name of Object.keys(SOUND_SRC) as SoundName[]) {
    getAudio(name)
  }
}

export function isSoundMuted(): boolean {
  return muted
}

export function setSoundMuted(value: boolean): void {
  muted = value
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, value ? '1' : '0')
  }
  if (value) {
    for (const stack of pool.values()) {
      for (const audio of stack) {
        audio.pause()
        audio.currentTime = 0
      }
    }
  }
  listeners.forEach((l) => l())
}

export function subscribeSoundSettings(cb: () => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function playSound(name: SoundName): void {
  if (muted || typeof window === 'undefined') return
  const audio = getAudio(name)
  void audio.play().catch(() => {})
}
