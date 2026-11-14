<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'
import { loadBits } from '../lib/banners'
import { paintBits } from '../lib/dither'
import { useTheme } from '../composables/useTheme'
import { useI18n } from '../composables/useI18n'

/*
  Banner pontilhado recolorido com a tinta do tema atual.
  Com "original", clicar troca pela foto colorida (e volta no segundo clique).
*/
const { src, original, alt, cover = false } = defineProps<{
  src: string
  original?: string
  alt?: string
  cover?: boolean
}>()

const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const showOriginal = shallowRef(false)
const { onThemeChange } = useTheme()
const { t } = useI18n()

async function draw() {
  const el = canvas.value
  if (!el) return
  try {
    const { bits, w, h } = await loadBits(src)
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
watch(() => src, draw)

function toggle() {
  if (original) showOriginal.value = !showOriginal.value
}
</script>

<template>
  <div class="banner" :class="{ cover, clickable: !!original }">
    <canvas
      v-show="!showOriginal"
      ref="canvas"
      class="dither"
      role="img"
      :aria-label="alt || t('banner.alt')"
      :title="original ? t('banner.toOriginal') : undefined"
      @click="toggle"
    ></canvas>
    <img
      v-if="original && showOriginal"
      :src="original"
      :alt="alt || t('banner.originalAlt')"
      :title="t('banner.toDither')"
      @click="toggle"
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
