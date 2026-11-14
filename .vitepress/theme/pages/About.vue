<script setup lang="ts">
import { computed, ref } from 'vue'
import { Content } from 'vitepress'
import { data as posts } from '../data/posts.data'
import { site } from '../site'
import Section from '../components/Section.vue'
import DitherArt from '../components/DitherArt.vue'

const since = computed(() => posts[posts.length - 1]?.ano ?? '')
const copyLabel = ref('copiar')
const mailEl = ref<HTMLElement>()

async function copyMail() {
  const done = (msg: string) => {
    copyLabel.value = msg
    setTimeout(() => (copyLabel.value = 'copiar'), 1800)
  }
  try {
    await navigator.clipboard.writeText(site.contato.email)
    done('copiado!')
  } catch {
    if (mailEl.value) {
      const r = document.createRange()
      r.selectNodeContents(mailEl.value)
      const s = window.getSelection()
      s?.removeAllRanges()
      s?.addRange(r)
    }
    done('selecionado, use ctrl+c')
  }
}

/* rola até "me encontre por aí" no rodapé, abrindo a seção se estiver fechada */
function goRedes() {
  const btn = document.querySelector<HTMLButtonElement>('[aria-controls="sec-redes"]')
  if (!btn) return
  if (btn.getAttribute('aria-expanded') !== 'true') btn.click()
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  btn.closest('section')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
}
</script>

<template>
  <Section id="quem" label="quem escreve" side="sobre.md">
    <div class="about">
      <figure class="portrait">
        <slot name="portrait">
          <DitherArt :width="160" :height="180" scene="lua" :seed="2025" label="Espaço para foto, em pontilhado" />
        </slot>
        <figcaption>foto em pontilhado, como os banners</figcaption>
      </figure>
      <dl class="ficha">
        <template v-for="f in site.ficha" :key="f.rotulo">
          <dt>{{ f.rotulo }}</dt>
          <dd>{{ f.valor }}</dd>
        </template>
        <dt>contato</dt>
        <dd class="contact">
          <a ref="mailEl" class="mail" :href="`mailto:${site.contato.email}`">{{ site.contato.email }}</a>
          <span class="contact-actions">
            <button type="button" class="linkbtn" @click="copyMail">{{ copyLabel }}</button>
            <span class="sep">·</span>
            <button type="button" class="linkbtn" @click="goRedes">me encontre por aí ↓</button>
          </span>
        </dd>
      </dl>
    </div>
    <div class="about-text">
      <Content />
    </div>
  </Section>

  <Section id="sobreblog" label="sobre o maylog" :side="since ? `desde ${since}` : undefined">
    <div class="about-text">
      <p>
        O nome junta "may", de Mayke, com "log", de weblog: o jeito antigo de chamar um blog, quando ele era um registro
        com data no topo. Por isso a página inicial parece um arquivo de log, com número, data e tema em cada linha.
      </p>
      <p>Escrevo sobre o que der vontade, sem calendário. Não há anúncios, cookies nem rastreio. Para acompanhar, use o RSS.</p>
    </div>
  </Section>

  <Section id="colofao" label="colofão" side="como o site é feito">
    <dl class="ficha">
      <template v-for="f in site.colofao" :key="f.rotulo">
        <dt>{{ f.rotulo }}</dt>
        <dd>{{ f.valor }}</dd>
      </template>
    </dl>
  </Section>
</template>

<style scoped>
.about {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 24px;
  align-items: start;
}
@media (max-width: 560px) {
  .about {
    grid-template-columns: 1fr;
  }
  .portrait {
    max-width: 200px;
  }
}
.portrait {
  margin: 0;
  border: 1px solid var(--rule);
  padding: 6px;
}
.portrait figcaption {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--muted);
  margin-top: 6px;
  line-height: 1.4;
}
.ficha {
  margin: 0;
  display: grid;
  grid-template-columns: 7.5em 1fr;
  gap: 0 14px;
  font-family: var(--mono);
  font-size: 13px;
}
.ficha dt,
.ficha dd {
  padding: 5px 0;
  border-bottom: 1px dotted var(--rule);
}
.ficha dt {
  color: var(--muted);
}
.ficha dd {
  margin: 0;
  min-width: 0;
}
.contact {
  display: grid;
  gap: 2px;
}
.mail,
.mail:visited {
  color: var(--ink);
  overflow-wrap: anywhere;
}
.contact-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0 8px;
  font-size: 12px;
}
.sep {
  color: var(--muted);
}
.about-text :deep(p) {
  margin: 16px 0 0;
}
</style>
