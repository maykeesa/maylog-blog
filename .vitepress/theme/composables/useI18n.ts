import { computed } from 'vue'
import { useData } from 'vitepress'
import { data as allPosts, type Post } from '../data/posts.data'
import { ASSUNTOS_EN, CENAS_EN, DICT, TEMAS_EN, type I18nKey, type Lang } from '../lib/i18n'

/* Idioma da página atual (as páginas em /en/ são em inglês) e utilidades de tradução. */
export function useI18n() {
  const { lang: vpLang } = useData()
  const lang = computed<Lang>(() => (vpLang.value?.startsWith('en') ? 'en' : 'pt'))

  function t(key: I18nKey, vars: Record<string, string | number> = {}) {
    let s = DICT[lang.value][key] ?? DICT.pt[key] ?? key
    for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v))
    return s
  }

  const entries = (n: number) =>
    lang.value === 'en' ? `${n} ${n === 1 ? 'entry' : 'entries'}` : `${n} ${n === 1 ? 'registro' : 'registros'}`

  /* caminho no idioma atual: '/arquivos' vira '/en/arquivos' em inglês */
  const href = (p: string) => (lang.value === 'en' ? (p === '/' ? '/en/' : `/en${p}`) : p)

  const tema = (c: string) => (lang.value === 'en' ? TEMAS_EN[c] ?? c : c)
  const cena = (c: string) => (lang.value === 'en' ? CENAS_EN[c] ?? c : c)
  const assunto = (c: string) => (lang.value === 'en' ? ASSUNTOS_EN[c] ?? c : c)

  /* a lista de posts no idioma atual: em inglês usa a tradução quando existe e marca os que só têm português */
  const posts = computed<Post[]>(() =>
    lang.value === 'en'
      ? allPosts.map((p) => ({
          ...p,
          ...(p.en ?? {}),
          tema: tema(p.tema),
          url: p.enUrl,
          ptOnly: !p.en
        }))
      : allPosts
  )

  return { lang, t, entries, href, tema, cena, assunto, posts }
}
