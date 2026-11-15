<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { par } from '../site'
import { data as site } from '../data/site.data'
import { useI18n } from '../composables/useI18n'
import Section from '../components/Section.vue'
import LogList from '../components/LogList.vue'
import SceneArt from '../components/SceneArt.vue'

const { t, lang, entries, href, posts } = useI18n()
const RECENTES = 6
const recentes = computed(() => posts.value.slice(0, RECENTES))
const primeiro = computed(() => posts.value[posts.value.length - 1]?.n ?? '001')
const ultimo = computed(() => posts.value[0]?.n ?? '001')
const agoraData = site.agora.atualizado.slice(8, 10) + '.' + site.agora.atualizado.slice(5, 7)
const agora = computed(() => site.agora.itens.map((i) => par(i, lang.value)))
</script>

<template>
  <Section id="leiame" :label="t('home.readme')" :side="t('home.file')">
    <div class="intro">
      <SceneArt :ratio="340 / 96" caption />
      <p>{{ t('home.intro') }}</p>
    </div>
  </Section>

  <Section id="recentes" :label="t('home.recent')" :side="entries(posts.length)">
    <p v-if="!posts.length" class="more empty">{{ t('log.none') }}</p>
    <LogList v-if="posts.length" :posts="recentes" head />
    <p v-if="posts.length" class="more">
      <a :href="withBase(href('/arquivos'))">{{ t('home.all') }} ({{ ultimo }} → {{ primeiro }})</a>
    </p>
  </Section>

  <div class="cols">
    <Section id="agora" :label="t('home.now')" :side="agoraData">
      <dl class="kv">
        <template v-for="item in agora" :key="item.rotulo">
          <dt>{{ item.rotulo }}</dt>
          <dd>{{ item.valor }}</dd>
        </template>
      </dl>
    </Section>
    <Section id="acompanho" :label="t('home.following')" :side="t('home.channels')">
      <ul class="follow">
        <li v-for="c in site.acompanho" :key="c.url">
          <a :href="c.url" target="_blank" rel="noopener">{{ c.nome }}</a> <span class="via">{{ c.onde }}</span>
        </li>
      </ul>
    </Section>
  </div>
</template>

<style scoped>
.intro {
  display: grid;
  gap: 16px;
}
.intro p {
  margin: 0;
}
.more {
  font-family: var(--mono);
  font-size: 13px;
  margin: 12px 0 0;
}
.empty {
  color: var(--muted);
}
.cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 32px;
  align-items: start;
}
@media (max-width: 560px) {
  .cols {
    grid-template-columns: 1fr;
  }
}
.kv {
  font-family: var(--mono);
  font-size: 13px;
  margin: 0;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2px 12px;
}
.kv dt {
  color: var(--muted);
}
.kv dd {
  margin: 0;
}
.follow {
  list-style: none;
  padding: 0;
  margin: 0;
  font-family: var(--mono);
  font-size: 13px;
  line-height: 1.9;
}
.follow li::before {
  content: '› ';
  color: var(--muted);
}
.via {
  font-size: 10px;
  color: var(--muted);
}
</style>
