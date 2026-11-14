<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Post } from '../data/posts.data'
import { site } from '../site'
import { useTheme } from '../composables/useTheme'
import StoryModal from './StoryModal.vue'

const props = defineProps<{ post: Post }>()
const { theme } = useTheme()

const url = computed(() => site.url.replace(/\/$/, '') + props.post.url)
const wa = computed(() => 'https://wa.me/?text=' + encodeURIComponent(`${props.post.titulo} — ${url.value}`))
const li = computed(() => 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url.value))

const copyLabel = ref('copiar link')
const hasNative = ref(false)
const story = ref<{ quote: string; fromSelection: boolean } | null>(null)

onMounted(() => (hasNative.value = typeof navigator.share === 'function'))

async function copy() {
  const done = (m: string) => {
    copyLabel.value = m
    setTimeout(() => (copyLabel.value = 'copiar link'), 1800)
  }
  try {
    await navigator.clipboard.writeText(url.value)
    done('link copiado!')
  } catch {
    done(`não deu: ${url.value}`)
  }
}
async function native() {
  try {
    await navigator.share({ title: props.post.titulo, url: url.value })
  } catch {
    /* cancelado */
  }
}

/* se o leitor selecionou um trecho do post antes de clicar, ele vira a citação */
function openStory() {
  const sel = window.getSelection()
  const text = sel?.toString().trim().replace(/\s+/g, ' ') || ''
  const inPost = !!sel?.anchorNode?.parentElement?.closest('.post-body')
  if (inPost && text.length >= 15) {
    story.value = { quote: text.length > 280 ? text.slice(0, 277) + '…' : text, fromSelection: true }
    return
  }
  const bq = document.querySelector('.post-body blockquote')?.textContent?.trim()
  story.value = { quote: bq || props.post.subtitulo || props.post.resumo, fromSelection: false }
}
</script>

<template>
  <div class="share">
    <span class="share-h">compartilhar:</span>
    <button type="button" class="linkbtn" @click="copy">{{ copyLabel }}</button>
    <span class="sep">·</span>
    <button type="button" class="linkbtn" @mousedown.prevent @click="openStory">imagem para stories</button>
    <span class="sep">·</span>
    <a :href="wa" target="_blank" rel="noopener">whatsapp</a>
    <span class="sep">·</span>
    <a :href="li" target="_blank" rel="noopener">linkedin</a>
    <template v-if="hasNative">
      <span class="sep">·</span>
      <button type="button" class="linkbtn" @click="native">mais opções…</button>
    </template>
  </div>
  <StoryModal
    v-if="story"
    :post="post"
    :url="url"
    :quote="story.quote"
    :from-selection="story.fromSelection"
    :theme="theme"
    @close="story = null"
  />
</template>

<style scoped>
.share {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 10px;
  font-family: var(--mono);
  font-size: 13px;
  margin-top: 36px;
  padding: 10px 0;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
}
.share-h,
.sep {
  color: var(--muted);
}
</style>
