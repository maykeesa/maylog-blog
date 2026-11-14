<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { THEMES, useTheme } from '../composables/useTheme'
import { ZOOM_CHOICES, useZoom } from '../composables/useZoom'
import { useI18n } from '../composables/useI18n'
import { useCurrentPost } from '../composables/usePosts'
import { site } from '../site'

const { since } = defineProps<{ since?: string }>()
const { theme, setTheme } = useTheme()
const { choice: zoom, setZoom, autoPercent } = useZoom()
const { page, frontmatter } = useData()
const { t, lang, href } = useI18n()
const { post } = useCurrentPost()

const topText = computed(() => (since ? `${t('weblog')} · ${t('since')} ${since}` : t('weblog')))
const frase = computed(() => (lang.value === 'en' ? site.fraseEn : site.frase))

const isPost = computed(() => /^(en\/)?posts\//.test(page.value.relativePath))

/* qual item do menu está ativo */
const current = computed(() => {
  const layout = frontmatter.value.layout
  if (layout === 'home') return 'log'
  if (layout === 'arquivo') return 'arquivos'
  if (layout === 'sobre') return 'sobre'
  return ''
})

const nav = computed(() => [
  { key: 'log', label: t('nav.log'), href: href('/') },
  { key: 'arquivos', label: t('nav.arquivos'), href: href('/arquivos') },
  { key: 'sobre', label: t('nav.sobre'), href: href('/sobre') }
])

/* endereço da mesma página no outro idioma; num post sem inglês, o "en" fica indisponível */
const switchTo = computed(() => {
  if (isPost.value && post.value) {
    return { pt: post.value.url.startsWith('/en/') ? `/posts/${post.value.slug}/` : post.value.url, en: post.value.enUrl }
  }
  const layout = frontmatter.value.layout
  const path = layout === 'arquivo' ? '/arquivos' : layout === 'sobre' ? '/sobre' : '/'
  return { pt: path, en: path === '/' ? '/en/' : `/en${path}` }
})
const enUnavailable = computed(() => lang.value === 'pt' && isPost.value && !!post.value && !post.value.en)
</script>

<template>
  <div class="top">
    <span class="top-txt">{{ topText }}</span>
    <div class="top-ctl">
      <div class="langs" role="group" :aria-label="t('aria.lang')">
        <a v-if="lang !== 'pt'" :href="withBase(switchTo.pt)" lang="pt-BR" hreflang="pt-BR">pt</a>
        <span v-else class="on" aria-current="true">pt</span>
        <span v-if="lang === 'en'" class="on" aria-current="true">en</span>
        <span v-else-if="enUnavailable" class="off" :title="t('lang.noen')" aria-disabled="true">en</span>
        <a v-else :href="withBase(switchTo.en)" lang="en" hreflang="en">en</a>
      </div>
      <span class="ctl-sep" aria-hidden="true">|</span>
      <div class="themes" role="group" :aria-label="t('aria.theme')">
        <button v-for="th in THEMES" :key="th" type="button" :aria-pressed="theme === th" @click="setTheme(th)">{{ th }}</button>
      </div>
      <span class="ctl-sep zoom-only" aria-hidden="true">|</span>
      <div class="zoom zoom-only" role="group" :aria-label="t('aria.zoom')">
        <button
          v-for="z in ZOOM_CHOICES"
          :key="z"
          type="button"
          :aria-pressed="zoom === z"
          :title="z === 'auto' ? t('zoom.autoTitle', { n: autoPercent }) : `${z}%`"
          @click="setZoom(z)"
        >{{ z === 'auto' ? t('zoom.auto') : z }}</button>
      </div>
    </div>
  </div>

  <header class="mast">
    <p class="wordmark">
      <a :href="withBase(href('/'))">may<span class="log">log</span><span class="cursor" aria-hidden="true"></span></a>
    </p>
    <p class="tagline">{{ frase }}</p>
    <div class="navrow">
      <nav class="main" :aria-label="lang === 'en' ? 'Main' : 'Principal'">
        <a
          v-for="item in nav"
          :key="item.key"
          :href="withBase(item.href)"
          :aria-current="current === item.key ? 'page' : undefined"
        >{{ item.label }}</a>
      </nav>
      <slot name="search" />
    </div>
  </header>
</template>

<style scoped>
.top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px 16px;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--muted);
  border-bottom: 1px solid var(--rule);
  padding-bottom: 8px;
}
.top-ctl {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 6px;
}
.ctl-sep {
  color: var(--rule);
}
.langs,
.themes,
.zoom {
  display: flex;
  gap: 1px;
  align-items: baseline;
}
.langs a,
.langs a:visited,
.langs span,
.themes button,
.zoom button {
  font: inherit;
  background: none;
  border: 0;
  color: var(--muted);
  cursor: pointer;
  padding: 2px 3px;
  text-decoration: none;
}
.langs a:hover {
  color: var(--ink);
}
.langs .on,
.themes button[aria-pressed='true'],
.zoom button[aria-pressed='true'] {
  color: var(--ink);
  font-weight: 700;
  cursor: default;
}
.themes button[aria-pressed='true'] {
  cursor: pointer;
}
.langs .on::before,
.themes button[aria-pressed='true']::before,
.zoom button[aria-pressed='true']::before {
  content: '[';
}
.langs .on::after,
.themes button[aria-pressed='true']::after,
.zoom button[aria-pressed='true']::after {
  content: ']';
}
/* no celular o tamanho é sempre 100% e o aparelho já tem zoom com os dedos: o controle some */
@media (max-width: 700px) {
  .zoom-only {
    display: none;
  }
}
.langs .off {
  opacity: 0.45;
  cursor: not-allowed;
  text-decoration: line-through;
}

.mast {
  padding-block: 28px 8px;
}
.wordmark {
  font-family: var(--mono);
  font-weight: 700;
  font-size: 44px;
  line-height: 1;
  letter-spacing: -0.03em;
  margin: 0;
}
.wordmark a,
.wordmark a:visited {
  color: var(--ink);
  text-decoration: none;
}
.wordmark .log {
  font-weight: 400;
}
.cursor {
  display: inline-block;
  width: 0.5em;
  height: 0.09em;
  background: var(--ink);
  vertical-align: baseline;
  margin-left: 2px;
  animation: blink 1.1s steps(1) infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}
.tagline {
  font-family: var(--mono);
  font-size: 13px;
  color: var(--muted);
  margin: 10px 0 0;
}
.navrow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 24px;
  margin-top: 18px;
}
nav.main {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 18px;
  font-family: var(--mono);
  font-size: 14px;
}
nav.main a,
nav.main a:visited {
  color: var(--ink);
}
nav.main a[aria-current='page'] {
  text-decoration: none;
  font-weight: 700;
}
nav.main a[aria-current='page']::before {
  content: '» ';
}
@media (max-width: 560px) {
  .wordmark {
    font-size: 36px;
  }
}
</style>
