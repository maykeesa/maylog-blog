import { computed } from 'vue'
import { useData } from 'vitepress'
import { data as posts, type Post } from '../data/posts.data'

/* O post da página atual (se for um post) e os vizinhos, para o "anterior / próximo". */
export function useCurrentPost() {
  const { page } = useData()

  const index = computed(() => {
    const folder = page.value.relativePath.replace(/^posts\//, '').replace(/\/index\.md$/, '')
    return posts.findIndex((p) => p.slug === folder)
  })

  const post = computed<Post | undefined>(() => posts[index.value])
  /* posts está do mais novo para o mais antigo */
  const newer = computed<Post | undefined>(() => (index.value > 0 ? posts[index.value - 1] : undefined))
  const older = computed<Post | undefined>(() => (index.value >= 0 ? posts[index.value + 1] : undefined))

  return { post, newer, older, posts }
}
