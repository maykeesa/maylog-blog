<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import { useSearch } from '../composables/useSearch'
import { useSearchText } from '../composables/useSearchText'
import { useI18n } from '../composables/useI18n'

const { query, clear } = useSearch()
/* começa a baixar o texto dos posts assim que o campo recebe o foco, antes de a pessoa terminar de digitar */
const { load: preloadText } = useSearchText()
const { t } = useI18n()
const input = useTemplateRef<HTMLInputElement>('searchInput')

const examples = computed(() => [
  { ex: 'tag:ia', desc: t('search.d.tag') },
  { ex: t('search.ex.titulo'), desc: t('search.d.titulo') },
  { ex: t('search.ex.tema'), desc: t('search.d.tema') },
  { ex: t('search.ex.texto'), desc: t('search.d.texto') },
  { ex: t('search.ex.data'), desc: t('search.d.data') },
  { ex: t('search.ex.frase'), desc: t('search.d.frase') }
])

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
function clearQuery() {
  clear()
  input.value?.focus()
}
function onEsc() {
  clear()
  input.value?.blur()
}
onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))

defineExpose({ focus: () => input.value?.focus() })
</script>

<template>
  <form class="search" role="search" @submit.prevent>
    <label for="q">{{ t('search.label') }}</label>
    <span class="field">
    <input
      id="q"
      ref="searchInput"
      v-model="query"
      type="search"
      :placeholder="t('search.ph')"
      autocomplete="off"
      spellcheck="false"
      @keydown.esc="onEsc"
      @focus="preloadText"
    />
    <button
      v-if="query"
      type="button"
      class="clear"
      :aria-label="t('search.clear')"
      :title="t('search.clear')"
      @click="clearQuery"
    >×</button>
    </span>
    <span class="qmark" aria-hidden="true">?</span>
    <div class="hint" role="note" :aria-label="t('search.hint')">
      <div class="hint-box">
        <div class="hint-bar"><span>{{ t('search.hint') }}</span><span>_□×</span></div>
        <ul>
          <li v-for="e in examples" :key="e.ex">
            <button type="button" @mousedown.prevent @click="use(e.ex)">{{ e.ex }}</button><span>{{ e.desc }}</span>
          </li>
        </ul>
        <p>
          {{ t('search.combine') }}
          <button type="button" @mousedown.prevent @click="use(t('search.ex.combo'))">{{ t('search.ex.combo') }}</button>
        </p>
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
.field {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
}
input {
  font-family: var(--mono);
  font-size: 13px;
  color: var(--ink);
  background: var(--bg);
  border: 1px solid var(--ink);
  border-radius: 0;
  padding: 3px 24px 3px 8px;
  flex: 1;
  min-width: 0;
  width: 100%;
  box-shadow: inset 2px 2px 0 var(--bar);
  -webkit-appearance: none;
  appearance: none;
}
/* esconde o X azul que o navegador põe nos campos de busca; o nosso segue o tema */
input::-webkit-search-cancel-button,
input::-webkit-search-decoration {
  -webkit-appearance: none;
  appearance: none;
  display: none;
}
.clear {
  position: absolute;
  right: 3px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  font-family: var(--mono);
  font-size: 15px;
  line-height: 1;
  color: var(--muted);
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
}
.clear:hover {
  color: var(--ink);
  background: var(--bar);
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
/* aparece ao passar o mouse ou com o campo vazio em foco; com um filtro dos arquivos aberto, o mouse não abre (não sobrepõe) */
:root:not(:has(.pop)) .search:hover .hint,
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
