<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'
import type { Post } from '../data/posts.data'
import { data as site } from '../data/site.data'
import { useTheme } from '../composables/useTheme'
import { useI18n } from '../composables/useI18n'
import StoryModal from './StoryModal.vue'

const { post } = defineProps<{ post: Post }>()
const { theme } = useTheme()
const { t } = useI18n()

const url = computed(() => site.url.replace(/\/$/, '') + post.url)
const wa = computed(() => 'https://wa.me/?text=' + encodeURIComponent(`${post.titulo} — ${url.value}`))
const li = computed(() => 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url.value))

const copied = shallowRef('')
const copyLabel = computed(() => copied.value || t('share.copy'))
const hasNative = shallowRef(false)
const story = shallowRef<{ quote: string; fromSelection: boolean } | null>(null)

onMounted(() => (hasNative.value = typeof navigator.share === 'function'))

async function copy() {
  const done = (m: string) => {
    copied.value = m
    setTimeout(() => (copied.value = ''), 1800)
  }
  try {
    await navigator.clipboard.writeText(url.value)
    done(t('share.copied'))
  } catch {
    done(`${t('share.fail')} ${url.value}`)
  }
}
async function native() {
  try {
    await navigator.share({ title: post.titulo, url: url.value })
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
  story.value = { quote: bq || post.subtitulo || post.resumo, fromSelection: false }
}
</script>

<template>
  <div class="share">
    <span class="share-h">{{ t('share.title') }}</span>
    <button type="button" class="linkbtn" @click="copy">{{ copyLabel }}</button>
    <span class="sep">·</span>
    <button type="button" class="linkbtn" @mousedown.prevent @click="openStory">{{ t('share.story') }}</button>
    <span class="sep">·</span>
    <a :href="wa" target="_blank" rel="noopener">whatsapp</a>
    <span class="sep">·</span>
    <a :href="li" target="_blank" rel="noopener">linkedin</a>
    <template v-if="hasNative">
      <span class="sep">·</span>
      <button type="button" class="linkbtn" @click="native">{{ t('share.more') }}</button>
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
