<script setup lang="ts">
import { computed, watch } from 'vue'
import { Content, useData, useRoute } from 'vitepress'
import { data as posts } from './data/posts.data'
import { useSearch } from './composables/useSearch'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import SearchBox from './components/SearchBox.vue'
import SearchResults from './components/SearchResults.vue'
import HoverPeek from './components/HoverPeek.vue'
import Home from './pages/Home.vue'
import Post from './pages/Post.vue'
import Archive from './pages/Archive.vue'
import About from './pages/About.vue'
import NotFound from './pages/NotFound.vue'

const { frontmatter, page } = useData()
const route = useRoute()
const { query } = useSearch()

const layout = computed(() => {
  if (frontmatter.value.layout) return frontmatter.value.layout
  return page.value.relativePath.startsWith('posts/') ? 'post' : 'page'
})
const searching = computed(() => query.value.trim().length > 0)

/* trocar de página limpa a busca */
watch(
  () => route.path,
  () => (query.value = '')
)

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
    <SiteHeader :since="since">
      <template #search><SearchBox /></template>
    </SiteHeader>
    <SearchResults v-if="searching" />
    <main v-show="!searching">
      <NotFound v-if="page.isNotFound" />
      <Home v-else-if="layout === 'home'" />
      <Post v-else-if="layout === 'post'" />
      <Archive v-else-if="layout === 'arquivo'" />
      <About v-else-if="layout === 'sobre'" />
      <Content v-else />
    </main>
    <SiteFooter :footline="footline" />
  </div>
  <HoverPeek />
</template>
