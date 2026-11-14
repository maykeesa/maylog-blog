import { ref } from 'vue'

/* o texto da busca é compartilhado entre o campo (cabeçalho) e os resultados (área principal) */
const query = ref('')

export function useSearch() {
  return { query }
}
