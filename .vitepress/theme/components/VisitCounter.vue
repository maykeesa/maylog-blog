<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { site } from '../site'

/* Contador retrô em formato de botão 88×31: seis dígitos que rolam como um odômetro. */
const count = ref<number | null>(null)
const rolled = ref(false)

async function load(): Promise<number> {
  if (site.contador.url) {
    try {
      const r = await fetch(site.contador.url, { method: 'POST' })
      const j = await r.json()
      if (typeof j.count === 'number') return j.count
    } catch {
      /* serviço fora do ar: cai no modo brincadeira */
    }
  }
  let v = 1
  try {
    v = parseInt(localStorage.getItem('maylog-visits') || '0', 10) + 1
    localStorage.setItem('maylog-visits', String(v))
  } catch {
    /* sem armazenamento */
  }
  return site.contador.base + v
}

onMounted(async () => {
  count.value = await load()
  await nextTick()
  requestAnimationFrame(() => requestAnimationFrame(() => (rolled.value = true)))
})

const digits = computed(() => String(count.value ?? 0).padStart(6, '0').slice(-6).split('').map(Number))
const tip = computed(() => (count.value ? `você é o visitante nº ${count.value.toLocaleString('pt-BR')} ✦` : ''))
</script>

<template>
  <span class="badge-cnt" :title="tip">
    <span class="odo" role="img" :aria-label="count ? `${count.toLocaleString('pt-BR')} visitas` : 'visitas'">
      <span v-for="(d, i) in digits" :key="i" class="dg" aria-hidden="true">
        <span class="col" :style="{ transform: rolled ? `translateY(${-d * 1.6}em)` : 'none', transitionDelay: `${i * 90}ms` }">
          <span v-for="k in 10" :key="k">{{ k - 1 }}</span>
        </span>
      </span>
    </span>
    <small>visitas</small>
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
