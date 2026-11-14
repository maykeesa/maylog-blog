import { computed, onMounted, readonly, shallowRef } from 'vue'

/*
  Tamanho da página, como o Ctrl + do navegador (aumenta tudo junto: texto, imagens, espaços).
  - "auto": escolhe pela largura da tela: 1080p → 100%, ~2100px → 110%, 2K (2560px) → 125%.
  - "100", "110", "125": escolha fixa do leitor, lembrada no navegador.
  O valor inicial é aplicado no <head> (config.ts), antes da página aparecer.
*/

export type ZoomChoice = 'auto' | '100' | '110' | '125'
export const ZOOM_CHOICES: ZoomChoice[] = ['auto', '100', '110', '125']
const STORAGE = 'maylog-zoom'

/* mesma regra do script do <head> */
export function autoZoom(screenWidth: number) {
  if (screenWidth >= 2400) return 1.25
  if (screenWidth >= 2100) return 1.1
  return 1
}

function factorFor(choice: ZoomChoice) {
  if (choice === 'auto') return autoZoom(window.screen.width)
  return Number(choice) / 100
}

/* fator aplicado agora (1 = 100%); usado para converter posições do mouse e distâncias */
export function currentZoom(): number {
  if (typeof document === 'undefined') return 1
  return Number(document.documentElement.style.zoom) || 1
}

const choice = shallowRef<ZoomChoice>('auto')
let synced = false

export function useZoom() {
  onMounted(() => {
    if (synced) return
    synced = true
    try {
      const saved = localStorage.getItem(STORAGE) as ZoomChoice | null
      if (saved && ZOOM_CHOICES.includes(saved)) choice.value = saved
    } catch {
      /* sem armazenamento: fica no automático */
    }
  })

  function setZoom(c: ZoomChoice) {
    choice.value = c
    const f = factorFor(c)
    document.documentElement.style.zoom = f === 1 ? '' : String(f)
    try {
      if (c === 'auto') localStorage.removeItem(STORAGE)
      else localStorage.setItem(STORAGE, c)
    } catch {
      /* sem armazenamento: vale só nesta visita */
    }
  }

  /* porcentagem efetiva, para mostrar ao lado do "auto" (ex.: "auto 125") */
  const autoPercent = computed(() => (typeof window === 'undefined' ? 100 : Math.round(autoZoom(window.screen.width) * 100)))

  return { choice: readonly(choice), setZoom, autoPercent }
}
