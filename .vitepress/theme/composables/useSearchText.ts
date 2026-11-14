import { readonly, shallowRef } from 'vue'
import type { SearchText } from '../data/searchText.data'

/*
  Texto completo dos posts para a busca, baixado só quando alguém usa o campo de busca.
  Até chegar, a busca procura em título, tema e tags; quando chega, passa a procurar no texto também.
*/
const texts = shallowRef<Record<string, SearchText> | null>(null)
let loading: Promise<void> | null = null

function load() {
  if (!loading) {
    loading = import('../data/searchText.data')
      .then((m) => {
        texts.value = m.data
      })
      .catch(() => {
        loading = null /* falhou (ex.: sem conexão): tenta de novo no próximo uso */
      })
  }
  return loading
}

export function useSearchText() {
  return { texts: readonly(texts), load }
}
