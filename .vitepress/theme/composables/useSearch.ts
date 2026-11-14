import { shallowRef } from 'vue'

/*
  Texto da busca, compartilhado entre o campo (no cabeçalho) e os resultados (na área principal).
  O campo usa v-model em "query"; os outros limpam pela ação "clear".
*/
const query = shallowRef('')

function clear() {
  query.value = ''
}

export function useSearch() {
  return { query, clear }
}
