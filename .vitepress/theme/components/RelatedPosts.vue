<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import type { Post } from '../data/posts.data'
import { useI18n } from '../composables/useI18n'
import Section from './Section.vue'
import PostArt from './PostArt.vue'

/* Até 3 posts parecidos: cada tag em comum vale 3 pontos, o mesmo tema vale 2; empate vai para a data mais próxima. */
const { post } = defineProps<{ post: Post }>()
const { t, posts } = useI18n()

const related = computed(() =>
  posts.value
    .filter((p) => p.url !== post.url)
    .map((p) => {
      const shared = p.tags.filter((tag) => post.tags.includes(tag))
      const same = p.tema === post.tema
      return {
        p,
        score: shared.length * 3 + (same ? 2 : 0),
        /* o que os dois têm em comum, mostrado no card: "#escrita · ensaio" */
        common: [...shared.map((tag) => `#${tag}`), ...(same ? [p.tema] : [])].join(' · ')
      }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || Math.abs(+post.n - +a.p.n) - Math.abs(+post.n - +b.p.n))
    .slice(0, 3)
)
</script>

<template>
  <Section v-if="related.length" id="relacionados" :label="t('rel.title')" :side="t('rel.side')" class="related">
    <div class="relgrid">
      <a v-for="x in related" :key="x.p.url" class="relcard" :href="withBase(x.p.url)">
        <PostArt :post="x.p" :width="170" :height="64" />
        <span class="rm">{{ t('log.n') }} {{ x.p.n }} · {{ x.p.dataLog }}</span>
        <span class="rt">{{ x.p.titulo }}</span>
        <span class="rw">{{ t('rel.common') }} <b>{{ x.common }}</b></span>
      </a>
    </div>
  </Section>
</template>

<style scoped>
.related {
  margin-top: 48px;
}
.relgrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
@media (max-width: 560px) {
  .relgrid {
    grid-template-columns: 1fr;
  }
}
.relcard,
.relcard:visited {
  display: grid;
  gap: 5px;
  align-content: start;
  border: 1px solid var(--rule);
  padding: 8px;
  text-decoration: none;
  color: var(--ink);
  min-width: 0;
}
.relcard:hover {
  border-color: var(--ink);
  background: var(--bar);
}
.relcard:hover .rt {
  text-decoration: underline;
  text-underline-offset: 3px;
}
.rm {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--muted);
}
.rt {
  font-weight: 600;
  font-size: 16px;
  line-height: 1.3;
  color: var(--link);
  text-wrap: balance;
}
.rw {
  font-family: var(--mono);
  font-size: 10.5px;
  color: var(--muted);
  line-height: 1.5;
}
.rw b {
  font-weight: 500;
  color: var(--ink);
}
</style>
