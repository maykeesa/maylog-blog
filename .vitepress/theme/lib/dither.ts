/*
  Pinta imagens pontilhadas (1 bit) nas cores do tema.
  Os pontos em si vêm prontos do build: banners dos posts e cenas em cenas/ viram .dither.png
  (ver .vitepress/banners.ts); aqui eles só ganham a tinta e o papel do tema atual.
*/

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
