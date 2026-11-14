<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

/*
  Botão compacto ("tag: todas ▾") que abre uma janelinha com as opções e a contagem.
  Escala bem com muitas opções: lista com rolagem e, se pedido, campo de procura.
*/
export interface Option {
  value: string | null
  label: string
  count?: number
}

const props = defineProps<{
  label: string
  title: string
  options: Option[]
  modelValue: string | null
  findable?: boolean
  findPlaceholder?: string
  countLabel?: string
  nothingLabel?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()

const open = ref(false)
const query = ref('')
const root = ref<HTMLElement>()
const pop = ref<HTMLElement>()
const alignRight = ref(false)

const current = computed(() => props.options.find((o) => o.value === props.modelValue))
const active = computed(() => props.modelValue !== null && props.options[0]?.value === null)

function norm(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}
const shown = computed(() => {
  const q = norm(query.value.trim().replace(/^#/, ''))
  return q ? props.options.filter((o) => norm(o.label).includes(q)) : props.options
})

async function toggle() {
  open.value = !open.value
  query.value = ''
  if (!open.value) return
  alignRight.value = false
  await nextTick()
  const r = pop.value?.getBoundingClientRect()
  if (r && r.right > window.innerWidth - 12) alignRight.value = true
  const target = pop.value?.querySelector<HTMLElement>(props.findable ? 'input' : '[aria-pressed="true"]')
  target?.focus()
}
function choose(v: string | null) {
  emit('update:modelValue', v)
  open.value = false
}
function onDoc(e: MouseEvent) {
  if (open.value && root.value && !root.value.contains(e.target as Node)) open.value = false
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) {
    open.value = false
    root.value?.querySelector<HTMLElement>('.ddbtn')?.focus()
  }
}
onMounted(() => {
  document.addEventListener('click', onDoc)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDoc)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <span ref="root" class="dd">
    <button type="button" class="ddbtn" :class="{ on: active }" aria-haspopup="dialog" :aria-expanded="open" @click.stop="toggle">
      <span class="k">{{ label }}:</span>
      <b>{{ current?.label }}</b>
      <span class="k">▾</span>
    </button>
    <div v-if="open" ref="pop" class="pop" :class="{ right: alignRight }" role="dialog" :aria-label="title">
      <div class="pop-bar">
        <span>{{ title }}</span><span>{{ countLabel }}</span>
      </div>
      <input
        v-if="findable"
        v-model="query"
        type="search"
        autocomplete="off"
        :placeholder="findPlaceholder"
        :aria-label="findPlaceholder"
      />
      <ul>
        <li v-for="o in shown" :key="String(o.value)">
          <button type="button" class="popopt" :aria-pressed="o.value === modelValue" @click="choose(o.value)">
            <span class="nm">{{ o.label }}</span><i></i><small v-if="o.count !== undefined">{{ o.count }}</small>
          </button>
        </li>
      </ul>
      <p v-if="!shown.length" class="none">{{ nothingLabel || 'nada encontrado' }}</p>
    </div>
  </span>
</template>

<style scoped>
.dd {
  position: relative;
}
.ddbtn {
  font: inherit;
  color: var(--ink);
  background: var(--bg);
  border: 1px solid var(--rule);
  padding: 3px 8px;
  cursor: pointer;
  display: flex;
  gap: 6px;
  align-items: baseline;
}
.ddbtn b {
  font-weight: 500;
}
.ddbtn .k {
  color: var(--muted);
}
.ddbtn:hover,
.ddbtn[aria-expanded='true'] {
  border-color: var(--ink);
  background: var(--bar);
}
.ddbtn.on {
  border-color: var(--ink);
}
.ddbtn.on b {
  background: var(--sel);
  padding: 0 2px;
  font-weight: 700;
}
.pop {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 16;
  width: 250px;
  max-width: calc(100vw - 32px);
  background: var(--bg);
  border: 1px solid var(--ink);
  box-shadow: 4px 4px 0 var(--ink);
}
.pop.right {
  left: auto;
  right: 0;
}
.pop-bar {
  background: var(--bar);
  border-bottom: 1px solid var(--ink);
  display: flex;
  justify-content: space-between;
  padding: 3px 8px;
  font-size: 11px;
}
.pop-bar span:last-child {
  color: var(--muted);
}
input {
  display: block;
  width: calc(100% - 16px);
  margin: 8px 8px 2px;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--ink);
  background: var(--bg);
  border: 1px solid var(--ink);
  border-radius: 0;
  padding: 3px 6px;
  box-shadow: inset 2px 2px 0 var(--bar);
}
ul {
  list-style: none;
  margin: 0;
  padding: 4px 0;
  max-height: 232px;
  overflow-y: auto;
}
.popopt {
  display: flex;
  gap: 8px;
  align-items: baseline;
  width: 100%;
  font: inherit;
  background: none;
  border: 0;
  padding: 4px 10px;
  color: var(--link);
  cursor: pointer;
  text-align: left;
}
.popopt:hover,
.popopt:focus-visible {
  background: var(--bar);
}
.nm {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.popopt i {
  flex: 1;
  border-bottom: 1px dotted currentColor;
  opacity: 0.35;
  transform: translateY(-4px);
  min-width: 12px;
}
small {
  color: var(--muted);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}
.popopt[aria-pressed='true'] {
  color: var(--ink);
  font-weight: 700;
}
.popopt[aria-pressed='true'] .nm::before {
  content: '» ';
}
.none {
  margin: 0;
  padding: 4px 10px 10px;
  color: var(--muted);
}
</style>
