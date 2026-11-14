<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'
import { RANDOM_SCENES, paintBits, sceneBits } from '../lib/dither'
import { useTheme } from '../composables/useTheme'
import { useI18n } from '../composables/useI18n'

/*
  Imagem pontilhada gerada na hora.
  - Com "scene": desenha sempre aquela cena (ex.: a cena fixa de um post sem banner).
  - Sem "scene": sorteia uma das 20 cenas cada vez que aparece (ex.: a home), sem repetir a última vista.
  - Com "caption": mostra o nome da cena embaixo.
*/
const {
  width,
  height,
  scene: fixedScene,
  seed: fixedSeed = 1,
  caption = false,
  label
} = defineProps<{
  width: number
  height: number
  scene?: string
  seed?: number
  caption?: boolean
  label?: string
}>()

const LAST_KEY = 'maylog-last-scene'
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const scene = shallowRef(fixedScene ?? '')
const seed = shallowRef(fixedSeed)
const { onThemeChange } = useTheme()
const { t, cena } = useI18n()

const captionText = computed(() => `${t('art.scene')}: ${scene.value ? cena(scene.value) : '—'}`)

function draw() {
  if (!canvas.value || !scene.value) return
  paintBits(canvas.value, sceneBits(scene.value, seed.value, width, height))
}

/* sorteia uma cena diferente da última que o leitor viu (lembrada só nesta aba) */
function pickRandom() {
  let last = ''
  try {
    last = sessionStorage.getItem(LAST_KEY) || ''
  } catch {
    /* sem armazenamento: sorteia sem essa regra */
  }
  const options = RANDOM_SCENES.filter((s) => s !== last)
  scene.value = options[Math.floor(Math.random() * options.length)]
  seed.value = 1 + Math.floor(Math.random() * 99999)
  try {
    sessionStorage.setItem(LAST_KEY, scene.value)
  } catch {
    /* sem armazenamento */
  }
  draw()
}

let off: (() => void) | undefined
onMounted(() => {
  if (fixedScene) draw()
  else pickRandom()
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
    <canvas ref="canvas" class="dither" :width="width" :height="height" role="img" :aria-label="label || t('art.label')"></canvas>
    <p v-if="caption" class="artcap">{{ captionText }}</p>
  </div>
</template>

<style scoped>
.art {
  display: grid;
  gap: 6px;
}
.artcap {
  margin: 0;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--muted);
}
</style>
