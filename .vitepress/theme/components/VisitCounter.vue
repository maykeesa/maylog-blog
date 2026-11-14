<script setup lang="ts">
import { computed, nextTick, onMounted, shallowRef } from 'vue'
import { data as site } from '../data/site.data'
import { useI18n } from '../composables/useI18n'

/*
  Contador retrô em formato de botão 88×31: seis dígitos que rolam como um odômetro.
  Mostra os visitantes únicos; passar o mouse mostra também o total de visitas.
    - visita: conta uma vez por sessão (até fechar a aba); as outras páginas só leem os totais
    - visitante: conta uma vez por navegador (um sinal no localStorage, nada vai para o servidor)
*/
const count = shallowRef<number | null>(null)
const visits = shallowRef<number | null>(null)
const isNew = shallowRef(false)
const rolled = shallowRef(false)
const { t, lang } = useI18n()
const locale = computed(() => (lang.value === 'en' ? 'en-US' : 'pt-BR'))

const SESSION = 'maylog-counted'
const VISITOR = 'maylog-visitor'

function read(store: () => Storage, key: string) {
  try {
    return store().getItem(key) !== null
  } catch {
    return false
  }
}
function mark(store: () => Storage, key: string) {
  try {
    store().setItem(key, '1')
  } catch {
    /* sem armazenamento */
  }
}

async function fromServer(url: string) {
  const counted = read(() => sessionStorage, SESSION)
  const known = read(() => localStorage, VISITOR)
  const r = await fetch(counted ? url : `${url}${url.includes('?') ? '&' : '?'}novo=${known ? 0 : 1}`, {
    method: counted ? 'GET' : 'POST'
  })
  const j = await r.json()
  if (typeof j.count !== 'number') throw new Error('resposta inesperada')
  /* só marca depois que o servidor respondeu, para uma falha não perder a contagem */
  if (!counted) mark(() => sessionStorage, SESSION)
  if (!counted && !known) {
    mark(() => localStorage, VISITOR)
    isNew.value = true
  }
  count.value = site.contador.base + j.count
  visits.value = typeof j.visitas === 'number' ? j.visitas : null
}

/* sem servidor (ou npm run dev, que não roda a função): modo brincadeira, com as visitas deste navegador */
function offline() {
  let v = 1
  try {
    v = parseInt(localStorage.getItem('maylog-visits') || '0', 10) + 1
    localStorage.setItem('maylog-visits', String(v))
  } catch {
    /* sem armazenamento */
  }
  count.value = site.contador.base + v
  isNew.value = true
}

onMounted(async () => {
  try {
    if (!site.contador.url) throw new Error('sem url')
    await fromServer(site.contador.url)
  } catch {
    offline()
  }
  await nextTick()
  requestAnimationFrame(() => requestAnimationFrame(() => (rolled.value = true)))
})

const digits = computed(() => String(count.value ?? 0).padStart(6, '0').slice(-6).split('').map(Number))
const tip = computed(() => {
  if (!count.value) return ''
  const n = (x: number) => x.toLocaleString(locale.value)
  const parts = [isNew.value ? t('count.you', { n: n(count.value) }) : t(count.value === 1 ? 'count.visitorN' : 'count.visitorsN', { n: n(count.value) })]
  if (visits.value !== null) parts.push(t(visits.value === 1 ? 'count.visitN' : 'count.visitsN', { n: n(visits.value) }))
  return parts.join(' · ')
})
</script>

<template>
  <span class="badge-cnt" :title="tip">
    <span class="odo" role="img" :aria-label="count ? `${count.toLocaleString(locale)} ${t('count.visitors')}` : t('count.visitors')">
      <span v-for="(d, i) in digits" :key="i" class="dg" aria-hidden="true">
        <span class="col" :style="{ transform: rolled ? `translateY(${-d * 1.6}em)` : 'none', transitionDelay: `${i * 90}ms` }">
          <span v-for="k in 10" :key="k">{{ k - 1 }}</span>
        </span>
      </span>
    </span>
    <small>{{ t('count.visitors') }}</small>
  </span>
</template>

<style scoped>
.badge-cnt {
  width: 88px;
  height: 31px;
  border: 1px solid var(--ink);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: var(--ink);
  cursor: default;
}
small {
  font-size: 8px;
  line-height: 1;
  letter-spacing: 0.12em;
}
.odo {
  display: inline-flex;
  gap: 1px;
}
.dg {
  position: relative;
  display: block;
  width: 1.15em;
  height: 1.6em;
  overflow: hidden;
  background: var(--ink);
  color: var(--bg);
  font-family: var(--mono);
  font-weight: 700;
  font-size: 10px;
  line-height: 1.6em;
  text-align: center;
}
.dg::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  background: var(--bg);
  opacity: 0.3;
}
.col {
  display: block;
  transition: transform 1.4s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.col span {
  display: block;
  height: 1.6em;
}
</style>
