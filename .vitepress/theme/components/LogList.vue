<script setup lang="ts">
import { withBase } from 'vitepress'
import type { Post } from '../data/posts.data'
import { useI18n } from '../composables/useI18n'

/* Lista no formato de log: nº · data · tema · título ........ → */
defineProps<{
  posts: Post[]
  head?: boolean
}>()
const { t } = useI18n()
</script>

<template>
  <div v-if="head" class="loghead">
    <span>{{ t('log.n') }}</span><span>{{ t('log.date') }}</span><span>{{ t('log.topic') }}</span><span>{{ t('log.title') }}</span>
  </div>
  <ul class="log">
    <li v-for="p in posts" :key="p.url">
      <a :href="withBase(p.url)" :data-n="p.n">
        <span class="n">{{ p.n }}</span>
        <span class="d">{{ p.dataLog }}</span>
        <span class="c">{{ p.tema }}</span>
        <span class="t">
          <b>{{ p.titulo }}</b>
          <span v-if="p.ptOnly" class="ptb" :title="t('log.ptOnly')">pt</span>
          <slot name="extra" :post="p" /><i></i>→
        </span>
      </a>
    </li>
  </ul>
</template>

<style>
.log {
  list-style: none;
  margin: 0;
  padding: 0;
  font-family: var(--mono);
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}
.log li {
  border-bottom: 1px dotted var(--rule);
}
.log a {
  display: grid;
  grid-template-columns: 3.2em 7.4em 5.6em 1fr;
  gap: 0 12px;
  padding: 9px 2px;
  text-decoration: none;
  align-items: baseline;
}
.log a:hover {
  background: var(--bar);
}
.log a:hover .t b {
  text-decoration: underline;
}
.log .n,
.log .d,
.log .c {
  color: var(--muted);
}
.log .t {
  display: flex;
  gap: 8px;
  min-width: 0;
  align-items: baseline;
}
.log .t b {
  font-weight: 500;
  min-width: 0;
}
.log .t i {
  flex: 1;
  border-bottom: 1px dotted currentColor;
  opacity: 0.35;
  transform: translateY(-4px);
  min-width: 12px;
  font-style: normal;
}
.ptb {
  font-size: 10px;
  color: var(--muted);
  border: 1px solid var(--rule);
  padding: 0 3px;
  flex: none;
}
.loghead {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--muted);
  display: grid;
  grid-template-columns: 3.2em 7.4em 5.6em 1fr;
  gap: 0 12px;
  padding: 0 2px 4px;
  border-bottom: 1px solid var(--rule);
}
@media (max-width: 560px) {
  .log a {
    grid-template-columns: 3em 1fr;
  }
  .log .c {
    display: none;
  }
  .log .d {
    grid-column: 2;
    grid-row: 1;
  }
  .log .t {
    grid-column: 2;
  }
  .log .n {
    grid-row: 1 / 3;
  }
  .loghead {
    display: none;
  }
}
</style>
