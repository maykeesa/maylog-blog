<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { loadBits } from '../lib/banners'
import { paintBits } from '../lib/dither'
import { useTheme } from '../composables/useTheme'

/*
  Banner pontilhado recolorido com a tinta do tema atual.
  Com "original", clicar troca pela foto colorida (e volta no segundo clique).
*/
const props = defineProps<{
  src: string
  original?: string
  alt?: string
  cover?: boolean
}>()

const cv = ref<HTMLCanvasElement>()
const showOriginal = ref(false)
const { onThemeChange } = useTheme()

async function draw() {
  const el = cv.value
  if (!el) return
  try {
    const { bits, w, h } = await loadBits(props.src)
    el.width = w
    el.height = h
    paintBits(el, bits)
  } catch {
    /* se o banner não carregar, o espaço fica vazio */
  }
}

let off: (() => void) | undefined
onMounted(() => {
  draw()
  off = onThemeChange(() => requestAnimationFrame(draw))
})
onBeforeUnmount(() => off?.())
watch(() => props.src, draw)
</script>

<template>
  <div class="banner" :class="{ cover, clickable: !!original }">
    <canvas
      v-show="!showOriginal"
      ref="cv"
      class="dither"
      role="img"
      :aria-label="alt || 'Banner pontilhado'"
      :title="original ? 'clique para ver a foto original' : undefined"
      @click="original && (showOriginal = true)"
    ></canvas>
    <img
      v-if="original && showOriginal"
      :src="original"
      :alt="alt || 'Foto original do banner'"
      title="clique para voltar ao pontilhado"
      @click="showOriginal = false"
    />
  </div>
</template>

<style scoped>
.banner {
  aspect-ratio: 340 / 190;
  overflow: hidden;
}
.banner canvas,
.banner img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}
.clickable canvas,
.clickable img {
  cursor: pointer;
}
.cover {
  aspect-ratio: auto;
  height: 100%;
}
</style>
