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

/* número pseudoaleatório fixo para uma posição (mesma entrada, mesmo resultado) */
const hash = (a: number, b = 0) => {
  const s = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453
  return s - Math.floor(s)
}
/* desenha traços grossos numa máscara (1 = forma), para silhuetas com linhas: cacto, coqueiros */
function makeMask(w: number, h: number) {
  const m = new Uint8Array(w * h)
  const disc = (cx: number, cy: number, rad: number) => {
    const r2 = rad * rad
    for (let y = Math.floor(cy - rad); y <= Math.ceil(cy + rad); y++)
      for (let x = Math.floor(cx - rad); x <= Math.ceil(cx + rad); x++)
        if (x >= 0 && y >= 0 && x < w && y < h && (x - cx) ** 2 + (y - cy) ** 2 <= r2) m[y * w + x] = 1
  }
  const line = (x0: number, y0: number, x1: number, y1: number, r0: number, r1 = r0) => {
    const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2) + 1
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      disc(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, r0 + (r1 - r0) * t)
    }
  }
  return { m, disc, line }
}

const deserto: Scene = (w, h, r) => {
  const hz = h * 0.58
  const sx = w * 0.7, sy = h * 0.34, sr = h * 0.13
  /* três camadas de dunas, do fundo para a frente: mais claras atrás, mais escuras na frente */
  const layers = [
    { base: h * 0.6, amp: h * 0.05, len: 70, lit: 0.82, dark: 0.6 },
    { base: h * 0.72, amp: h * 0.08, len: 95, lit: 0.7, dark: 0.42 },
    { base: h * 0.88, amp: h * 0.1, len: 130, lit: 0.58, dark: 0.24 }
  ].map((l, k) => ({ ...l, crest: (x: number) => l.base - l.amp * (Math.sin(x / l.len + k * 1.9) + 0.35 * Math.sin(x / (l.len * 0.37) + k)) }))
  /* saguaro: tronco e dois braços com cotovelo, em silhueta */
  const cx = w * 0.17, ground = layers[2].crest(cx) + 3, tall = h * 0.5, th = Math.max(2.2, h * 0.028)
  const { m, line } = makeMask(w, h)
  line(cx, ground, cx, ground - tall, th)
  line(cx, ground - tall * 0.45, cx - th * 3.2, ground - tall * 0.45, th * 0.8)
  line(cx - th * 3.2, ground - tall * 0.45, cx - th * 3.2, ground - tall * 0.8, th * 0.8)
  line(cx, ground - tall * 0.6, cx + th * 3, ground - tall * 0.6, th * 0.75)
  line(cx + th * 3, ground - tall * 0.6, cx + th * 3, ground - tall * 0.92, th * 0.75)
  return make(w, h, (x, y) => {
    if (m[y * w + x]) return 0.03
    /* céu: mais escuro em cima, brilhando perto do horizonte */
    let v = 0.5 + 0.42 * Math.min(1, y / hz)
    const d = Math.hypot(x - sx, y - sy)
    if (d < sr) v = 1
    else if (d < sr * 1.6) v = Math.max(v, 1 - (d - sr) / (sr * 0.6) * 0.15)
    for (const l of layers) {
      const cy = l.crest(x)
      if (y > cy) {
        /* lado virado para o sol (à direita) fica claro; o outro, na sombra */
        const slope = l.crest(x + 1) - cy
        /* sombra gradual conforme a inclinação: sobe para o sol = claro, desce = escuro */
        const k = Math.max(0, Math.min(1, 0.5 + slope * 3))
        v = l.dark + (l.lit - l.dark) * k
        if (y - cy < 1.2) v = l.lit + 0.12
        v += 0.06 * Math.sin((x + y * 3) / 5) * 0.5
      }
    }
    return v + (r() - 0.5) * 0.04
  })
}

const floresta: Scene = (w, h, r) =>
  make(w, h, (x, y) => {
    let v = 0.95 - 0.12 * (y / h)
    for (let k = 0; k < 4; k++) {
      const sp = 16 + 7 * k
      const n = Math.round(x / sp)
      const c = n * sp + (hash(n, k) - 0.5) * sp * 0.6
      const base = h * (0.62 + 0.12 * k)
      const H = h * (0.3 + 0.08 * k) * (0.7 + 0.5 * hash(n + 9, k))
      const top = base - H
      const half = ((y - top) / H) * sp * 0.55
      if (y > top && Math.abs(x - c) < half) v = 0.72 - 0.2 * k + ((y - top) % 5 < 1 ? 0.08 : 0)
      if (y > base) v = Math.min(v, 0.7 - 0.2 * k)
    }
    return v + (r() - 0.5) * 0.05
  })

const chuva: Scene = (w, h, r) => {
  const ground = h * 0.8
  return make(w, h, (x, y) => {
    let v = 0.42 + 0.18 * (y / h)
    const cloud = h * 0.22 + h * 0.06 * Math.sin(x / 23) + h * 0.03 * Math.sin(x / 9)
    if (y < cloud) v = 0.18 + 0.12 * (y / cloud)
    if (y >= ground) v = 0.18 + ((y - ground) % 4 < 1 ? 0.15 : 0)
    const streak = (x + y * 0.45) % 9
    if (y > cloud * 0.6 && y < ground && streak < 1 && hash(Math.floor((x + y * 0.45) / 9), Math.floor(y / 14)) > 0.45) v = 0.9
    if (y >= ground && x % 11 < 1 && r() < 0.6) v = 0.7
    return v
  })
}

const neve: Scene = (w, h, r) => {
  const peak = (x: number) => {
    const p = (x % (w * 0.42)) / (w * 0.42)
    return h * 0.3 + Math.abs(p - 0.5) * h * 0.9 + h * 0.04 * Math.sin(x / 7)
  }
  return make(w, h, (x, y) => {
    let v = 0.62 - 0.25 * (y / h)
    const py = peak(x)
    if (y > py) {
      const shade = peak(x + 1) - py > 0 ? 0.95 : 0.7
      v = y < h * 0.62 ? shade : 0.32 + 0.1 * Math.sin(x / 5)
    }
    if (y > h * 0.86) v = 0.92
    if (r() < 0.025) v = 1
    return v
  })
}

const farol: Scene = (w, h, r) => {
  const lx = w * 0.3, ly = h * 0.3, rock = h * 0.76, sea = h * 0.78
  return make(w, h, (x, y) => {
    let v = 0.22 + 0.15 * (y / h)
    if (r() < 0.004) v = 1
    const ang = Math.atan2(y - ly, x - lx)
    if (x > lx && Math.abs(ang + 0.05) < 0.12) v = Math.max(v, 0.92 - (x - lx) / (w * 1.4))
    if (y >= sea) {
      v = 0.3 + ((y - sea) % 4 < 1 ? 0.2 : 0)
      if (x > lx && Math.abs(x - lx - (y - sea) * 2.5) < 6 && r() < 0.5) v = 0.85
    }
    const half = 2.5 + (y - ly) * 0.07
    if (y > ly && y < rock && Math.abs(x - lx) < half) v = Math.floor((y - ly) / 7) % 2 === 0 ? 0.95 : 0.12
    if (y > ly - 6 && y <= ly && Math.abs(x - lx) < 4) v = 1
    if (y > ly - 9 && y <= ly - 6 && Math.abs(x - lx) < 5) v = 0.05
    if (y > rock - 3 * Math.sin(x / 9) && x < w * 0.5) v = 0.05
    return v
  })
}

const aurora: Scene = (w, h, r) => {
  const ridge = (x: number) => h * 0.78 - h * 0.06 * Math.sin(x / 26) - h * 0.04 * Math.sin(x / 7 + 1)
  return make(w, h, (x, y) => {
    let v = 0.06 + 0.1 * (y / h)
    if (r() < 0.006) v = 1
    for (let k = 0; k < 3; k++) {
      const cy = h * (0.22 + 0.1 * k) + h * 0.07 * Math.sin(x / (38 + 9 * k) + k * 1.7)
      const d = Math.abs(y - cy)
      if (d < h * 0.07) v += 0.55 * (1 - d / (h * 0.07)) * (0.55 + 0.45 * Math.sin(x / 6 + k))
    }
    if (y > ridge(x)) v = 0.02
    return v
  })
}

const campo: Scene = (w, h, r) => {
  const hz = h * 0.4, vx = w * 0.5
  return make(w, h, (x, y) => {
    if (y < hz) {
      let v = 0.98 - 0.18 * (y / hz)
      const d = Math.hypot(x - w * 0.22, y - hz * 0.55)
      if (d < h * 0.1) v = 1
      if (y > hz - 4 - 3 * Math.sin(x / 11) && hash(Math.floor(x / 6)) > 0.6) v = 0.25
      return v
    }
    const t = (y - hz) / (h - hz)
    const u = (x - vx) / (t + 0.04)
    return 0.62 + 0.3 * Math.sin(u / 7) * t - 0.25 * t + (r() - 0.5) * 0.08
  })
}

const ponte: Scene = (w, h, r) => {
  const water = h * 0.7, deck = h * 0.58, top = h * 0.2
  const t1 = w * 0.27, t2 = w * 0.73
  const cable = (x: number) => {
    if (x < t1) return top + (deck - top) * Math.pow(1 - x / t1, 1.4)
    if (x > t2) return top + (deck - top) * Math.pow((x - t2) / (w - t2), 1.4)
    const p = (x - (t1 + t2) / 2) / ((t2 - t1) / 2)
    return top + (deck - 8 - top) * (1 - p * p)
  }
  const at = (x: number, y: number): number => {
    let v = 0.94 - 0.25 * (y / h)
    if (Math.hypot(x - w * 0.5, y - h * 0.34) < h * 0.12) v = 1
    if (Math.abs(x - t1) < 2.5 && y > top && y < water) v = 0.08
    if (Math.abs(x - t2) < 2.5 && y > top && y < water) v = 0.08
    if (Math.abs(y - deck) < 1.6) v = 0.08
    const cy = cable(x)
    if (Math.abs(y - cy) < 1.1) v = 0.08
    if (x % 9 < 1 && y > cy && y < deck && x > 4 && x < w - 4) v = 0.2
    return v
  }
  return make(w, h, (x, y) => {
    if (y < water) return at(x, y)
    const my = 2 * water - y + Math.sin(y / 3 + x / 17) * 1.5
    return 0.15 + 0.6 * at(x, Math.max(0, my)) + (r() - 0.5) * 0.15
  })
}

const estrada: Scene = (w, h, r) => {
  const hz = h * 0.42, vx = w * 0.5
  return make(w, h, (x, y) => {
    if (y < hz) {
      let v = 0.95 - 0.22 * (y / hz)
      const cl = Math.sin(x / 31) + Math.sin(x / 13 + y / 9)
      if (y < hz * 0.6 && cl > 1.2) v = 1
      if (y > hz - 3 && hash(Math.floor(x / 4)) > 0.5) v = 0.3
      return v
    }
    const t = (y - hz) / (h - hz)
    const half = t * w * 0.42 + 1
    let v = 0.6 + (r() - 0.5) * 0.12
    if (Math.abs(x - vx) < half) {
      v = 0.22
      const z = 1 / (t + 0.02)
      if (Math.abs(x - vx) < half * 0.025 + 0.6 && Math.floor(z * 1.2) % 2 === 0) v = 0.95
      if (Math.abs(Math.abs(x - vx) - half * 0.92) < half * 0.02 + 0.5) v = 0.9
    }
    return v
  })
}

const vulcao: Scene = (w, h, r) => {
  const cx = w * 0.46, topY = h * 0.38, baseY = h * 0.95
  const crater = w * 0.045
  /* encosta côncava: estreita no topo, abrindo em curva até a base */
  const halfAt = (y: number) => crater + (w * 0.34) * Math.pow((y - topY) / (baseY - topY), 1.6)
  /* coluna de fumaça: muitos círculos sobrepostos subindo e indo para a direita */
  const puffs = Array.from({ length: 26 }, (_, k) => {
    const t = k / 25
    return {
      x: cx + t * w * 0.38 + Math.sin(t * 7) * w * 0.02,
      y: topY - 3 - t * h * 0.34 - Math.sin(t * 3.2) * h * 0.04,
      rad: h * (0.04 + 0.11 * t) * (0.85 + 0.3 * hash(k, 4))
    }
  })
  const { m, line } = makeMask(w, h)
  /* filetes de lava descendo pelas encostas */
  for (const side of [-1, 1]) {
    let x = cx + side * crater * 0.4, y = topY + 1
    for (let i = 0; i < 18; i++) {
      const ny = y + h * 0.018
      const nx = cx + side * (halfAt(ny) * 0.55) + Math.sin(i * 1.3 + side) * 2
      line(x, y, nx, ny, 0.9, 0.6)
      x = nx
      y = ny
    }
  }
  return make(w, h, (x, y) => {
    let v = 0.62 + 0.3 * (y / h)
    for (const p of puffs) {
      const d = Math.hypot(x - p.x, y - p.y)
      if (d < p.rad) {
        /* fumaça mais clara em cima à esquerda, mais densa embaixo */
        const shade = ((y - p.y) / p.rad + (x - p.x) / p.rad) * 0.1
        v = Math.min(v, 0.26 + shade + 0.14 * ((topY - p.y) / (h * 0.4)))
      }
    }
    if (y > topY && Math.abs(x - cx) < halfAt(y)) {
      v = x < cx ? 0.24 : 0.1
      if (m[y * w + x]) v = 0.92
      if (y < topY + 3 && Math.abs(x - cx) < crater) v = 1
    }
    if (y > baseY) v = 0.06
    return v + (r() - 0.5) * 0.05
  })
}

const eclipse: Scene = (w, h, r) => {
  const cx = w * 0.5, cy = h * 0.5, rad = h * 0.24
  return make(w, h, (x, y) => {
    let v = 0.04
    if (r() < 0.006) v = 0.95
    const d = Math.hypot(x - cx, y - cy)
    const a = Math.atan2(y - cy, x - cx)
    if (d >= rad && d < rad * 1.9) v = Math.max(v, 0.95 * Math.pow(1 - (d - rad) / (rad * 0.9), 1.5) * (0.65 + 0.35 * Math.sin(a * 13)))
    if (d < rad) v = 0.02
    if (Math.hypot(x - (cx + rad * 0.72), y - (cy - rad * 0.72)) < rad * 0.13) v = 1
    return v
  })
}

const nuvens: Scene = (w, h, r) => {
  const blobs: { x: number; y: number; rad: number }[] = []
  for (let c = 0; c < 4; c++) {
    const bx = w * (0.12 + 0.26 * c) + (hash(c, 1) - 0.5) * 30
    const by = h * (0.35 + 0.18 * hash(c, 2))
    for (let k = 0; k < 6; k++) blobs.push({ x: bx + (k - 2.5) * h * 0.08, y: by - Math.sin((k / 5) * Math.PI) * h * 0.1, rad: h * (0.08 + 0.06 * Math.sin((k / 5) * Math.PI)) })
  }
  return make(w, h, (x, y) => {
    let v = 0.55 + 0.35 * (y / h)
    for (const b of blobs) {
      const d = Math.hypot(x - b.x, y - b.y)
      if (d < b.rad) v = Math.max(v, 0.98 - 0.35 * Math.max(0, (y - b.y) / b.rad))
    }
    const hill = h * 0.86 - h * 0.05 * Math.sin(x / 40)
    if (y > hill) v = 0.3
    return v + (r() - 0.5) * 0.04
  })
}

const coqueiros: Scene = (w, h, r) => {
  const hz = h * 0.62
  const sunR = h * 0.17
  const { m, line } = makeMask(w, h)
  const palm = (bx: number, height: number, lean: number) => {
    /* tronco curvo, mais grosso na base, com anéis */
    const n = 14
    let px = bx, py = h
    for (let i = 1; i <= n; i++) {
      const t = i / n
      const nx = bx + lean * height * Math.pow(t, 1.6)
      const ny = h - height * t
      line(px, py, nx, ny, Math.max(1.3, h * 0.022 * (1 - t * 0.5)), Math.max(1.2, h * 0.022 * (1 - t * 0.5)))
      px = nx
      py = ny
    }
    const tx = px, ty = py
    /* folhas: espinha curva que sobe e cai, com folíolos pendendo */
    const fronds = [-2.9, -2.5, -2.1, -1.7, -1.3, -0.9, -0.5]
    for (const a0 of fronds) {
      const dir = Math.cos(a0) < 0 ? -1 : 1
      const len = h * (0.42 + 0.06 * Math.sin(a0 * 3))
      const rise = -Math.sin(a0) * len * 0.45
      let lx = tx, ly = ty
      for (let i = 1; i <= 12; i++) {
        const t = i / 12
        const fx = tx + Math.cos(a0) * len * t
        const fy = ty - rise * Math.sin(t * Math.PI * 0.75) + len * 0.55 * t * t
        line(lx, ly, fx, fy, 1.1 * (1 - t * 0.5))
        const leaf = len * 0.24 * (1 - t * 0.6)
        if (i > 1) {
          line(fx, fy, fx + dir * leaf * 0.35, fy + leaf, 0.6)
          line(fx, fy, fx - dir * leaf * 0.15, fy + leaf * 0.85, 0.6)
        }
        lx = fx
        ly = fy
      }
    }
  }
  palm(w * 0.13, h * 0.78, 0.18)
  palm(w * 0.86, h * 0.64, -0.16)
  return make(w, h, (x, y) => {
    if (m[y * w + x]) return 0.03
    let v: number
    if (y < hz) {
      /* céu do pôr do sol: escuro em cima, claro no horizonte, com o sol meio afundado */
      v = 0.3 + 0.55 * Math.pow(y / hz, 1.3)
      const d = Math.hypot(x - w * 0.5, y - hz)
      if (d < sunR) v = 1
      else if (d < sunR * 1.8) v = Math.max(v, 0.95 - (d - sunR) / (sunR * 0.8) * 0.2)
    } else {
      /* mar escuro com o reflexo do sol em listras */
      const t = (y - hz) / (h - hz)
      v = 0.3 - 0.15 * t
      const reach = sunR * (1 - t * 0.6)
      if (Math.abs(x - w * 0.5) < reach && (y - hz) % 3 < 1.5) v = 0.9 - t * 0.3
    }
    return v + (r() - 0.5) * 0.04
  })
}

const galaxia: Scene = (w, h, r) => {
  const cx = w * 0.5, cy = h * 0.5, R = Math.min(w, h * 1.8) * 0.4
  return make(w, h, (x, y) => {
    const dx = x - cx, dy = (y - cy) * 1.8
    const rr = Math.hypot(dx, dy) + 0.001
    const th = Math.atan2(dy, dx)
    const arms = Math.max(0, Math.cos(2 * (th - Math.log(rr) * 2.4)))
    const fall = Math.exp(-rr / (R * 0.55))
    let v = 0.04 + 0.95 * Math.min(1, Math.exp(-rr / (R * 0.12)) + arms * fall * 0.9)
    if (r() < 0.006) v = 1
    return v
  })
}

export const SCENES: Record<string, Scene> = {
  mar, lua, cidade, serra, ondas, planeta,
  deserto, floresta, chuva, neve, farol, aurora, campo, ponte, estrada, vulcao, eclipse, nuvens, coqueiros, galaxia,
  sinal
}
/* cenas que entram no sorteio (a "sinal" fica só para a 404) */
export const RANDOM_SCENES = [
  'mar', 'lua', 'cidade', 'serra', 'ondas', 'planeta',
  'deserto', 'floresta', 'chuva', 'neve', 'farol', 'aurora', 'campo', 'ponte', 'estrada', 'vulcao', 'eclipse', 'nuvens', 'coqueiros', 'galaxia'
]

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
