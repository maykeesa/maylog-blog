<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { data as posts, type Post } from '../data/posts.data'
import DitherArt from '../components/DitherArt.vue'
import LogList from '../components/LogList.vue'

const path = ref('')
const stamp = ref('')

onMounted(() => {
  path.value = decodeURIComponent(location.pathname)
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  stamp.value = `[${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}]`
})

const log = computed(() =>
  path.value
    ? `${stamp.value} GET ${path.value}\n${stamp.value} procurando nos ${posts.length} registros…\n${stamp.value} ERRO 404: registro não encontrado`
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
  return posts
    .map((p) => ({ p, s: Math.max(similar(target, slug(p.titulo)), similar(target, slug(p.slug.replace(/^\d+-/, '')))) }))
    .filter((x) => x.s > 0.35)
    .sort((a, b) => b.s - a.s)
    .slice(0, 2)
    .map((x) => x.p)
})
const suggestions = computed(() => (guesses.value.length ? guesses.value : posts.slice(0, 3)))
</script>

<template>
  <section class="err">
    <pre class="errlog">{{ log }}</pre>
    <h1 class="e404">404<span class="cursor" aria-hidden="true"></span></h1>
    <p class="err-msg">
      Esta página não existe. Talvez nunca tenha existido, talvez tenha mudado de endereço, ou o link veio com um erro de
      digitação.
    </p>
    <DitherArt :width="340" :height="110" scene="sinal" :seed="404" label="Barras de teste de TV com chuvisco: sem sinal" />
    <h2 class="bar">
      <span class="rlbl">▸ {{ guesses.length ? 'talvez você procurava' : 'enquanto isso, os mais recentes' }}</span>
    </h2>
    <LogList :posts="suggestions" />
    <p class="err-actions">
      <a :href="withBase('/')">← voltar ao log</a><span>·</span><a :href="withBase('/arquivos')">ver arquivos</a>
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
