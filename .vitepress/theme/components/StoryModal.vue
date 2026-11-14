<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Post } from '../data/posts.data'
import { drawStory, type StoryLayout, type StoryTheme } from '../lib/story'
import { useI18n } from '../composables/useI18n'

const props = defineProps<{ post: Post; url: string; quote: string; fromSelection: boolean; theme: StoryTheme }>()
const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()

const layout = ref<StoryLayout>(props.fromSelection ? 'citacao' : 'capa')
const theme = ref<StoryTheme>(props.theme)
const src = ref('')
const canSend = ref(false)
const closeBtn = ref<HTMLButtonElement>()
let blob: Blob | null = null

const fileName = `maylog-${props.post.n}-stories.png`

async function render() {
  const cv = await drawStory(props.post, { layout: layout.value, theme: theme.value, quote: props.quote, url: props.url, labels: { entry: t('story.entry'), excerpt: t('story.excerpt'), readFull: t('story.readFull') } })
  src.value = cv.toDataURL('image/png')
  blob = await new Promise<Blob | null>((r) => cv.toBlob(r, 'image/png'))
}

function download() {
  const a = document.createElement('a')
  a.href = src.value
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
}
async function send() {
  if (!blob) return
  try {
    await navigator.share({ files: [new File([blob], fileName, { type: 'image/png' })], title: props.post.titulo })
  } catch {
    /* compartilhamento cancelado */
  }
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(async () => {
  document.addEventListener('keydown', onKey)
  document.body.style.overflow = 'hidden'
  try {
    canSend.value = !!navigator.canShare?.({ files: [new File([''], 'x.png', { type: 'image/png' })] })
  } catch {
    canSend.value = false
  }
  await nextTick()
  closeBtn.value?.focus()
  render()
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
watch([layout, theme], render)

const tip = () =>
  layout.value === 'capa'
    ? t('story.tipCover')
    : props.fromSelection
      ? t('story.tipSel')
      : t('story.tipQuote')
</script>

<template>
  <div class="modal-back" @click.self="emit('close')">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="story-h">
      <div class="modal-bar">
        <span id="story-h">{{ t('story.title') }}</span>
        <button ref="closeBtn" type="button" class="linkbtn x" :aria-label="t('story.close')" @click="emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="story-prev"><img v-if="src" :src="src" :alt="t('story.preview')" /></div>
        <div class="story-ctl">
          <div>
            <p class="lbl">{{ t('story.format') }}</p>
            <div class="seg">
              <button type="button" :aria-pressed="layout === 'capa'" @click="layout = 'capa'">{{ t('story.cover') }}</button>
              <button type="button" :aria-pressed="layout === 'citacao'" @click="layout = 'citacao'">{{ t('story.quote') }}</button>
            </div>
          </div>
          <div>
            <p class="lbl">{{ t('story.theme') }}</p>
            <div class="seg">
              <button v-for="t in (['white', 'dark', 'sepia'] as const)" :key="t" type="button" :aria-pressed="theme === t" @click="theme = t">{{ t }}</button>
            </div>
          </div>
          <p class="tip">{{ tip() }}</p>
          <div class="actions">
            <button type="button" class="btn" :disabled="!src" @click="download">{{ t('story.download') }}</button>
            <button v-if="canSend" type="button" class="btn" :disabled="!src" @click="send">{{ t('story.send') }}</button>
          </div>
          <p class="note">{{ t('story.note') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-back {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: rgba(0, 0, 0, 0.45);
  display: grid;
  place-items: center;
  padding: max(16px, env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) max(16px, env(safe-area-inset-bottom, 0px))
    max(16px, env(safe-area-inset-left, 0px));
}
.modal {
  background: var(--bg);
  color: var(--ink);
  border: 1px solid var(--ink);
  box-shadow: 6px 6px 0 var(--ink);
  width: min(720px, 100%);
  max-height: 100%;
  overflow: auto;
}
.modal-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bar);
  border-bottom: 1px solid var(--ink);
  font-family: var(--mono);
  font-size: 12px;
  padding: 3px 8px;
}
.x {
  font-size: 16px;
  text-decoration: none;
  padding: 0 4px;
  color: var(--ink);
}
.modal-body {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 20px;
  padding: 16px;
}
.story-prev img,
.story-prev:empty {
  display: block;
  height: min(62vh, 560px);
  aspect-ratio: 9 / 16;
  border: 1px solid var(--rule);
  background: var(--bar);
}
.story-ctl {
  display: grid;
  gap: 16px;
  align-content: start;
  font-family: var(--mono);
  font-size: 12px;
  min-width: 0;
}
.lbl {
  margin: 0 0 4px;
  color: var(--muted);
}
.seg {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 8px;
}
.seg button {
  font: inherit;
  font-size: 13px;
  background: none;
  border: 0;
  color: var(--link);
  cursor: pointer;
  padding: 2px;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.seg button[aria-pressed='true'] {
  color: var(--ink);
  font-weight: 700;
  text-decoration: none;
}
.seg button[aria-pressed='true']::before {
  content: '[';
}
.seg button[aria-pressed='true']::after {
  content: ']';
}
.tip {
  margin: 0;
  background: var(--bar);
  padding: 6px 8px;
  line-height: 1.5;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.btn {
  font-family: var(--mono);
  font-size: 13px;
  color: var(--ink);
  background: var(--bg);
  border: 1px solid var(--ink);
  box-shadow: 2px 2px 0 var(--ink);
  padding: 6px 12px;
  cursor: pointer;
}
.btn:hover {
  background: var(--bar);
}
.btn:active {
  transform: translate(2px, 2px);
  box-shadow: none;
}
.btn:disabled {
  opacity: 0.5;
  cursor: default;
}
.note {
  margin: 0;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.55;
}
@media (max-width: 600px) {
  .modal-body {
    grid-template-columns: 1fr;
  }
  .story-prev img,
  .story-prev:empty {
    height: auto;
    width: 100%;
    max-width: 260px;
    margin: 0 auto;
  }
}
</style>
