/*
  Favicon do maylog (opção 4a): um "m" arredondado vazado sobre um degradê pontilhado, 16×16.
  O mesmo desenho gera o SVG da aba (que troca de cor com o tema) e o PNG do celular.
*/

const M_ROUND = ['xx.xxx..xxx.', 'xxx..xxx..xx', 'xx...xx...xx', 'xx...xx...xx', 'xx...xx...xx', 'xx...xx...xx', 'xx...xx...xx', 'xx...xx...xx']
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]

/* true = tinta, false = papel */
export function faviconGrid(): boolean[][] {
  const g: boolean[][] = []
  for (let y = 0; y < 16; y++) {
    g.push([])
    for (let x = 0; x < 16; x++) g[y].push(0.15 + 0.85 * ((x + y) / 30) > (BAYER[y % 4][x % 4] + 0.5) / 16)
  }
  const letter = (x: number, y: number) => {
    const r = M_ROUND[y - 4]
    return !!r && x >= 2 && x < 14 && r[x - 2] === 'x'
  }
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      if (letter(x, y)) {
        g[y][x] = false
        continue
      }
      let near = false
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (letter(x + dx, y + dy)) near = true
      if (near) g[y][x] = true
    }
  return g
}

export function faviconSvg(ink: string, paper: string): string {
  const g = faviconGrid()
  let rects = ''
  for (let y = 0; y < 16; y++) {
    let x = 0
    while (x < 16) {
      if (!g[y][x]) {
        x++
        continue
      }
      const start = x
      while (x < 16 && g[y][x]) x++
      rects += `<rect x="${start}" y="${y}" width="${x - start}" height="1"/>`
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges"><rect width="16" height="16" fill="${paper}"/><g fill="${ink}">${rects}</g></svg>`
}

export const FAVICON_COLORS = {
  white: { ink: '#141414', paper: '#fafaf7' },
  dark: { ink: '#dcdad3', paper: '#121212' },
  sepia: { ink: '#3b2f22', paper: '#f1e7d0' }
} as const

/* troca o ícone da aba para as cores do tema atual */
export function applyFavicon(theme: keyof typeof FAVICON_COLORS) {
  const c = FAVICON_COLORS[theme]
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    link.type = 'image/svg+xml'
    document.head.appendChild(link)
  }
  link.href = 'data:image/svg+xml,' + encodeURIComponent(faviconSvg(c.ink, c.paper))
}
