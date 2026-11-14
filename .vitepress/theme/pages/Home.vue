<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data as posts } from '../data/posts.data'
import { site } from '../site'
import Section from '../components/Section.vue'
import LogList from '../components/LogList.vue'
import DitherArt from '../components/DitherArt.vue'

const RECENTES = 6
const recentes = computed(() => posts.slice(0, RECENTES))
const total = posts.length
const primeiro = computed(() => posts[posts.length - 1]?.n ?? '001')
const ultimo = computed(() => posts[0]?.n ?? '001')
const agoraData = site.agora.atualizado.slice(8, 10) + '.' + site.agora.atualizado.slice(5, 7)
</script>

<template>
  <Section id="leiame" label="leia-me" side="arquivo 000">
    <div class="intro">
      <DitherArt :width="340" :height="96" shuffle label="Arte pontilhada aleatória" />
      <p>
        Isto é um weblog no sentido antigo: um registro. Escrevo sobre tecnologia, livros, filmes e o que mais
        aparecer, sem algoritmo e sem pressa. Cada entrada tem número, data e tema, como linhas de um arquivo de log.
      </p>
    </div>
  </Section>

  <Section id="recentes" label="entradas recentes" :side="`${total} ${total === 1 ? 'registro' : 'registros'}`">
    <LogList :posts="recentes" head />
    <p class="more">
      <a :href="withBase('/arquivos')">ver arquivo completo ({{ ultimo }} → {{ primeiro }})</a>
    </p>
  </Section>

  <div class="cols">
    <Section id="agora" label="agora" :side="agoraData">
      <dl class="kv">
        <template v-for="item in site.agora.itens" :key="item.rotulo">
          <dt>{{ item.rotulo }}</dt>
          <dd>{{ item.valor }}</dd>
        </template>
      </dl>
    </Section>
    <Section id="acompanho" label="acompanho" side="canais">
      <ul class="follow">
        <li v-for="c in site.acompanho" :key="c.url">
          <a :href="c.url" target="_blank" rel="noopener">{{ c.nome }}</a> <span class="via">{{ c.onde }}</span>
        </li>
      </ul>
    </Section>
  </div>
</template>

<style scoped>
.intro {
  display: grid;
  gap: 16px;
}
.intro p {
  margin: 0;
}
.more {
  font-family: var(--mono);
  font-size: 13px;
  margin: 12px 0 0;
}
.cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 32px;
  align-items: start;
}
@media (max-width: 560px) {
  .cols {
    grid-template-columns: 1fr;
  }
}
.kv {
  font-family: var(--mono);
  font-size: 13px;
  margin: 0;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2px 12px;
}
.kv dt {
  color: var(--muted);
}
.kv dd {
  margin: 0;
}
.follow {
  list-style: none;
  padding: 0;
  margin: 0;
  font-family: var(--mono);
  font-size: 13px;
  line-height: 1.9;
}
.follow li::before {
  content: '› ';
  color: var(--muted);
}
.via {
  font-size: 10px;
  color: var(--muted);
}
</style>
