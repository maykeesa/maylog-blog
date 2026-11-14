import { computed } from 'vue'
import { useData } from 'vitepress'
import type { Post } from '../data/posts.data'
import { useI18n } from './useI18n'

/*
  O post da página atual (em /posts/<pasta>/ ou /en/posts/<pasta>), no idioma da página,
  e os vizinhos para o "anterior / próximo".
*/
export function useCurrentPost() {
  const { page, params } = useData()
  const { posts } = useI18n()

  const folder = computed(() => {
    const rel = page.value.relativePath
    if (rel.startsWith('en/posts/')) return String(params.value?.slug ?? '')
    return rel.replace(/^posts\//, '').replace(/\/index\.md$/, '')
  })
  const index = computed(() => posts.value.findIndex((p) => p.slug === folder.value))

  const post = computed<Post | undefined>(() => posts.value[index.value])
  /* a lista vai do mais novo para o mais antigo */
  const newer = computed<Post | undefined>(() => (index.value > 0 ? posts.value[index.value - 1] : undefined))
  const older = computed<Post | undefined>(() => (index.value >= 0 ? posts.value[index.value + 1] : undefined))

  return { post, newer, older, posts }
}
