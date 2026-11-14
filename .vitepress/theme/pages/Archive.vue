<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { data as posts, type Post } from '../data/posts.data'
import Section from '../components/Section.vue'
import FilterDropdown, { type Option } from '../components/FilterDropdown.vue'

type Sort = 'recentes' | 'antigos' | 'az' | 'curtos'

const sort = ref<Sort>('recentes')
const tema = ref<string | null>(null)
const tag = ref<string | null>(null)
const ano = ref<string | null>(null)

function counted(values: string[]): [string, number][] {
  const c = new Map<string, number>()
  values.forEach((v) => c.set(v, (c.get(v) || 0) + 1))
  return [...c.entries()]
}
const byCount = (a: [string, number], b: [string, number]) => b[1] - a[1] || a[0].localeCompare(b[0])

const sortOptions: Option[] = [
  { value: 'recentes', label: 'recentes' },
  { value: 'antigos', label: 'antigos' },
  { value: 'az', label: 'a–z' },
  { value: 'curtos', label: 'mais curtos' }
]
const temaOptions = computed<Option[]>(() => [
  { value: null, label: 'todos', count: posts.length },
  ...counted(posts.map((p) => p.tema)).sort(byCount).map(([v, n]) => ({ value: v, label: v, count: n }))
])
const tagOptions = computed<Option[]>(() => [
  { value: null, label: 'todas', count: posts.length },
  ...counted(posts.flatMap((p) => p.tags)).sort(byCount).map(([v, n]) => ({ value: v, label: '#' + v, count: n }))
])
const anoOptions = computed<Option[]>(() => [
  { value: null, label: 'todos', count: posts.length },
  ...counted(posts.map((p) => p.ano))
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([v, n]) => ({ value: v, label: v, count: n }))
])

const filtered = computed(() => {
  const list = posts.filter(
    (p) => (!tema.value || p.tema === tema.value) && (!tag.value || p.tags.includes(tag.value)) && (!ano.value || p.ano === ano.value)
  )
  return [...list].sort((a, b) => {
    if (sort.value === 'antigos') return a.n.localeCompare(b.n)
    if (sort.value === 'az') return a.titulo.localeCompare(b.titulo, 'pt')
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
  filtered.value.length === posts.length
    ? `${posts.length} ${posts.length === 1 ? 'registro' : 'registros'}`
    : `mostrando ${filtered.value.length} de ${posts.length}`
)
const plural = (n: number) => `${n} ${n === 1 ? 'registro' : 'registros'}`

function clear() {
  tema.value = tag.value = ano.value = null
}
function setSort(v: string | null) {
  sort.value = (v || 'recentes') as Sort
}
</script>

<template>
  <Section id="arquivo" label="arquivos" :side="countText">
    <div class="tools">
      <FilterDropdown label="ordem" title="ordenar por" :options="sortOptions" :model-value="sort" @update:model-value="setSort" />
      <FilterDropdown v-model="tema" label="tema" title="filtrar por tema" :options="temaOptions" :count-label="`${temaOptions.length - 1} opções`" />
      <FilterDropdown
        v-model="tag"
        label="tag"
        title="filtrar por tag"
        :options="tagOptions"
        findable
        find-placeholder="procurar tag…"
        :count-label="`${tagOptions.length - 1} tags`"
      />
      <FilterDropdown v-model="ano" label="ano" title="filtrar por ano" :options="anoOptions" :count-label="`${anoOptions.length - 1} opções`" />
      <button v-if="hasFilter" type="button" class="linkbtn reset" @click="clear">× limpar filtros</button>
    </div>

    <div class="loghead"><span>nº</span><span>data</span><span>tema</span><span>título</span></div>
    <ul class="log">
      <template v-for="g in groups" :key="g.ano || 'all'">
        <li v-if="g.ano" class="yr">{{ g.ano }} <span>{{ plural(g.posts.length) }}</span></li>
        <li v-for="p in g.posts" :key="p.url">
          <a :href="withBase(p.url)" :data-n="p.n">
            <span class="n">{{ p.n }}</span>
            <span class="d">{{ p.dataLog }}</span>
            <span class="c">{{ p.tema }}</span>
            <span class="t"><b>{{ p.titulo }}</b><span v-if="sort === 'curtos'" class="c">{{ p.minutos }} min</span><i></i>→</span>
          </a>
        </li>
      </template>
    </ul>
    <p v-if="!filtered.length" class="empty">
      nenhum registro com esses filtros. <button type="button" class="linkbtn" @click="clear">limpar filtros</button>
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
