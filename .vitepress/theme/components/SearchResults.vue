<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { parse, search, segments, snippet, termsFor, type Field } from '../lib/search'
import { useSearch } from '../composables/useSearch'
import { useI18n } from '../composables/useI18n'
import type { I18nKey } from '../lib/i18n'
import HighlightText from './HighlightText.vue'

const { query, clear } = useSearch()
const { t, entries, href, posts } = useI18n()

const q = computed(() => query.value.trim())
const fieldName = (f: Field) => t(`f.${f}` as I18nKey)

/* cada resultado já vem com os trechos marcados, prontos para mostrar */
const rows = computed(() => {
  const crit = parse(query.value)
  const terms = {
    titulo: termsFor(crit, 'título'),
    tema: termsFor(crit, 'tema'),
    tags: termsFor(crit, 'tags'),
    texto: termsFor(crit, 'texto')
  }
  return search(posts.value, query.value).map(({ post, where }) => ({
    post,
    dateHit: where.includes('data'),
    tema: segments(post.tema, terms.tema),
    titulo: segments(post.titulo, terms.titulo),
    trecho: segments(snippet(post.texto, terms.texto) || post.resumo, terms.texto),
    tags: segments(post.tags.map((x) => `#${x}`).join(' '), terms.tags),
    onde: where.map(fieldName).join(', ')
  }))
})
</script>

<template>
  <section class="results">
    <h2 class="bar">
      <span class="rlbl">▸ {{ t('res.for') }} “{{ q }}”</span>
      <span class="side">{{ entries(rows.length) }}</span>
    </h2>
    <ul class="res">
      <li v-for="r in rows" :key="r.post.url">
        <a :href="withBase(r.post.url)" @click="clear">
          <span class="rm">
            {{ t('log.n') }} {{ r.post.n }} ·
            <mark v-if="r.dateHit">{{ r.post.dataLog }}</mark><template v-else>{{ r.post.dataLog }}</template>
            · <HighlightText :parts="r.tema" />
          </span>
          <span class="rt"><HighlightText :parts="r.titulo" /></span>
          <span class="rs"><HighlightText :parts="r.trecho" /></span>
          <span class="rw">{{ t('res.found') }}: {{ r.onde }} · tags: <HighlightText :parts="r.tags" /></span>
        </a>
      </li>
    </ul>
    <p v-if="!rows.length" class="empty">
      {{ t('res.none', { q }) }} <a :href="withBase(href('/arquivos'))">{{ t('res.archive') }}</a>.
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
