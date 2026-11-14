<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'
import { RANDOM_SCENES, paintBits, sceneBits } from '../lib/dither'
import { useTheme } from '../composables/useTheme'
import { useI18n } from '../composables/useI18n'

/*
  Imagem pontilhada gerada na hora.
  Sem "scene", sorteia uma das cenas; com "shuffle", mostra a legenda e o botão de sortear outra.
*/
const {
  width,
  height,
  scene: fixedScene,
  seed: fixedSeed = 1,
  shuffle = false,
  captionPrefix = '',
  label
} = defineProps<{
  width: number
  height: number
  scene?: string
  seed?: number
  shuffle?: boolean
  captionPrefix?: string
  label?: string
}>()

const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const scene = shallowRef(fixedScene ?? '')
const seed = shallowRef(fixedSeed)
const { onThemeChange } = useTheme()
const { t, cena } = useI18n()

const caption = computed(
  () => `${captionPrefix}${t('art.scene')}: ${scene.value ? cena(scene.value) : '—'} · ${RANDOM_SCENES.indexOf(scene.value) + 1}/${RANDOM_SCENES.length}`
)

function draw() {
  if (!canvas.value || !scene.value) return
  paintBits(canvas.value, sceneBits(scene.value, seed.value, width, height))
}

function pick() {
  let next: string
  do next = RANDOM_SCENES[Math.floor(Math.random() * RANDOM_SCENES.length)]
  while (next === scene.value && RANDOM_SCENES.length > 1)
  scene.value = next
  seed.value = 1 + Math.floor(Math.random() * 99999)
  draw()
}

function onCanvasClick() {
  if (shuffle) pick()
}

let off: (() => void) | undefined
onMounted(() => {
  if (!fixedScene) pick()
  else draw()
  off = onThemeChange(() => requestAnimationFrame(draw))
})
onBeforeUnmount(() => off?.())
/* quando quem usa troca a cena fixa (ex.: outro post), redesenha */
watch(
  () => [fixedScene, fixedSeed] as const,
  ([s, sd]) => {
    if (!s) return
    scene.value = s
    seed.value = sd
    draw()
  }
)
</script>

<template>
  <div class="art">
    <canvas
      ref="canvas"
      class="dither"
      :class="{ clickable: shuffle }"
      :width="width"
      :height="height"
      role="img"
      :aria-label="label || t('art.label')"
      :title="shuffle ? t('art.shuffleTitle') : undefined"
      @click="onCanvasClick"
    ></canvas>
    <div v-if="shuffle" class="artcap">
      <span>{{ caption }}</span>
      <button type="button" class="linkbtn" @click="pick">{{ t('art.shuffle') }}</button>
    </div>
  </div>
</template>

<style scoped>
.art {
  display: grid;
  gap: 6px;
}
.clickable {
  cursor: pointer;
}
.artcap {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--muted);
  display: flex;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
