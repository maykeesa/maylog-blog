<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { startSmoothScroll, stopSmoothScroll } from './composables/useSmoothScroll'
import { Content, useData, useRoute } from 'vitepress'
import { useSearch } from './composables/useSearch'
import { useI18n } from './composables/useI18n'
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
const { query, clear } = useSearch()
const { t, lang, entries, posts } = useI18n()

const layout = computed(() => {
  if (frontmatter.value.layout) return frontmatter.value.layout
  const rel = page.value.relativePath
  return rel.startsWith('posts/') || rel.startsWith('en/posts/') ? 'post' : 'page'
})
const searching = computed(() => query.value.trim().length > 0)

onMounted(startSmoothScroll)
onBeforeUnmount(stopSmoothScroll)

/* trocar de página limpa a busca */
watch(
  () => route.path,
  () => clear()
)

/* "desde AAAA" sai do primeiro post; "última atualização" sai do mais recente */
const since = computed(() => posts.value[posts.value.length - 1]?.ano)
const footline = computed(() => {
  const last = posts.value[0]
  const date = last ? (lang.value === 'en' ? last.dataLog : last.data.split('-').reverse().join('.')) : ''
  const upd = last ? `${t('foot.updated')}: ${date} · ` : ''
  return `${upd}${entries(posts.value.length)} · ${t('foot.privacy')}`
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
