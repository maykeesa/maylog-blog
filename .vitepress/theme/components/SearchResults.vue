<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { parse, search, segments, snippet, termsFor, type Field } from '../lib/search'
import { useSearch } from '../composables/useSearch'
import { useI18n } from '../composables/useI18n'
import type { I18nKey } from '../lib/i18n'

const { query } = useSearch()
const { t, entries, href, posts } = useI18n()

const crit = computed(() => parse(query.value))
const results = computed(() => search(posts.value, query.value))
const terms = computed(() => ({
  titulo: termsFor(crit.value, 'título'),
  tema: termsFor(crit.value, 'tema'),
  tags: termsFor(crit.value, 'tags'),
  texto: termsFor(crit.value, 'texto')
}))
const fieldName = (f: Field) => t(`f.${f}` as I18nKey)
</script>

<template>
  <section class="results">
    <h2 class="bar">
      <span class="rlbl">▸ {{ t('res.for') }} “{{ query.trim() }}”</span>
      <span class="side">{{ entries(results.length) }}</span>
    </h2>
    <ul class="res">
      <li v-for="r in results" :key="r.post.url">
        <a :href="withBase(r.post.url)" @click="query = ''">
          <span class="rm">
            {{ t('log.n') }} {{ r.post.n }} ·
            <mark v-if="r.where.includes('data')">{{ r.post.dataLog }}</mark><template v-else>{{ r.post.dataLog }}</template>
            ·
            <template v-for="(s, i) in segments(r.post.tema, terms.tema)" :key="i"><mark v-if="s.hit">{{ s.text }}</mark><template v-else>{{ s.text }}</template></template>
          </span>
          <span class="rt">
            <template v-for="(s, i) in segments(r.post.titulo, terms.titulo)" :key="i"><mark v-if="s.hit">{{ s.text }}</mark><template v-else>{{ s.text }}</template></template>
          </span>
          <span class="rs">
            <template v-for="(s, i) in segments(snippet(r.post.texto, terms.texto) || r.post.resumo, terms.texto)" :key="i"><mark v-if="s.hit">{{ s.text }}</mark><template v-else>{{ s.text }}</template></template>
          </span>
          <span class="rw">
            {{ t('res.found') }}: {{ r.where.map(fieldName).join(', ') }} · tags:
            <template v-for="(s, i) in segments(r.post.tags.map((x) => '#' + x).join(' '), terms.tags)" :key="i"><mark v-if="s.hit">{{ s.text }}</mark><template v-else>{{ s.text }}</template></template>
          </span>
        </a>
      </li>
    </ul>
    <p v-if="!results.length" class="empty">
      {{ t('res.none', { q: query.trim() }) }} <a :href="withBase(href('/arquivos'))">{{ t('res.archive') }}</a>.
    </p>
  </section>
</template>

<style scoped>
.results {
  margin-top: 40px;
}
.bar {
  padding: 4px 8px;
}
.res {
  list-style: none;
  margin: 0;
  padding: 0;
}
.res li {
  border-bottom: 1px dotted var(--rule);
}
.res a,
.res a:visited {
  display: grid;
  gap: 3px;
  padding: 12px 2px;
  text-decoration: none;
  color: var(--ink);
}
.res a:hover {
  background: var(--bar);
}
.res a:hover .rt {
  text-decoration: underline;
  text-underline-offset: 3px;
}
.rm {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--muted);
}
.rt {
  font-weight: 600;
  font-size: 19px;
  line-height: 1.3;
  color: var(--link);
}
.rs {
  font-size: 15px;
  line-height: 1.5;
}
.rw {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--muted);
}
mark {
  background: var(--sel);
  color: inherit;
  padding: 0 1px;
}
.empty {
  font-family: var(--mono);
  font-size: 13px;
  color: var(--muted);
  margin: 14px 0 0;
}
</style>
