<script setup lang="ts">
import { computed } from 'vue'
import type { Post } from '../data/posts.data'
import { sceneFor } from '../lib/sceneFor'
import DitherArt from './DitherArt.vue'

/* A imagem de um post em miniatura: a cena pontilhada fixa do post. */
const props = defineProps<{ post: Post; width: number; height: number }>()
const s = computed(() => sceneFor(props.post))
</script>

<template>
  <DitherArt :width="width" :height="height" :scene="s.scene" :seed="s.seed" />
</template>
