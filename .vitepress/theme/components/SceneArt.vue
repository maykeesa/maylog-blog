<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'
import { HOME_SCENES, sceneUrl } from '../lib/scenes'
import { useI18n } from '../composables/useI18n'
import BannerArt from './BannerArt.vue'

/*
  Cena pontilhada, recortada no formato pedido (ratio) e pintada na cor do tema.
  - Com "scene": mostra sempre aquela cena (ex.: "lua", "404/sinal").
  - Sem "scene": sorteia uma das cenas da home cada vez que aparece, sem repetir a última vista.
  - Com "caption": mostra o nome da cena embaixo.
*/
const {
  scene: fixedScene,
  ratio = 340 / 190,
  caption = false,
  label
} = defineProps<{
  scene?: string
  ratio?: number
  caption?: boolean
  label?: string
}>()

const LAST_KEY = 'maylog-last-scene'
const picked = shallowRef('')
const { t, cena } = useI18n()

const name = computed(() => fixedScene ?? picked.value)
const url = computed(() => (name.value ? sceneUrl(name.value) : undefined))
const captionText = computed(() => `${t('art.scene')}: ${name.value ? cena(name.value.replace(/^.*\//, '')) : '—'}`)

/* sorteia uma cena diferente da última que o leitor viu (lembrada só nesta aba) */
function pickRandom() {
  let last = ''
  try {
    last = sessionStorage.getItem(LAST_KEY) || ''
  } catch {
    /* sem armazenamento: sorteia sem essa regra */
  }
  const options = HOME_SCENES.filter((s) => s !== last)
  picked.value = options[Math.floor(Math.random() * options.length)] ?? HOME_SCENES[0] ?? ''
  try {
    sessionStorage.setItem(LAST_KEY, picked.value)
  } catch {
    /* sem armazenamento */
  }
}

onMounted(() => {
  if (!fixedScene) pickRandom()
})
</script>

<template>
  <div class="scene">
    <div class="frame" :style="{ aspectRatio: String(ratio) }">
      <BannerArt v-if="url" :src="url" :alt="label || t('art.label')" cover />
    </div>
    <p v-if="caption" class="artcap">{{ captionText }}</p>
  </div>
</template>

<style scoped>
.scene {
  display: grid;
  gap: 6px;
}
.frame {
  overflow: hidden;
}
.artcap {
  margin: 0;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--muted);
}
</style>
