<script setup lang="ts">
import type { Segment } from '../lib/search'

/* Texto com os trechos encontrados pela busca marcados em amarelo. */
const { parts } = defineProps<{ parts: Segment[] }>()
</script>

<template>
  <template v-for="(part, i) in parts" :key="i"><mark v-if="part.hit">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
</template>

<style scoped>
mark {
  background: var(--sel);
  color: inherit;
  padding: 0 1px;
}
</style>
