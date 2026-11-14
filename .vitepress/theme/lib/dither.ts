/*
  Arte pontilhada (1 bit) gerada no navegador.
  Cada cena devolve uma imagem em tons de cinza (0 = tinta, 1 = papel), que passa
  pelo pontilhado de Atkinson e vira pontos na cor de tinta do tema.
*/

export type Gray = Float32Array
type Rand = () => number
type Scene = (w: number, h: number, r: Rand) => Gray

export function rng(seed: number): Rand {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

function make(w: number, h: number, px: (x: number, y: number) => number): Gray {
  const g = new Float32Array(w * h)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) g[y * w + x] = clamp(px(x, y))
  return g
}

const mar: Scene = (w, h, r) => {
  const hz = Math.round(h * 0.62), sx = w * 0.68, sy = h * 0.38, sr = h * 0.2
  return make(w, h, (x, y) => {
    let v: number
    if (y < hz) {
      v = 0.97 - 0.3 * (y / hz)
      const d = Math.hypot(x - sx, y - sy)
      if (d < sr) v = 1
      else if (d < sr * 2.4) v += 0.22 * (1 - (d - sr) / (sr * 1.4))
      const ridge = hz - (h * 0.12 + h * 0.07 * Math.sin(x / 23) + h * 0.04 * Math.sin(x / 9 + 1))
      if (x < w * 0.5 && y > ridge) v = 0.3
    } else {
      const t = (y - hz) / (h - hz)
      v = 0.55 - 0.4 * t
      if (Math.abs(x - sx) < sr * (1.1 + t * 1.6) && r() < 0.55 - t * 0.3) v = 0.95
      if ((y - hz) % 4 === 0 && r() < 0.25) v += 0.3
    }
    return v + (r() - 0.5) * 0.06
  })
}

const lua: Scene = (w, h, r) => {
  const mx = w * 0.3, my = h * 0.38, mr = h * 0.2
  const craters = [[-0.3, -0.2, 0.25], [0.35, 0.1, 0.2], [-0.05, 0.45, 0.16], [0.2, -0.45, 0.12]]
  return make(w, h, (x, y) => {
    let v = 0.12 + 0.28 * (y / h)
    if (r() < 0.006) v = 1
    const d = Math.hypot(x - mx, y - my)
    if (d < mr) {
      v = 0.95
      for (const [cx, cy, cr] of craters) if (Math.hypot(x - (mx + cx * mr), y - (my + cy * mr)) < cr * mr) v = 0.7
      v -= 0.25 * Math.max(0, (x - mx) / mr)
    } else if (d < mr * 2) v += 0.25 * (1 - (d - mr) / mr)
    const hill = h * 0.8 - h * 0.08 * Math.sin(x / 31 + 2) - h * 0.04 * Math.sin(x / 11)
    if (y > hill) v = 0.02
    return v
  })
}

const cidade: Scene = (w, h, r) => {
  const cols: { top: number; x0: number; lit: number }[] = []
  let x0 = 0
  while (x0 < w) {
    const bw = 8 + Math.floor(r() * 18), top = h * (0.25 + r() * 0.5), lit = r()
    for (let i = x0; i < Math.min(w, x0 + bw); i++) cols[i] = { top, x0, lit }
    x0 += bw + (r() < 0.3 ? 2 : 0)
  }
  return make(w, h, (x, y) => {
    let v = 0.98 - 0.35 * (y / h)
    if (Math.hypot(x - w * 0.5, y - h * 0.55) < h * 0.3) v = Math.min(1, v + 0.2)
    const b = cols[x]
    if (b && y > b.top) {
      v = 0.16
      const lx = x - b.x0, ly = Math.floor(y - b.top)
      if (lx % 4 >= 2 && ly % 5 >= 2 && ly > 2 && r() < b.lit * 0.9) v = 0.9
    }
    if (y > h * 0.92) v = 0.05
    return v
  })
}

const serra: Scene = (w, h, r) => {
  const layers = [0, 1, 2, 3].map((k) => {
    const ph = r() * 10, base = h * (0.35 + k * 0.15), amp = h * (0.16 - k * 0.025)
    return (x: number) => base - amp * (0.6 * Math.sin(x / (40 - ph) + ph) + 0.3 * Math.sin(x / 13 + ph * 2) + 0.1 * Math.sin(x / 4.3))
  })
  return make(w, h, (x, y) => {
    let v = 0.96 - 0.15 * (y / h)
    layers.forEach((ridge, k) => {
      const ry = ridge(x)
      if (y > ry) v = 0.78 - k * 0.2 + (k < 3 ? 0.15 * clamp((y - ry) / (h * 0.25)) : 0)
    })
    return v + (r() - 0.5) * 0.05
  })
}

const ondas: Scene = (w, h, r) => {
  const hz = h * 0.3
  return make(w, h, (x, y) => {
    if (y < hz) return 0.95 - 0.2 * (y / hz) + (Math.hypot(x - w * 0.8, y - hz * 0.5) < 14 ? 0.1 : 0)
    const t = (y - hz) / (h - hz)
    const s = Math.sin((y - hz) / (2.4 + t * 3) + 2.6 * Math.sin(x / (16 + t * 20) + y / 27))
    let v = 0.55 + 0.42 * s * (0.4 + t * 0.6) - 0.15 * t
    if (s > 0.92 && r() < 0.7) v = 1
    return v
  })
}

const planeta: Scene = (w, h, r) => {
  const cx = w * 0.5, cy = h * 0.5, pr = h * 0.3, L = [-0.55, -0.5, 0.67]
  return make(w, h, (x, y) => {
    let v = 0.06
    if (r() < 0.005) v = 1
    const nx = (x - cx) / pr, ny = (y - cy) / pr, q = nx * nx + ny * ny
    const ex = (x - cx) / (pr * 2.1), ey = (y - cy) / (pr * 0.42), e = ex * ex + ey * ey
    const onRing = e > 0.72 && e < 1 && !(e > 0.84 && e < 0.88)
    if (onRing && !(q < 1 && y < cy)) v = 0.75 + 0.2 * (1 - Math.abs(ex))
    if (q < 1 && !(onRing && y >= cy)) {
      const nz = Math.sqrt(1 - q), dot = nx * L[0] + ny * L[1] + nz * L[2]
      v = 0.05 + 0.95 * Math.max(0, dot) + 0.08 * Math.sin(ny * 14)
    }
    return v
  })
}

/* exclusiva da 404: barras de teste de TV com chuvisco, "sem sinal" */
const sinal: Scene = (w, h, r) => {
  const lv = [0.97, 0.82, 0.68, 0.55, 0.42, 0.28, 0.12]
  const top = Math.round(h * 0.6), mid = Math.round(h * 0.7), shift = new Array(h).fill(0)
  for (let k = 0; k < 5; k++) {
    const s = Math.floor(r() * top), len = 2 + Math.floor(r() * 4), off = 8 + Math.floor(r() * 40)
    for (let j = s; j < Math.min(top, s + len); j++) shift[j] = off
  }
  return make(w, h, (x, y) => {
    const xs = (x + shift[y]) % w, band = Math.floor((xs / w) * 7)
    let v: number
    if (y < top) v = lv[band]
    else if (y < mid) v = band % 2 === 0 ? lv[6 - band] : 0.95
    else {
      v = r() < 0.5 ? 0.9 : 0.15
      if (x > w * 0.36 && x < w * 0.64 && y > mid + 5 && y < h - 5) v = 0.06
    }
    const cx = Math.min(x, w - 1 - x), cy = Math.min(y, h - 1 - y), rad = 12
    if (cx < rad && cy < rad && Math.hypot(rad - cx, rad - cy) > rad) v = 1
    return v
  })
}

export const SCENES: Record<string, Scene> = { mar, lua, cidade, serra, ondas, planeta, sinal }
/* cenas que entram no sorteio (a "sinal" fica só para a 404) */
export const RANDOM_SCENES = ['mar', 'lua', 'cidade', 'serra', 'ondas', 'planeta']

/* pontilhado de Atkinson: devolve 1 onde vai tinta */
export function atkinson(g: Gray, w: number, h: number): Uint8Array {
  const out = new Uint8Array(w * h)
  const sp = [[1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [0, 2]]
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x, old = g[i], nv = old < 0.5 ? 0 : 1, err = (old - nv) / 8
      out[i] = nv === 0 ? 1 : 0
      for (const [dx, dy] of sp) {
        const nx = x + dx, ny = y + dy
        if (nx >= 0 && nx < w && ny < h) g[ny * w + nx] += err
      }
    }
  return out
}

const cache = new Map<string, Uint8Array>()
export function sceneBits(scene: string, seed: number, w: number, h: number): Uint8Array {
  const key = `${scene}:${seed}:${w}x${h}`
  let bits = cache.get(key)
  if (!bits) {
    bits = atkinson(SCENES[scene](w, h, rng(seed)), w, h)
    cache.set(key, bits)
  }
  return bits
}

function rgb(c: string): [number, number, number] | null {
  c = c.trim()
  if (!c || c === 'transparent') return null
  if (c[0] === '#') {
    const n = parseInt(c.slice(1), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  const m = c.match(/\d+/g)
  return m ? [Number(m[0]), Number(m[1]), Number(m[2])] : null
}

/* pinta os bits no canvas com a tinta e o "papel" do tema atual (tokens --img-ink e --img-paper) */
export function paintBits(cv: HTMLCanvasElement, bits: Uint8Array, inkCss?: string, paperCss?: string) {
  const css = getComputedStyle(document.documentElement)
  const ink = rgb(inkCss ?? css.getPropertyValue('--img-ink')) ?? [0, 0, 0]
  const paper = rgb(paperCss ?? css.getPropertyValue('--img-paper'))
  const ctx = cv.getContext('2d')
  if (!ctx) return
  const img = ctx.createImageData(cv.width, cv.height)
  for (let i = 0; i < bits.length; i++) {
    const c = bits[i] ? ink : paper
    if (!c) continue
    img.data[i * 4] = c[0]
    img.data[i * 4 + 1] = c[1]
    img.data[i * 4 + 2] = c[2]
    img.data[i * 4 + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
}
