import type { Post } from '../data/posts.data'
import { bannerOf, loadBits } from './banners'
import { sceneBits } from './dither'
import { sceneFor } from './sceneFor'

/*
  Desenha a imagem para os stories (1080×1920) num canvas.
  Dois formatos: "capa" (banner, título, subtítulo, tags) e "citacao" (um trecho em destaque).
  O rodapé fica acima da faixa de baixo que o Instagram cobre com o campo de resposta.
*/

export type StoryLayout = 'capa' | 'citacao'
export type StoryTheme = 'white' | 'dark' | 'sepia'

/* mesmas cores de tokens.css */
const T: Record<StoryTheme, { bg: string; ink: string; muted: string; rule: string; bar: string; link: string; imgInk: string; paper: string | null }> = {
  white: { bg: '#fafaf7', ink: '#141414', muted: '#6b6a64', rule: '#d9d7cf', bar: '#ebe9e2', link: '#1f3fae', imgInk: '#141414', paper: null },
  dark: { bg: '#121212', ink: '#dcdad3', muted: '#8b8981', rule: '#2f2e2b', bar: '#1f1f1d', link: '#93a9e0', imgInk: '#141414', paper: '#d9d7cf' },
  sepia: { bg: '#f1e7d0', ink: '#3b2f22', muted: '#7d6a52', rule: '#d8c8a6', bar: '#e5d6b6', link: '#8b2e1a', imgInk: '#3b2f22', paper: null }
}
const SERIF = '"Source Serif 4", Georgia, serif'
const MONO = '"IBM Plex Mono", "Courier New", monospace'

function hex(c: string): [number, number, number] {
  const n = parseInt(c.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function bitsCanvas(bits: Uint8Array, w: number, h: number, ink: string, paper: string | null) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(w, h)
  const i0 = hex(ink), p0 = paper ? hex(paper) : null
  for (let i = 0; i < bits.length; i++) {
    const col = bits[i] ? i0 : p0
    if (!col) continue
    img.data.set([col[0], col[1], col[2], 255], i * 4)
  }
  ctx.putImageData(img, 0, 0)
  return c
}

async function postBits(p: Post): Promise<{ bits: Uint8Array; w: number; h: number }> {
  const b = bannerOf(p)
  if (b?.dither) {
    try {
      return await loadBits(b.dither)
    } catch {
      /* sem banner: cai na cena */
    }
  }
  const s = sceneFor(p)
  return { bits: sceneBits(s.scene, s.seed, 340, 190), w: 340, h: 190 }
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const lines: string[] = []
  let cur = ''
  for (const w of text.split(/\s+/)) {
    const t = cur ? `${cur} ${w}` : w
    if (ctx.measureText(t).width > maxW && cur) {
      lines.push(cur)
      cur = w
    } else cur = t
  }
  if (cur) lines.push(cur)
  return lines
}

export interface StoryLabels {
  entry: string
  excerpt: string
  readFull: string
}

export async function drawStory(
  p: Post,
  opts: { layout: StoryLayout; theme: StoryTheme; quote: string; url: string; labels: StoryLabels }
) {
  try {
    await Promise.all(
      ['600 96px "Source Serif 4"', 'italic 400 46px "Source Serif 4"', '700 64px "IBM Plex Mono"', '400 30px "IBM Plex Mono"'].map((f) =>
        document.fonts.load(f)
      )
    )
  } catch {
    /* sem as fontes, usa as de reserva */
  }
  const c = T[opts.theme]
  const cv = document.createElement('canvas')
  cv.width = 1080
  cv.height = 1920
  const ctx = cv.getContext('2d')!
  const M = 72, W = 1080 - 2 * M

  ctx.fillStyle = c.bg
  ctx.fillRect(0, 0, 1080, 1920)

  /* logo */
  ctx.fillStyle = c.ink
  ctx.font = `700 64px ${MONO}`
  ctx.fillText('may', M, 300)
  const w1 = ctx.measureText('may').width
  ctx.font = `400 64px ${MONO}`
  ctx.fillText('log', M + w1, 300)
  ctx.fillRect(M + w1 + ctx.measureText('log').width + 6, 306, 34, 7)

  /* barra cinza */
  ctx.fillStyle = c.bar
  ctx.fillRect(M, 360, W, 62)
  ctx.fillStyle = c.ink
  ctx.font = `400 27px ${MONO}`
  ctx.fillText(`▸ ${opts.layout === 'capa' ? opts.labels.entry : opts.labels.excerpt} ${p.n}`, M + 18, 401)
  ctx.textAlign = 'right'
  ctx.fillStyle = c.muted
  ctx.fillText(p.dataLog, M + W - 18, 401)
  ctx.textAlign = 'left'
  ctx.imageSmoothingEnabled = false

  const art = await postBits(p)
  const artCanvas = bitsCanvas(art.bits, art.w, art.h, c.imgInk, c.paper)

  if (opts.layout === 'capa') {
    const bh = Math.round((W * art.h) / art.w)
    ctx.drawImage(artCanvas, M, 462, W, bh)
    ctx.fillStyle = c.rule
    ctx.fillRect(M, 462 + bh + 18, W, 2)
    let y = 462 + bh + 120
    ctx.fillStyle = c.ink
    ctx.font = `600 96px ${SERIF}`
    for (const l of wrap(ctx, p.titulo, W).slice(0, 4)) {
      ctx.fillText(l, M, y)
      y += 104
    }
    if (p.subtitulo) {
      y += 10
      ctx.fillStyle = c.muted
      ctx.font = `italic 400 46px ${SERIF}`
      for (const l of wrap(ctx, p.subtitulo, W).slice(0, 3)) {
        ctx.fillText(l, M, y)
        y += 62
      }
    }
    y += 24
    ctx.fillStyle = c.muted
    ctx.font = `400 30px ${MONO}`
    ctx.fillText([p.tema, ...p.tags.map((t) => '#' + t)].join(' · '), M, Math.min(y, 1520))
  } else {
    ctx.fillStyle = c.link
    ctx.font = `700 240px ${SERIF}`
    ctx.fillText('“', M - 8, 680)
    let size = 78, lines: string[] = [], lh = 100
    do {
      ctx.font = `italic 400 ${size}px ${SERIF}`
      lh = Math.round(size * 1.28)
      lines = wrap(ctx, opts.quote, W)
      size -= 4
    } while (lines.length * lh > 700 && size > 40)
    let qy = 760
    ctx.fillStyle = c.ink
    for (const l of lines) {
      ctx.fillText(l, M, qy)
      qy += lh
    }
    ctx.fillStyle = c.muted
    ctx.font = `400 32px ${MONO}`
    ctx.fillText(`— ${p.titulo}`, M, qy + 30)
    /* faixa do banner, recortada do meio */
    const sh = Math.round((art.w * 64) / 340)
    ctx.drawImage(artCanvas, 0, Math.max(0, (art.h - sh) / 2), art.w, sh, M, 1310, W, Math.round((W * 64) / 340))
  }

  /* rodapé */
  ctx.fillStyle = c.rule
  ctx.fillRect(M, 1560, W, 2)
  ctx.fillStyle = c.ink
  ctx.font = `500 34px ${MONO}`
  ctx.fillText(opts.labels.readFull, M, 1622)
  ctx.fillStyle = c.muted
  ctx.font = `400 26px ${MONO}`
  ctx.fillText(opts.url.replace(/^https?:\/\//, ''), M, 1666)

  return cv
}
