import type Lenis from 'lenis'

/*
  Rolagem suave da página (roda do mouse e trackpad) com a biblioteca Lenis.
  Fica desligada para quem pediu "reduzir movimento" no sistema.
  Áreas que rolam por dentro (listas dos filtros, janela dos stories, blocos de código)
  continuam com a rolagem normal delas.
*/

let lenis: Lenis | null = null
let frame = 0

const NESTED = '.pop, .hint, .modal-back, div[class*="language-"], [data-lenis-prevent]'

export async function startSmoothScroll() {
  if (lenis || typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const { default: LenisClass } = await import('lenis')
  lenis = new LenisClass({
    lerp: 0.12,
    wheelMultiplier: 0.9,
    smoothWheel: true,
    prevent: (node: HTMLElement) => !!node.closest?.(NESTED)
  })
  const loop = (time: number) => {
    lenis?.raf(time)
    frame = requestAnimationFrame(loop)
  }
  frame = requestAnimationFrame(loop)
}

export function stopSmoothScroll() {
  cancelAnimationFrame(frame)
  lenis?.destroy()
  lenis = null
}

/* pausa enquanto uma janela por cima da página está aberta (ex.: imagem para stories) */
export function pauseSmoothScroll(paused: boolean) {
  if (!lenis) return
  if (paused) lenis.stop()
  else lenis.start()
}

/* rola até um ponto ou elemento, com o mesmo movimento suave */
export function smoothScrollTo(target: number | HTMLElement, offset = 0) {
  if (lenis) lenis.scrollTo(target, { offset })
  else if (typeof target === 'number') window.scrollTo({ top: target })
  else target.scrollIntoView({ block: 'start' })
}
