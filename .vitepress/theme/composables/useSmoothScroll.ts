import type Lenis from 'lenis'

/*
  Rolagem suave da página (roda do mouse e trackpad) com a biblioteca Lenis.
  Fica desligada para quem pediu "reduzir movimento" no sistema.
  Áreas que rolam por dentro na vertical (listas dos filtros, janela dos stories)
  continuam com a rolagem normal delas.
*/

let lenis: Lenis | null = null
let frame = 0

/*
  Só o que rola de verdade na vertical fica com a rolagem própria: a lista dos filtros e a janela dos stories.
  (Blocos de código rolam só na horizontal; se a Lenis os ignorasse, o navegador rolaria a página
  por conta própria no meio do movimento suave e a tela daria um tranco para cima.)
*/
const NESTED = '.pop ul, .modal-back, [data-lenis-prevent]'

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

/*
  Links para um ponto da mesma página (notas de rodapé [1] e ↩, âncoras do texto) deslizam também.
  O sumário já trata os próprios cliques; aqui fica o resto.
*/
function onAnchorClick(e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  const a = (e.target as HTMLElement | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
  if (!a) return
  const id = decodeURIComponent(a.getAttribute('href')!.slice(1))
  const el = id && document.getElementById(id)
  if (!el) return
  e.preventDefault()
  smoothScrollTo(el, -84)
  history.replaceState(history.state, '', `#${id}`)
}

export function startAnchorScroll() {
  document.addEventListener('click', onAnchorClick)
}
export function stopAnchorScroll() {
  document.removeEventListener('click', onAnchorClick)
}

/* sai rápido e freia suave no fim */
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

/*
  Rola até um ponto ou elemento deslizando, em vez de pular.
  offset: distância extra (negativa = para cima), útil para não esconder o alvo sob a barra fixa.
  Para quem pediu "reduzir movimento", vai direto, sem animação.
*/
export function smoothScrollTo(target: number | HTMLElement, offset = 0) {
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.1, easing: easeOutCubic })
    return
  }
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const top = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY
  window.scrollTo({ top: top + offset, behavior: reduce ? 'auto' : 'smooth' })
}
