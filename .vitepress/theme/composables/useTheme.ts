import { onMounted, ref } from 'vue'

export type ThemeName = 'white' | 'dark' | 'sepia'
export const THEMES: ThemeName[] = ['white', 'dark', 'sepia']

const theme = ref<ThemeName>('white')
const listeners = new Set<(t: ThemeName) => void>()

/* Tema atual do leitor, salvo no navegador. O valor inicial já foi aplicado no <head> (config.ts). */
export function useTheme() {
  onMounted(() => {
    const t = document.documentElement.getAttribute('data-theme') as ThemeName | null
    if (t && THEMES.includes(t)) theme.value = t
  })

  function setTheme(t: ThemeName) {
    theme.value = t
    document.documentElement.setAttribute('data-theme', t)
    try {
      localStorage.setItem('maylog-theme', t)
    } catch {
      /* navegação privada ou armazenamento bloqueado: o tema vale só nesta visita */
    }
    listeners.forEach((fn) => fn(t))
  }

  /* para quem precisa redesenhar algo (como as imagens pontilhadas) quando o tema muda */
  function onThemeChange(fn: (t: ThemeName) => void) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  }

  return { theme, setTheme, onThemeChange }
}
