<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { withBase } from 'vitepress'
import type { Post } from '../data/posts.data'
import { useI18n } from '../composables/useI18n'
import type { I18nKey } from '../lib/i18n'
import Section from '../components/Section.vue'
import FilterDropdown, { type Option } from '../components/FilterDropdown.vue'

type Sort = 'recentes' | 'antigos' | 'az' | 'curtos'

const { t, lang, entries, posts } = useI18n()
const sort = shallowRef<Sort>('recentes')
const tema = shallowRef<string | null>(null)
const tag = shallowRef<string | null>(null)
const ano = shallowRef<string | null>(null)

function counted(values: string[]): [string, number][] {
  const c = new Map<string, number>()
  values.forEach((v) => c.set(v, (c.get(v) || 0) + 1))
  return [...c.entries()]
}
const byCount = (a: [string, number], b: [string, number]) => b[1] - a[1] || a[0].localeCompare(b[0])

const sortOptions = computed<Option[]>(() =>
  (['recentes', 'antigos', 'az', 'curtos'] as const).map((v) => ({ value: v, label: t(`sort.${v}` as I18nKey) }))
)
const temaOptions = computed<Option[]>(() => [
  { value: null, label: t('arch.allM'), count: posts.value.length },
  ...counted(posts.value.map((p) => p.tema)).sort(byCount).map(([v, n]) => ({ value: v, label: v, count: n }))
])
const tagOptions = computed<Option[]>(() => [
  { value: null, label: t('arch.allF'), count: posts.value.length },
  ...counted(posts.value.flatMap((p) => p.tags)).sort(byCount).map(([v, n]) => ({ value: v, label: '#' + v, count: n }))
])
const anoOptions = computed<Option[]>(() => [
  { value: null, label: t('arch.allM'), count: posts.value.length },
  ...counted(posts.value.map((p) => p.ano))
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([v, n]) => ({ value: v, label: v, count: n }))
])

const filtered = computed(() => {
  const list = posts.value.filter(
    (p) => (!tema.value || p.tema === tema.value) && (!tag.value || p.tags.includes(tag.value)) && (!ano.value || p.ano === ano.value)
  )
  return [...list].sort((a, b) => {
    if (sort.value === 'antigos') return a.n.localeCompare(b.n)
    if (sort.value === 'az') return a.titulo.localeCompare(b.titulo, lang.value === 'en' ? 'en' : 'pt')
    if (sort.value === 'curtos') return a.minutos - b.minutos || b.n.localeCompare(a.n)
    return b.n.localeCompare(a.n)
  })
})

/* nas ordens por data, os posts aparecem agrupados por ano */
const groups = computed(() => {
  if (sort.value !== 'recentes' && sort.value !== 'antigos') return [{ ano: '', posts: filtered.value }]
  const out: { ano: string; posts: Post[] }[] = []
  filtered.value.forEach((p) => {
    const last = out[out.length - 1]
    if (last && last.ano === p.ano) last.posts.push(p)
    else out.push({ ano: p.ano, posts: [p] })
  })
  return out
})

const hasFilter = computed(() => !!(tema.value || tag.value || ano.value))
const countText = computed(() =>
  filtered.value.length === posts.value.length
    ? entries(posts.value.length)
    : t('arch.showing', { a: filtered.value.length, b: posts.value.length })
)

function clear() {
  tema.value = tag.value = ano.value = null
}
function setSort(v: string | null) {
  sort.value = (v || 'recentes') as Sort
}

/*
  Filtros no endereço: /arquivos?tag=java&tema=ensaio&ano=2026&ordem=antigos
  Abrir um link assim já mostra a lista filtrada, e mexer nos filtros atualiza o endereço
  (dá para copiar e mandar). Só aparecem no endereço os filtros que não estão no padrão.
*/
const SORTS: Sort[] = ['recentes', 'antigos', 'az', 'curtos']

function readUrl() {
  const q = new URLSearchParams(location.search)
  tema.value = q.get('tema')
  tag.value = q.get('tag')
  ano.value = q.get('ano')
  const o = q.get('ordem') as Sort | null
  sort.value = o && SORTS.includes(o) ? o : 'recentes'
}

function writeUrl() {
  const q = new URLSearchParams()
  if (tag.value) q.set('tag', tag.value)
  if (tema.value) q.set('tema', tema.value)
  if (ano.value) q.set('ano', ano.value)
  if (sort.value !== 'recentes') q.set('ordem', sort.value)
  const qs = q.toString()
  const url = location.pathname + (qs ? `?${qs}` : '') + location.hash
  if (url !== location.pathname + location.search + location.hash) history.replaceState(history.state, '', url)
}

onMounted(() => {
  readUrl()
  window.addEventListener('popstate', readUrl)
})
onBeforeUnmount(() => window.removeEventListener('popstate', readUrl))
watch([sort, tema, tag, ano], writeUrl)
</script>

<template>
  <Section id="arquivo" :label="t('arch.title')" :side="countText">
    <div class="tools">
      <FilterDropdown :label="t('arch.sort')" :title="t('arch.sortTitle')" :options="sortOptions" :model-value="sort" @update:model-value="setSort" />
      <FilterDropdown
        v-model="tema"
        :label="t('arch.topic')"
        :title="t('arch.topicTitle')"
        :options="temaOptions"
        :count-label="`${temaOptions.length - 1} ${t('arch.options')}`"
        :nothing-label="t('arch.nothing')"
      />
      <FilterDropdown
        v-model="tag"
        :label="t('arch.tag')"
        :title="t('arch.tagTitle')"
        :options="tagOptions"
        findable
        :find-placeholder="t('arch.findTag')"
        :count-label="`${tagOptions.length - 1} ${t('arch.tags')}`"
        :nothing-label="t('arch.nothing')"
      />
      <FilterDropdown
        v-model="ano"
        :label="t('arch.year')"
        :title="t('arch.yearTitle')"
        :options="anoOptions"
        :count-label="`${anoOptions.length - 1} ${t('arch.options')}`"
        :nothing-label="t('arch.nothing')"
      />
      <button v-if="hasFilter" type="button" class="linkbtn reset" @click="clear">{{ t('arch.clearX') }}</button>
    </div>

    <div class="loghead">
      <span>{{ t('log.n') }}</span><span>{{ t('log.date') }}</span><span>{{ t('log.topic') }}</span><span>{{ t('log.title') }}</span>
    </div>
    <ul class="log">
      <template v-for="g in groups" :key="g.ano || 'all'">
        <li v-if="g.ano" class="yr">{{ g.ano }} <span>{{ entries(g.posts.length) }}</span></li>
        <li v-for="p in g.posts" :key="p.url">
          <a :href="withBase(p.url)" :data-n="p.n">
            <span class="n">{{ p.n }}</span>
            <span class="d">{{ p.dataLog }}</span>
            <span class="c">{{ p.tema }}</span>
            <span class="t">
              <b>{{ p.titulo }}</b>
              <span v-if="p.ptOnly" class="ptb" :title="t('log.ptOnly')">pt</span>
              <span v-if="sort === 'curtos'" class="c">{{ p.minutos }} min</span><i></i>→
            </span>
          </a>
        </li>
      </template>
    </ul>
    <p v-if="!filtered.length" class="empty">
      {{ t('arch.empty') }} <button type="button" class="linkbtn" @click="clear">{{ t('arch.clear') }}</button>
    </p>
  </Section>
</template>

<style scoped>
.tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 10px;
  font-family: var(--mono);
  font-size: 12px;
  padding-bottom: 14px;
  border-bottom: 3px double var(--rule);
  margin-bottom: 4px;
}
.reset {
  margin-left: auto;
}
.log li.yr {
  border-bottom: 1px solid var(--rule);
  font-family: var(--mono);
  font-size: 12px;
  color: var(--ink);
  font-weight: 700;
  padding: 18px 2px 4px;
  display: flex;
  justify-content: space-between;
}
.log li.yr span {
  color: var(--muted);
  font-weight: 400;
}
.empty {
  font-family: var(--mono);
  font-size: 13px;
  color: var(--muted);
  margin: 14px 0 0;
}
</style>
