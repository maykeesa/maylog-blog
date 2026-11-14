<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RANDOM_SCENES, paintBits, sceneBits } from '../lib/dither'
import { useTheme } from '../composables/useTheme'
import { useI18n } from '../composables/useI18n'

/*
  Imagem pontilhada gerada na hora.
  Sem "scene", sorteia uma das cenas; com "shuffle", mostra a legenda e o botão de sortear outra.
*/
const props = defineProps<{
  width: number
  height: number
  scene?: string
  seed?: number
  shuffle?: boolean
  captionPrefix?: string
  label?: string
}>()

const cv = ref<HTMLCanvasElement>()
const scene = ref(props.scene ?? '')
const seed = ref(props.seed ?? 1)
const { onThemeChange } = useTheme()
const { t, cena } = useI18n()

function draw() {
  if (!cv.value || !scene.value) return
  paintBits(cv.value, sceneBits(scene.value, seed.value, props.width, props.height))
}

function pick() {
  let next: string
  do next = RANDOM_SCENES[Math.floor(Math.random() * RANDOM_SCENES.length)]
  while (next === scene.value && RANDOM_SCENES.length > 1)
  scene.value = next
  seed.value = 1 + Math.floor(Math.random() * 99999)
  draw()
}

let off: (() => void) | undefined
onMounted(() => {
  if (!props.scene) pick()
  else draw()
  off = onThemeChange(() => requestAnimationFrame(draw))
})
onBeforeUnmount(() => off?.())
watch(() => [props.scene, props.seed], () => {
  if (props.scene) {
    scene.value = props.scene
    seed.value = props.seed ?? 1
    draw()
  }
})
</script>

<template>
  <div class="art">
    <canvas
      ref="cv"
      class="dither"
      :class="{ clickable: shuffle }"
      :width="width"
      :height="height"
      role="img"
      :aria-label="label || t('art.label')"
      :title="shuffle ? t('art.shuffleTitle') : undefined"
      @click="shuffle && pick()"
    ></canvas>
    <div v-if="shuffle" class="artcap">
      <span>{{ captionPrefix }}{{ t('art.scene') }}: {{ scene ? cena(scene) : '—' }} · {{ RANDOM_SCENES.indexOf(scene) + 1 }}/{{ RANDOM_SCENES.length }}</span>
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
