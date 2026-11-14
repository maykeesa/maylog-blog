<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useSearch } from '../composables/useSearch'
import { useI18n } from '../composables/useI18n'

const { query } = useSearch()
const { t } = useI18n()
const input = ref<HTMLInputElement>()

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
    <label for="q">{{ t('search.label') }}</label>
    <input
      id="q"
      ref="input"
      v-model="query"
      type="search"
      :placeholder="t('search.ph')"
      autocomplete="off"
      spellcheck="false"
      @keydown.esc="onEsc"
    />
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
        <p class="hint-keys">{{ t('search.keys') }}</p>
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
