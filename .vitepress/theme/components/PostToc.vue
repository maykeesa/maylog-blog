<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'
import Section from './Section.vue'
import { useI18n } from '../composables/useI18n'

/*
  Sumário do post, montado a partir dos subtítulos (##) já renderizados.
  Aparece no topo (com 3 ou mais partes) e numa barra fixa que surge ao rolar,
  com a parte atual, o sumário recolhível e uma linha de progresso de leitura.
*/
const props = defineProps<{ title: string }>()

interface Head {
  id: string
  text: string
}
const MIN = 3
const heads = ref<Head[]>([])
const current = ref(-1)
const showBar = ref(false)
const popOpen = ref(false)
const progress = ref(0)
const wrap = ref<HTMLElement>()
const route = useRoute()
const { t } = useI18n()

let headEls: HTMLElement[] = []

function collect() {
  headEls = Array.from(document.querySelectorAll<HTMLElement>('.post-body > h2'))
  heads.value = headEls.map((h) => ({
    id: h.id,
    /* o VitePress põe uma âncora invisível no fim do subtítulo; fica só o texto */
    text: (h.textContent || '').replace(/[​‌‍﻿]/g, '').replace(/\s*#\s*$/, '').trim()
  }))
  update()
}

function update() {
  const h1 = document.querySelector('.post h1')
  showBar.value = !!h1 && h1.getBoundingClientRect().bottom < 0
  if (!showBar.value) popOpen.value = false
  let idx = -1
  headEls.forEach((h, i) => {
    if (h.getBoundingClientRect().top < 100) idx = i
  })
  current.value = idx
  const art = document.querySelector('.post')?.getBoundingClientRect()
  if (art) {
    const total = art.height - window.innerHeight
    progress.value = total > 0 ? Math.min(1, Math.max(0, -art.top / total)) : 1
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

function onDoc(e: MouseEvent) {
  if (popOpen.value && wrap.value && !wrap.value.contains(e.target as Node)) popOpen.value = false
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') popOpen.value = false
}

onMounted(() => {
  collect()
  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)
  document.addEventListener('click', onDoc)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', update)
  window.removeEventListener('resize', update)
  document.removeEventListener('click', onDoc)
  document.removeEventListener('keydown', onKey)
})
watch(
  () => route.path,
  () => nextTick(collect)
)
</script>

<template>
  <Section v-if="heads.length >= MIN" id="sumario" :label="t('toc.title')" :side="`${heads.length} ${t('toc.parts')}`" class="toc">
    <ol class="toc-list">
      <li v-for="h in heads" :key="h.id">
        <a :href="`#${h.id}`"><span class="tt">{{ h.text }}</span><i></i>↓</a>
      </li>
    </ol>
  </Section>

  <div v-show="showBar" class="postbar">
    <div class="postbar-in">
      <div class="pb-text">
        <span class="pb-title">{{ props.title }}</span>
        <span class="pb-sec">§ {{ pad(current + 1) }} · {{ current >= 0 ? heads[current]?.text : t('toc.intro') }}</span>
      </div>
      <div v-if="heads.length >= MIN" ref="wrap" class="pb-toc">
        <button type="button" class="ddbtn" :aria-expanded="popOpen" @click.stop="popOpen = !popOpen">
          <span class="k">{{ t('toc.contents') }}</span><b>{{ pad(current + 1) }}/{{ pad(heads.length) }}</b><span class="k">▾</span>
        </button>
        <div v-if="popOpen" class="pop">
          <div class="pop-bar"><span>{{ t('toc.title') }}</span><span>{{ heads.length }} {{ t('toc.parts') }}</span></div>
          <ol class="toc-list">
            <li v-for="(h, i) in heads" :key="h.id" :class="{ active: i === current }">
              <a :href="`#${h.id}`" @click="popOpen = false"><span class="tt">{{ h.text }}</span><i></i>↓</a>
            </li>
          </ol>
        </div>
      </div>
    </div>
    <div class="pb-progress" aria-hidden="true"><span :style="{ width: progress * 100 + '%' }"></span></div>
  </div>
</template>

<style scoped>
.toc {
  margin: 0 0 32px;
}
.toc :deep(.sec-body) {
  padding-top: 6px;
}
.toc-list {
  list-style: none;
  margin: 0;
  padding: 0;
  counter-reset: toc;
  font-family: var(--mono);
  font-size: 13px;
}
.toc-list li {
  counter-increment: toc;
  display: flex;
  gap: 10px;
  align-items: baseline;
  border-bottom: 1px dotted var(--rule);
}
.toc-list li::before {
  content: counter(toc, decimal-leading-zero);
  color: var(--muted);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  padding-left: 2px;
}
.toc-list a {
  flex: 1;
  display: flex;
  gap: 8px;
  padding: 5px 2px 5px 0;
  text-decoration: none;
}
.toc-list a:hover .tt {
  text-decoration: underline;
  text-underline-offset: 3px;
}
.toc-list a i {
  flex: 1;
  border-bottom: 1px dotted currentColor;
  opacity: 0.35;
  transform: translateY(-4px);
  min-width: 12px;
}
.toc-list li.active a {
  color: var(--ink);
  font-weight: 700;
}
.toc-list li.active .tt::before {
  content: '» ';
}

.postbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 18;
  background: var(--bg);
  border-bottom: 1px solid var(--rule);
  padding-top: env(safe-area-inset-top, 0px);
}
.postbar-in {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
  padding-left: max(16px, env(safe-area-inset-left, 0px));
  padding-right: max(16px, env(safe-area-inset-right, 0px));
  padding-block: 8px;
}
.pb-text {
  display: grid;
  min-width: 0;
  flex: 1;
}
.pb-title {
  font-weight: 600;
  font-size: 15px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pb-sec {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pb-toc {
  position: relative;
  flex: none;
  font-family: var(--mono);
  font-size: 12px;
}
.ddbtn {
  font: inherit;
  color: var(--ink);
  background: var(--bg);
  border: 1px solid var(--rule);
  padding: 3px 8px;
  cursor: pointer;
  display: flex;
  gap: 6px;
  align-items: baseline;
}
.ddbtn b {
  font-weight: 500;
}
.ddbtn .k {
  color: var(--muted);
}
.ddbtn:hover,
.ddbtn[aria-expanded='true'] {
  border-color: var(--ink);
  background: var(--bar);
}
.pop {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  width: 290px;
  max-width: calc(100vw - 32px);
  background: var(--bg);
  border: 1px solid var(--ink);
  box-shadow: 4px 4px 0 var(--ink);
}
.pop-bar {
  background: var(--bar);
  border-bottom: 1px solid var(--ink);
  display: flex;
  justify-content: space-between;
  padding: 3px 8px;
  font-size: 11px;
}
.pop-bar span:last-child {
  color: var(--muted);
}
.pop .toc-list {
  padding: 4px 8px 6px;
}
.pb-progress {
  height: 2px;
}
.pb-progress span {
  display: block;
  height: 100%;
  background: var(--ink);
}
</style>
