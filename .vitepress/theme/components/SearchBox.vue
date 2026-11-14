<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useSearch } from '../composables/useSearch'

const { query } = useSearch()
const input = ref<HTMLInputElement>()

const examples = [
  { ex: 'tag:ia', desc: 'só nas tags' },
  { ex: 'titulo:vue', desc: 'só no título' },
  { ex: 'tema:ensaio', desc: 'só no tema' },
  { ex: 'texto:rss', desc: 'só no texto' },
  { ex: 'data:2026.10', desc: 'por ano ou mês' },
  { ex: '"sem público"', desc: 'frase exata' }
]

function use(ex: string) {
  query.value = ex
  input.value?.focus()
}
function onKey(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
  if (e.key === '/' && tag !== 'input' && tag !== 'textarea' && !(e.target as HTMLElement)?.isContentEditable) {
    e.preventDefault()
    input.value?.focus()
  }
}
function onEsc() {
  query.value = ''
  input.value?.blur()
}
onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))

defineExpose({ focus: () => input.value?.focus() })
</script>

<template>
  <form class="search" role="search" @submit.prevent>
    <label for="q">buscar</label>
    <input
      id="q"
      ref="input"
      v-model="query"
      type="search"
      placeholder="IA, vue, nostalgia…"
      autocomplete="off"
      spellcheck="false"
      @keydown.esc="onEsc"
    />
    <span class="qmark" aria-hidden="true">?</span>
    <div class="hint" role="note" aria-label="Filtros da busca">
      <div class="hint-box">
        <div class="hint-bar"><span>filtros da busca</span><span>_□×</span></div>
        <ul>
          <li v-for="e in examples" :key="e.ex">
            <button type="button" @mousedown.prevent @click="use(e.ex)">{{ e.ex }}</button><span>{{ e.desc }}</span>
          </li>
        </ul>
        <p>
          combine filtros:
          <button type="button" @mousedown.prevent @click="use('tag:nostalgia tema:ensaio')">tag:nostalgia tema:ensaio</button>
        </p>
        <p class="hint-keys">aperte <kbd>/</kbd> para buscar · <kbd>esc</kbd> limpa</p>
      </div>
    </div>
  </form>
</template>

<style scoped>
.search {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-family: var(--mono);
  font-size: 13px;
  flex: 0 1 260px;
  min-width: 0;
}
label {
  color: var(--muted);
}
input {
  font-family: var(--mono);
  font-size: 13px;
  color: var(--ink);
  background: var(--bg);
  border: 1px solid var(--ink);
  border-radius: 0;
  padding: 3px 8px;
  flex: 1;
  min-width: 0;
  width: 100%;
  box-shadow: inset 2px 2px 0 var(--bar);
}
input::placeholder {
  color: var(--muted);
  opacity: 0.8;
}
.qmark {
  font-size: 11px;
  color: var(--muted);
  border: 1px solid var(--rule);
  width: 16px;
  height: 16px;
  display: grid;
  place-items: center;
  cursor: help;
  flex: none;
}
.hint {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 15;
  padding-top: 8px;
  width: 300px;
  max-width: calc(100vw - 32px);
  display: none;
}
.search:hover .hint,
.search:has(input:placeholder-shown):focus-within .hint {
  display: block;
}
.hint-box {
  background: var(--bg);
  border: 1px solid var(--ink);
  box-shadow: 4px 4px 0 var(--ink);
  font-size: 12px;
}
.hint-bar {
  background: var(--bar);
  border-bottom: 1px solid var(--ink);
  display: flex;
  justify-content: space-between;
  padding: 3px 8px;
  font-size: 11px;
}
.hint-bar span:last-child {
  letter-spacing: 0.15em;
}
.hint ul {
  list-style: none;
  margin: 0;
  padding: 8px 10px 4px;
  display: grid;
  gap: 3px;
}
.hint li {
  display: grid;
  grid-template-columns: 9.5em 1fr;
  gap: 8px;
  align-items: baseline;
}
.hint li span {
  color: var(--muted);
}
.hint button {
  font: inherit;
  color: var(--link);
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  text-align: left;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.hint p {
  margin: 0;
  padding: 4px 10px 8px;
  color: var(--muted);
}
.hint .hint-keys {
  border-top: 1px dotted var(--rule);
  padding-top: 6px;
}
kbd {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--ink);
  border: 1px solid var(--rule);
  border-bottom-width: 2px;
  padding: 0 4px;
}
@media (max-width: 560px) {
  .search {
    flex-basis: 100%;
  }
}
</style>
