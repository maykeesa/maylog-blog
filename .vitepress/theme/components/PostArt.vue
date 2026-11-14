<script setup lang="ts">
import { computed } from 'vue'
import type { Post } from '../data/posts.data'
import { sceneFor } from '../lib/sceneFor'
import { bannerOf } from '../lib/banners'
import BannerArt from './BannerArt.vue'
import SceneArt from './SceneArt.vue'

/* Miniatura de um post: o banner pontilhado, ou a cena fixa do post quando não há banner. */
const { post, width, height } = defineProps<{ post: Post; width: number; height: number }>()
const banner = computed(() => bannerOf(post))
const ratio = computed(() => width / height)
</script>

<template>
  <div v-if="banner?.dither" class="thumb" :style="{ aspectRatio: String(ratio) }">
    <BannerArt :src="banner.dither" cover />
  </div>
  <SceneArt v-else :scene="sceneFor(post)" :ratio="ratio" />
</template>

<style scoped>
.thumb {
  overflow: hidden;
}
</style>
