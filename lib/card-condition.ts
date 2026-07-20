/**
 * CS:GO-style float (0.00–1.00) mapped to PSA grades and visual wear.
 * Lower float = better condition, like Factory New in Counter-Strike.
 *
 * Wear is rendered by compositing high-resolution grayscale grime/wear
 * texture maps (in /public/textures) over the card art with CSS blend modes,
 * with intensity + layout driven by the float and a per-copy pattern seed.
 */

export interface PsaBand {
  grade: number
  label: string
  /** Inclusive lower bound */
  minFloat: number
  /** Exclusive upper bound (1.0 is inclusive for PSA 1) */
  maxFloat: number
  /** Representative float for previews */
  sampleFloat: number
}

export const PSA_BANDS: PsaBand[] = [
  { grade: 10, label: 'Gem Mint', minFloat: 0, maxFloat: 0.03, sampleFloat: 0.012 },
  { grade: 9, label: 'Mint', minFloat: 0.03, maxFloat: 0.08, sampleFloat: 0.055 },
  { grade: 8, label: 'NM-MT', minFloat: 0.08, maxFloat: 0.15, sampleFloat: 0.11 },
  { grade: 7, label: 'Near Mint', minFloat: 0.15, maxFloat: 0.25, sampleFloat: 0.19 },
  { grade: 6, label: 'Ex-MT', minFloat: 0.25, maxFloat: 0.4, sampleFloat: 0.32 },
  { grade: 5, label: 'Excellent', minFloat: 0.4, maxFloat: 0.55, sampleFloat: 0.47 },
  { grade: 4, label: 'VG-Ex', minFloat: 0.55, maxFloat: 0.68, sampleFloat: 0.61 },
  { grade: 3, label: 'Very Good', minFloat: 0.68, maxFloat: 0.78, sampleFloat: 0.73 },
  { grade: 2, label: 'Good', minFloat: 0.78, maxFloat: 0.9, sampleFloat: 0.84 },
  { grade: 1, label: 'Poor', minFloat: 0.9, maxFloat: 1, sampleFloat: 0.96 },
]

export interface CardCondition {
  float: number
  psaGrade: number
  label: string
  /** Normalised wear amount used for visuals (0 = pristine, 1 = destroyed) */
  wear: number
}

export type BlendMode = 'screen' | 'multiply' | 'overlay' | 'soft-light'

export interface WearVisuals {
  saturation: number
  brightness: number
  contrast: number
  yellowing: number
  /** Premium glossy sheen for high grades (fades as wear rises) */
  gloss: number
  tiltX: number
  tiltY: number
  offsetX: number
}

export interface WearTextureLayer {
  src: string
  blend: BlendMode
  opacity: number
  /** Seeded flip/rotate so the same map reads differently per copy */
  transform: string
}

/** Round for stable SSR/client output. */
function round(value: number, places = 3): number {
  const factor = 10 ** places
  return Math.round(value * factor) / factor
}

/** Mulberry32 — small, fast, well-distributed seeded PRNG. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Smoothstep easing for nicer ramps than a raw linear/pow curve. */
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

/** Clamp and round a float to two decimal places for display. */
export function formatFloat(float: number): string {
  return Math.max(0, Math.min(1, float)).toFixed(2)
}

/** Map a 0–1 float to a PSA grade band. */
export function floatToCondition(float: number): CardCondition {
  const f = Math.max(0, Math.min(1, float))
  const band =
    PSA_BANDS.find((b) =>
      b.grade === 1
        ? f >= b.minFloat && f <= b.maxFloat
        : f >= b.minFloat && f < b.maxFloat,
    ) ?? PSA_BANDS[PSA_BANDS.length - 1]

  return {
    float: f,
    psaGrade: band.grade,
    label: band.label,
    wear: Math.pow(f, 0.9),
  }
}

/** Turn a float into a stable default pattern seed. */
export function defaultSeed(float: number): number {
  return Math.floor(float * 1000) * 2654435761
}

/** Colour / geometry degradation (physical wear comes from texture layers). */
export function getWearVisuals(
  float: number,
  seed: number = defaultSeed(float),
): WearVisuals {
  const { wear } = floatToCondition(float)
  const w = wear
  const rand = mulberry32((seed || 1) ^ 0x9e3779b9)

  return {
    saturation: round(1 - w * 0.3),
    brightness: round(1 - w * 0.08),
    contrast: round(1 - w * 0.06),
    yellowing: round(w * 0.3),
    gloss: round((1 - smoothstep(0, 0.22, w)) * 0.5),
    tiltX: round((rand() - 0.5) * w * 2),
    tiltY: round((rand() - 0.5) * w * 1.3),
    offsetX: round((rand() - 0.5) * w * 2.6),
  }
}

interface TextureDef {
  src: string
  blend: BlendMode
  /** Wear at which the layer begins to appear */
  start: number
  /** Peak opacity at maximum wear */
  max: number
}

/**
 * Grayscale wear maps composited over the art. Ordered bottom → top.
 * `screen` maps drop their black; `multiply` maps drop their white.
 */
const TEXTURES: TextureDef[] = [
  { src: '/textures/wear-fingerprints.png', blend: 'multiply', start: 0.04, max: 0.55 },
  { src: '/textures/wear-grime-dust.png', blend: 'multiply', start: 0.16, max: 0.72 },
  { src: '/textures/wear-scratches-fine.png', blend: 'screen', start: 0.05, max: 0.6 },
  { src: '/textures/wear-scuffs-heavy.png', blend: 'screen', start: 0.34, max: 0.62 },
  { src: '/textures/wear-edges.png', blend: 'screen', start: 0.12, max: 0.9 },
  { src: '/textures/wear-creases.png', blend: 'soft-light', start: 0.5, max: 0.7 },
]

/** Build the active texture overlay stack for a given float + seed. */
export function getWearTextures(
  float: number,
  seed: number = defaultSeed(float),
): WearTextureLayer[] {
  const { wear } = floatToCondition(float)
  const rand = mulberry32(seed || 1)

  const layers: WearTextureLayer[] = []
  for (const tex of TEXTURES) {
    // Advance the RNG once per texture so each has stable, distinct variation.
    const flipX = rand() > 0.5 ? -1 : 1
    const flipY = rand() > 0.5 ? -1 : 1
    const jitter = 0.85 + rand() * 0.3

    // The edge frame must not flip vertically/horizontally in a way that
    // matters, but flips are harmless since it's symmetric-ish; keep it simple.
    const ramp = smoothstep(tex.start, 1, wear)
    const opacity = round(Math.min(tex.max, ramp * tex.max * jitter))
    if (opacity < 0.02) continue

    layers.push({
      src: tex.src,
      blend: tex.blend,
      opacity,
      transform: `scale(${flipX}, ${flipY})`,
    })
  }
  return layers
}

/** Roll a random float for a newly pulled card (weighted toward mid grades). */
export function rollCardFloat(): number {
  const r1 = Math.random()
  const r2 = Math.random()
  const skewed = Math.pow(r1 * r2, 0.65)
  return Math.round(skewed * 100) / 100
}

/** Roll a random pattern seed for a newly pulled card. */
export function rollPatternSeed(): number {
  return Math.floor(Math.random() * 0xffffffff)
}
