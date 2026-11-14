<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'

/*
  Seção com a barra cinza que abre e fecha.
  O estado (aberta ou fechada) fica salvo no navegador, por seção.
*/
const { id, label, side } = defineProps<{
  id: string
  label: string
  side?: string
}>()

const STORAGE = 'maylog-closed'
const open = shallowRef(true)

function readClosed(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE) || '{}') || {}
  } catch {
    return {}
  }
}

onMounted(() => {
  open.value = !readClosed()[id]
})

function toggle() {
  open.value = !open.value
  const closed = readClosed()
  closed[id] = !open.value
  try {
    localStorage.setItem(STORAGE, JSON.stringify(closed))
  } catch {
    /* sem armazenamento: o estado vale só nesta visita */
  }
}

defineExpose({ open: () => !open.value && toggle() })
</script>

<template>
  <section class="sec" :class="{ closed: !open }">
    <h2 class="bar">
      <button type="button" :aria-expanded="open" :aria-controls="`sec-${id}`" @click="toggle">
        <span class="chev" aria-hidden="true">{{ open ? '▾' : '▸' }}</span>
        <span class="lbl">{{ label }}</span>
      </button>
      <span v-if="side || $slots.side" class="side"><slot name="side">{{ side }}</slot></span>
    </h2>
    <div v-show="open" :id="`sec-${id}`" class="sec-body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.sec {
  margin-top: 40px;
}
.bar button {
  font: inherit;
  color: var(--ink);
  background: none;
  border: 0;
  padding: 4px 8px;
  cursor: pointer;
  flex: 1;
  text-align: left;
  display: flex;
  gap: 6px;
  align-items: baseline;
  letter-spacing: inherit;
}
.bar button:hover .lbl {
  text-decoration: underline;
  text-underline-offset: 3px;
}
.chev {
  display: inline-block;
  width: 1ch;
}
.sec-body {
  padding-top: 14px;
}
.closed .bar {
  opacity: 0.85;
}
</style>
