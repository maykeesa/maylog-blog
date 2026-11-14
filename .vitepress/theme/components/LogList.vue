<script setup lang="ts">
import { withBase } from 'vitepress'
import type { Post } from '../data/posts.data'

/* Lista no formato de log: nº · data · tema · título ........ → */
defineProps<{
  posts: Post[]
  head?: boolean
}>()
</script>

<template>
  <div v-if="head" class="loghead"><span>nº</span><span>data</span><span>tema</span><span>título</span></div>
  <ul class="log">
    <slot name="before" />
    <li v-for="p in posts" :key="p.url">
      <a :href="withBase(p.url)" :data-n="p.n">
        <span class="n">{{ p.n }}</span>
        <span class="d">{{ p.dataLog }}</span>
        <span class="c">{{ p.tema }}</span>
        <span class="t"><b>{{ p.titulo }}</b><slot name="extra" :post="p" /><i></i>→</span>
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
