<script setup lang="ts">
import { computed, nextTick, onMounted, shallowRef } from 'vue'
import { data as site } from '../data/site.data'
import { useI18n } from '../composables/useI18n'

/*
  Contador retrô em formato de botão 88×31: seis dígitos que rolam como um odômetro.
  Mostra os visitantes únicos; passar o mouse mostra a posição de quem está lendo e o total de visitas.
    - visita: conta uma vez por sessão (até fechar a aba); as outras páginas só leem os totais
    - visitante: conta uma vez por navegador. O localStorage guarda o número que a pessoa
      recebeu na primeira visita ("você é o visitante nº 7"); nada disso vai para o servidor.
*/
const count = shallowRef<number | null>(null)
const visits = shallowRef<number | null>(null)
const mine = shallowRef<number | null>(null)
const rolled = shallowRef(false)
const { t, lang } = useI18n()
const locale = computed(() => (lang.value === 'en' ? 'en-US' : 'pt-BR'))

const SESSION = 'maylog-counted'
const VISITOR = 'maylog-visitor'

function get(store: () => Storage, key: string): string | null {
  try {
    return store().getItem(key)
  } catch {
    return null
  }
}
function set(store: () => Storage, key: string, value: string) {
  try {
    store().setItem(key, value)
  } catch {
    /* sem armazenamento */
  }
}

async function fromServer(url: string) {
  const counted = get(() => sessionStorage, SESSION) !== null
  const saved = get(() => localStorage, VISITOR)
  const known = saved !== null
  /*
    sessão nova: POST (com novo=1 se o navegador ainda não tem posição)
    sessão já contada, mas sem posição salva: POST só do visitante (novo=1&visita=0)
    sessão já contada e com posição: GET, só lê
  */
  const query = !counted ? `novo=${known ? 0 : 1}` : !known ? 'novo=1&visita=0' : ''
  const r = await fetch(query ? `${url}${url.includes('?') ? '&' : '?'}${query}` : url, { method: query ? 'POST' : 'GET' })
  const j = await r.json()
  if (typeof j.count !== 'number') throw new Error('resposta inesperada')
  /* só marca depois que o servidor respondeu, para uma falha não perder a contagem */
  if (!counted) set(() => sessionStorage, SESSION, '1')
  if (!known) {
    /* visitante novo: o total que o servidor devolveu é a posição dele */
    set(() => localStorage, VISITOR, String(j.count))
    mine.value = site.contador.base + j.count
  } else if (known) {
    const n = parseInt(saved, 10)
    mine.value = n > 0 ? site.contador.base + n : null
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
  count.value = mine.value = site.contador.base + v
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

/* "você é o visitante nº 1 ✦ · 2 visitantes · 5 visitas" (o total de visitantes some quando é igual à posição) */
const tip = computed(() => {
  if (!count.value) return ''
  const n = (x: number) => x.toLocaleString(locale.value)
  const parts: string[] = []
  if (mine.value) parts.push(t('count.you', { n: n(mine.value) }))
  if (mine.value !== count.value) parts.push(t(count.value === 1 ? 'count.visitorN' : 'count.visitorsN', { n: n(count.value) }))
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
