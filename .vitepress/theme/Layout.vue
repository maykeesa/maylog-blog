<script setup lang="ts">
import { computed } from 'vue'
import { Content, useData } from 'vitepress'
import { data as posts } from './data/posts.data'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import Home from './pages/Home.vue'

const { frontmatter } = useData()
const layout = computed(() => frontmatter.value.layout)

/* "desde AAAA" sai do primeiro post; "última atualização" sai do mais recente */
const since = computed(() => posts[posts.length - 1]?.ano)
const footline = computed(() => {
  const last = posts[0]
  const n = posts.length
  const upd = last ? `última atualização: ${last.data.split('-').reverse().join('.')} · ` : ''
  return `${upd}${n} ${n === 1 ? 'registro' : 'registros'} · sem cookies, sem rastreio`
})
</script>

<template>
  <div class="wrap">
    <SiteHeader :since="since" />
    <main>
      <Home v-if="layout === 'home'" />
      <Content v-else />
    </main>
    <SiteFooter :footline="footline" />
  </div>
</template>
