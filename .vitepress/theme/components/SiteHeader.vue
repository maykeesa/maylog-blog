<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { THEMES, useTheme } from '../composables/useTheme'
import { site } from '../site'

const props = defineProps<{ since?: string }>()
const { theme, setTheme } = useTheme()
const { page, frontmatter } = useData()

const topText = computed(() => (props.since ? `weblog pessoal · desde ${props.since}` : 'weblog pessoal'))

/* qual item do menu está ativo */
const current = computed(() => {
  const layout = frontmatter.value.layout
  if (layout === 'home') return 'log'
  if (layout === 'arquivo') return 'arquivos'
  if (layout === 'sobre') return 'sobre'
  return page.value.relativePath.startsWith('posts/') ? 'post' : ''
})

const nav = [
  { key: 'log', label: 'log', href: '/' },
  { key: 'arquivos', label: 'arquivos', href: '/arquivos' },
  { key: 'sobre', label: 'sobre', href: '/sobre' }
]
</script>

<template>
  <div class="top">
    <span class="top-txt">{{ topText }}</span>
    <div class="top-ctl">
      <div class="themes" role="group" aria-label="Tema">
        <button
          v-for="t in THEMES"
          :key="t"
          type="button"
          :aria-pressed="theme === t"
          @click="setTheme(t)"
        >{{ t }}</button>
      </div>
    </div>
  </div>

  <header class="mast">
    <p class="wordmark">
      <a :href="withBase('/')">may<span class="log">log</span><span class="cursor" aria-hidden="true"></span></a>
    </p>
    <p class="tagline">{{ site.frase }}</p>
    <div class="navrow">
      <nav class="main" aria-label="Principal">
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
  gap: 4px 10px;
}
.themes {
  display: flex;
  gap: 4px;
}
.themes button {
  font: inherit;
  background: none;
  border: 0;
  color: var(--muted);
  cursor: pointer;
  padding: 2px 4px;
}
.themes button[aria-pressed='true'] {
  color: var(--ink);
  font-weight: 700;
}
.themes button[aria-pressed='true']::before {
  content: '[';
}
.themes button[aria-pressed='true']::after {
  content: ']';
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
