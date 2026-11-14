<script setup lang="ts">
import { computed, onMounted, shallowRef, useTemplateRef } from 'vue'
import { Content } from 'vitepress'
import { site, par } from '../site'
import { useI18n } from '../composables/useI18n'
import Section from '../components/Section.vue'
import DitherArt from '../components/DitherArt.vue'
import { smoothScrollTo } from '../composables/useSmoothScroll'

const { t, lang, posts } = useI18n()
const since = computed(() => posts.value[posts.value.length - 1]?.ano ?? '')
const ficha = computed(() => site.ficha.map((f) => par(f, lang.value)))
const colofao = computed(() => site.colofao.map((f) => par(f, lang.value)))
const copied = shallowRef('')
const copyLabel = computed(() => copied.value || t('about.copy'))
const mailEl = useTemplateRef<HTMLElement>('mail')

/*
  O e-mail não vai escrito no HTML gerado: lá aparece "fulano [arroba] gmail [ponto] com".
  O endereço de verdade só é montado no navegador, depois que a página carrega,
  o que afasta os robôs simples que coletam e-mails lendo o HTML.
*/
const revealed = shallowRef(false)
onMounted(() => (revealed.value = true))
const masked = computed(() => {
  const [at, dot] = lang.value === 'en' ? [' [at] ', ' [dot] '] : [' [arroba] ', ' [ponto] ']
  return site.contato.email.replace('@', at).replace(/\./g, dot)
})

async function copyMail() {
  const done = (msg: string) => {
    copied.value = msg
    setTimeout(() => (copied.value = ''), 1800)
  }
  try {
    await navigator.clipboard.writeText(site.contato.email)
    done(t('about.copied'))
  } catch {
    if (mailEl.value) {
      const r = document.createRange()
      r.selectNodeContents(mailEl.value)
      const s = window.getSelection()
      s?.removeAllRanges()
      s?.addRange(r)
    }
    done(t('about.selected'))
  }
}

/* rola até "me encontre por aí" no rodapé, abrindo a seção se estiver fechada */
function goRedes() {
  const btn = document.querySelector<HTMLButtonElement>('[aria-controls="sec-redes"]')
  if (!btn) return
  if (btn.getAttribute('aria-expanded') !== 'true') btn.click()
  const sec = btn.closest('section')
  if (sec) requestAnimationFrame(() => smoothScrollTo(sec, -Math.max(0, (window.innerHeight - sec.offsetHeight) / 2)))
}
</script>

<template>
  <Section id="quem" :label="t('about.who')" :side="t('about.file')">
    <div class="about">
      <figure class="portrait">
        <slot name="portrait">
          <DitherArt :width="160" :height="180" scene="lua" :seed="2025" :label="t('about.photo')" />
        </slot>
        <figcaption>{{ t('about.photo') }}</figcaption>
      </figure>
      <dl class="ficha">
        <template v-for="f in ficha" :key="f.rotulo">
          <dt>{{ f.rotulo }}</dt>
          <dd>{{ f.valor }}</dd>
        </template>
        <dt>{{ t('about.contact') }}</dt>
        <dd class="contact">
          <a v-if="revealed" ref="mail" class="mail" :href="`mailto:${site.contato.email}`">{{ site.contato.email }}</a>
          <span v-else class="mail">{{ masked }}</span>
          <span class="contact-actions">
            <button type="button" class="linkbtn" @click="copyMail">{{ copyLabel }}</button>
            <span class="sep">·</span>
            <button type="button" class="linkbtn" @click="goRedes">{{ t('about.findMe') }}</button>
          </span>
        </dd>
      </dl>
    </div>
    <div class="about-text">
      <Content />
    </div>
  </Section>

  <Section id="sobreblog" :label="t('about.blog')" :side="since ? `${t('since')} ${since}` : undefined">
    <div class="about-text">
      <p>{{ t('about.blog1') }}</p>
      <p>{{ t('about.blog2') }}</p>
    </div>
  </Section>

  <Section id="colofao" :label="t('about.colophon')" :side="t('about.colophonSide')">
    <dl class="ficha">
      <template v-for="f in colofao" :key="f.rotulo">
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
