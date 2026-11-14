import { onMounted, readonly, shallowRef } from 'vue'
import { applyFavicon } from '../lib/favicon'

export type ThemeName = 'white' | 'dark' | 'sepia'
export const THEMES: ThemeName[] = ['white', 'dark', 'sepia']

const theme = shallowRef<ThemeName>('white')
let synced = false
const listeners = new Set<(t: ThemeName) => void>()

/* Tema atual do leitor, salvo no navegador. O valor inicial já foi aplicado no <head> (config.ts). */
export function useTheme() {
  /* lê o tema aplicado no <head> uma vez só, no primeiro componente montado */
  onMounted(() => {
    if (synced) return
    synced = true
    const t = document.documentElement.getAttribute('data-theme') as ThemeName | null
    if (t && THEMES.includes(t)) theme.value = t
    applyFavicon(theme.value)
  })

  function setTheme(t: ThemeName) {
    theme.value = t
    document.documentElement.setAttribute('data-theme', t)
    try {
      localStorage.setItem('maylog-theme', t)
    } catch {
      /* navegação privada ou armazenamento bloqueado: o tema vale só nesta visita */
    }
    applyFavicon(t)
    listeners.forEach((fn) => fn(t))
  }

  /* para quem precisa redesenhar algo (como as imagens pontilhadas) quando o tema muda */
  function onThemeChange(fn: (t: ThemeName) => void) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  }

  /* o tema só muda pela ação setTheme */
  return { theme: readonly(theme), setTheme, onThemeChange }
}
