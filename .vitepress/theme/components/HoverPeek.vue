<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vitepress'
import { watch } from 'vue'
import { data as posts } from '../data/posts.data'
import PostArt from './PostArt.vue'

/*
  Janelinha de prévia que segue o mouse sobre qualquer link de post com data-n
  (listas da home, arquivos, 404). Só em telas com mouse.
*/
const n = ref<string | null>(null)
const pos = ref({ left: 0, top: 0 })
const box = ref<HTMLElement>()
const post = computed(() => posts.find((p) => p.n === n.value))
const route = useRoute()

let enabled = false

async function place(x: number, y: number) {
  await nextTick()
  const el = box.value
  if (!el) return
  const pw = el.offsetWidth, ph = el.offsetHeight
  let left = x + 18, top = y + 18
  if (left + pw > window.innerWidth - 12) left = Math.max(12, x - pw - 18)
  if (top + ph > window.innerHeight - 12) top = Math.max(12, y - ph - 18)
  pos.value = { left, top }
}

function linkFrom(e: Event) {
  return (e.target as HTMLElement | null)?.closest?.('a[data-n]') as HTMLAnchorElement | null
}
function onOver(e: MouseEvent) {
  const a = linkFrom(e)
  if (!a) return
  n.value = a.dataset.n || null
  place(e.clientX, e.clientY)
}
function onMove(e: MouseEvent) {
  if (n.value) place(e.clientX, e.clientY)
}
function onOut(e: MouseEvent) {
  const a = linkFrom(e)
  if (a && !a.contains(e.relatedTarget as Node)) n.value = null
}
function hide() {
  n.value = null
}

onMounted(() => {
  enabled = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  if (!enabled) return
  document.addEventListener('mouseover', onOver)
  document.addEventListener('mousemove', onMove, { passive: true })
  document.addEventListener('mouseout', onOut)
  document.addEventListener('click', hide)
})
onBeforeUnmount(() => {
  document.removeEventListener('mouseover', onOver)
  document.removeEventListener('mousemove', onMove)
  document.removeEventListener('mouseout', onOut)
  document.removeEventListener('click', hide)
})
watch(() => route.path, hide)
</script>

<template>
  <div v-if="post" ref="box" class="peek" aria-hidden="true" :style="{ left: pos.left + 'px', top: pos.top + 'px' }">
    <div class="peek-bar"><span>entrada {{ post.n }}.md</span><span>_□×</span></div>
    <div class="peek-body">
      <PostArt :post="post" :width="280" :height="80" />
      <p class="peek-t">{{ post.titulo }}</p>
      <p class="peek-ex">{{ post.resumo }}</p>
      <p class="peek-m">{{ post.minutos }} min · {{ post.tema }} · clique para ler</p>
    </div>
  </div>
</template>

<style scoped>
.peek {
  position: fixed;
  z-index: 20;
  width: 300px;
  max-width: calc(100vw - 32px);
  background: var(--bg);
  color: var(--ink);
  border: 1px solid var(--ink);
  box-shadow: 4px 4px 0 var(--ink);
  pointer-events: none;
}
.peek-bar {
  background: var(--bar);
  border-bottom: 1px solid var(--ink);
  font-family: var(--mono);
  font-size: 11px;
  display: flex;
  justify-content: space-between;
  padding: 3px 8px;
}
.peek-bar span:last-child {
  letter-spacing: 0.15em;
}
.peek-body {
  padding: 10px;
  display: grid;
  gap: 8px;
}
.peek-t {
  font-weight: 600;
  font-size: 17px;
  line-height: 1.25;
  margin: 0;
}
.peek-ex {
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.peek-m {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--muted);
  margin: 0;
}
</style>
