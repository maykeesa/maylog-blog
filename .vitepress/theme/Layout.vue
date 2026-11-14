<script setup lang="ts">
import { computed } from 'vue'
import { Content, useData } from 'vitepress'
import { data as posts } from './data/posts.data'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import Home from './pages/Home.vue'
import Post from './pages/Post.vue'
import Archive from './pages/Archive.vue'

const { frontmatter, page } = useData()
const layout = computed(() => {
  if (frontmatter.value.layout) return frontmatter.value.layout
  return page.value.relativePath.startsWith('posts/') ? 'post' : 'page'
})

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
      <Post v-else-if="layout === 'post'" />
      <Archive v-else-if="layout === 'arquivo'" />
      <Content v-else />
    </main>
    <SiteFooter :footline="footline" />
  </div>
</template>
