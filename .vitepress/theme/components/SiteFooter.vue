<script setup lang="ts">
import { data as site } from '../data/site.data'
import { useI18n } from '../composables/useI18n'
import Section from './Section.vue'
import VisitCounter from './VisitCounter.vue'

defineProps<{ footline?: string }>()
const { t, lang, assunto, href } = useI18n()
</script>

<template>
  <footer class="foot">
    <Section id="redes" :label="t('foot.findMe')" :side="`${site.redes.length} ${t('foot.networks')}`">
      <div class="sgrid">
        <a v-for="r in site.redes" :key="r.url" :href="r.url" rel="me noopener" target="_blank">
          <span class="cat">{{ assunto(r.assunto) }}</span>
          <b>{{ r.nome }}</b>
          <span class="h">{{ lang === 'en' && r.usuarioEn ? r.usuarioEn : r.usuario }}</span>
        </a>
      </div>
    </Section>

    <span v-if="footline" class="footline">{{ footline }}</span>

    <div class="badges">
      <a class="badge" :href="href('/feed.json')" target="_blank" rel="noopener"><span>feed</span><span>{{ t('badge.rss') }}</span></a>
      <span class="badge"><span>vue</span><span>{{ t('badge.vue') }}</span></span>
      <span class="badge"><span>.md</span><span>{{ t('badge.md') }}</span></span>
      <span class="badge"><span>www</span><span>{{ t('badge.www') }}</span></span>
      <VisitCounter />
    </div>
  </footer>
</template>

<style scoped>
.foot {
  margin-top: 56px;
  border-top: 1px solid var(--rule);
  padding-top: 16px;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--muted);
  display: grid;
  gap: 14px;
}
.foot :deep(.sec) {
  margin-top: 0;
}
.foot :deep(.sec-body) {
  padding-top: 10px;
}
.sgrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid var(--rule);
  border-left: 1px solid var(--rule);
}
.sgrid a,
.sgrid a:visited {
  display: grid;
  gap: 1px;
  padding: 8px 10px 9px;
  border-right: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
  text-decoration: none;
  color: var(--ink);
  min-width: 0;
  position: relative;
}
.sgrid a::after {
  content: '↗';
  position: absolute;
  top: 7px;
  right: 9px;
  color: var(--muted);
  font-size: 11px;
}
.sgrid a:hover {
  background: var(--bar);
}
.sgrid a:hover b {
  text-decoration: underline;
  text-underline-offset: 3px;
}
.sgrid .cat {
  font-size: 10px;
  color: var(--muted);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.sgrid b {
  font-size: 13px;
  font-weight: 500;
}
.sgrid .h {
  font-size: 11px;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
@media (max-width: 560px) {
  .sgrid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.footline {
  line-height: 2;
}
.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.badge,
.badge:visited {
  width: 88px;
  height: 31px;
  border: 1px solid var(--ink);
  display: grid;
  grid-template-columns: 26px 1fr;
  font-size: 9px;
  line-height: 1.05;
  color: var(--ink);
  text-decoration: none;
}
.badge > span:first-child {
  background: var(--ink);
  color: var(--bg);
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 10px;
}
.badge > span:last-child {
  display: grid;
  align-content: center;
  padding: 0 4px;
}
</style>
