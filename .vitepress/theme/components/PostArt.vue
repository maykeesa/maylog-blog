<script setup lang="ts">
import { computed } from 'vue'
import type { Post } from '../data/posts.data'
import { sceneFor } from '../lib/sceneFor'
import { bannerOf } from '../lib/banners'
import DitherArt from './DitherArt.vue'
import BannerArt from './BannerArt.vue'

/* Miniatura de um post: o banner pontilhado, ou a cena fixa do post quando não há banner. */
const { post, width, height } = defineProps<{ post: Post; width: number; height: number }>()
const banner = computed(() => bannerOf(post))
const s = computed(() => sceneFor(post))
</script>

<template>
  <div v-if="banner?.dither" class="thumb" :style="{ aspectRatio: `${width} / ${height}` }">
    <BannerArt :src="banner.dither" cover />
  </div>
  <DitherArt v-else :width="width" :height="height" :scene="s.scene" :seed="s.seed" />
</template>

<style scoped>
.thumb {
  overflow: hidden;
}
</style>
