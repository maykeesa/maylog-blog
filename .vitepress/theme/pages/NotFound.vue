<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'
import { withBase } from 'vitepress'
import { data as allPosts, type Post } from '../data/posts.data'
import { DICT, TEMAS_EN, type I18nKey } from '../lib/i18n'
import SceneArt from '../components/SceneArt.vue'
import LogList from '../components/LogList.vue'

const path = shallowRef('')
const stamp = shallowRef('')

/* a 404 é uma página só; o idioma sai do endereço que a pessoa tentou abrir */
const isEn = computed(() => path.value.startsWith('/en/') || path.value === '/en')
const t = (k: I18nKey, vars: Record<string, string | number> = {}) => {
  let s = DICT[isEn.value ? 'en' : 'pt'][k]
  for (const [a, b] of Object.entries(vars)) s = s.replace(`{${a}}`, String(b))
  return s
}
const posts = computed<Post[]>(() =>
  isEn.value
    ? allPosts.map((p) => ({ ...p, ...(p.en ?? {}), tema: TEMAS_EN[p.tema] ?? p.tema, url: p.enUrl, ptOnly: !p.en }))
    : allPosts
)
const home = computed(() => (isEn.value ? '/en/' : '/'))
const archive = computed(() => (isEn.value ? '/en/arquivos' : '/arquivos'))

onMounted(() => {
  path.value = decodeURIComponent(location.pathname)
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  stamp.value = `[${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}]`
})

const log = computed(() =>
  path.value
    ? `${stamp.value} GET ${path.value}\n${stamp.value} ${t('e404.searching', { n: posts.value.length })}\n${stamp.value} ${t('e404.error')}`
    : ''
)

/* compara o endereço digitado com os títulos e pastas dos posts (semelhança por pares de letras) */
function slug(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
function bigrams(s: string) {
  const m = new Map<string, number>()
  for (let i = 0; i < s.length - 1; i++) m.set(s.slice(i, i + 2), (m.get(s.slice(i, i + 2)) || 0) + 1)
  return m
}
function similar(a: string, b: string) {
  const A = bigrams(a), B = bigrams(b)
  let inter = 0, na = 0, nb = 0
  A.forEach((v, k) => { na += v; inter += Math.min(v, B.get(k) || 0) })
  B.forEach((v) => (nb += v))
  return na + nb ? (2 * inter) / (na + nb) : 0
}

const guesses = computed<Post[]>(() => {
  const target = slug(path.value.split('/').filter(Boolean).pop() || '')
  if (!target) return []
  return posts.value
    .map((p) => ({ p, s: Math.max(similar(target, slug(p.titulo)), similar(target, slug(p.slug.replace(/^\d+-/, '')))) }))
    .filter((x) => x.s > 0.35)
    .sort((a, b) => b.s - a.s)
    .slice(0, 2)
    .map((x) => x.p)
})
const suggestions = computed(() => (guesses.value.length ? guesses.value : posts.value.slice(0, 3)))

function focusSearch() {
  window.scrollTo(0, 0)
  document.getElementById('q')?.focus()
}
</script>

<template>
  <section class="err">
    <pre class="errlog">{{ log }}</pre>
    <h1 class="e404">404<span class="cursor" aria-hidden="true"></span></h1>
    <p class="err-msg">{{ t('e404.msg') }}</p>
    <SceneArt scene="404/sinal" :ratio="340 / 110" :label="t('e404.art')" />
    <h2 class="bar">
      <span class="rlbl">▸ {{ guesses.length ? t('e404.maybe') : t('e404.latest') }}</span>
    </h2>
    <LogList :posts="suggestions" />
    <p class="err-actions">
      <a :href="withBase(home)">{{ t('e404.back') }}</a><span>·</span><a :href="withBase(archive)">{{ t('e404.archive') }}</a><span>·</span
      ><button type="button" class="linkbtn" @click="focusSearch">{{ t('e404.search') }}</button>
    </p>
  </section>
</template>

<style scoped>
.err {
  margin-top: 40px;
  display: grid;
  gap: 16px;
}
.errlog {
  margin: 0;
  min-height: 5.1em;
  background: var(--bar);
  border: 1px solid var(--rule);
  font-family: var(--mono);
  font-size: 12px;
  line-height: 1.7;
  padding: 10px 12px;
  color: var(--muted);
  overflow-x: auto;
  white-space: pre;
}
.e404 {
  font-family: var(--mono);
  font-weight: 700;
  font-size: 96px;
  line-height: 1;
  letter-spacing: -0.05em;
  margin: 8px 0 0;
}
.cursor {
  display: inline-block;
  width: 0.5em;
  height: 0.09em;
  background: var(--ink);
  margin-left: 4px;
  animation: blink 1.1s steps(1) infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}
.err-msg {
  margin: 0;
  max-width: 34em;
}
.err .bar {
  padding: 4px 8px;
  margin-top: 8px;
}
.err-actions {
  font-family: var(--mono);
  font-size: 13px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  margin: 4px 0 0;
}
.err-actions span {
  color: var(--muted);
}
@media (max-width: 560px) {
  .e404 {
    font-size: 72px;
  }
}
</style>
