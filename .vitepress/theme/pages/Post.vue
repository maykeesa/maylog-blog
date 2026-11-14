<script setup lang="ts">
import { Content, withBase } from 'vitepress'
import { useCurrentPost } from '../composables/usePosts'
import PostToc from '../components/PostToc.vue'
import RelatedPosts from '../components/RelatedPosts.vue'
import BannerArt from '../components/BannerArt.vue'
import ShareBar from '../components/ShareBar.vue'
import { computed } from 'vue'
import { bannerOf } from '../lib/banners'

const { post, newer, older } = useCurrentPost()
const banner = computed(() => (post.value ? bannerOf(post.value) : undefined))
</script>

<template>
  <article v-if="post" class="post">
    <div class="meta">
      <span>nº {{ post.n }}</span>
      <span>{{ post.dataLog }}</span>
      <span>tema: {{ post.tema }}</span>
      <span>{{ post.minutos }} min de leitura</span>
    </div>
    <h1>{{ post.titulo }}</h1>
    <p v-if="post.subtitulo" class="dek">{{ post.subtitulo }}</p>

    <figure v-if="banner?.dither" class="post-banner">
      <BannerArt :src="banner.dither" :original="banner.original" :alt="`Banner de ${post.titulo}`" />
      <figcaption>banner pontilhado · clique para ver a foto original</figcaption>
    </figure>

    <PostToc :title="post.titulo" />

    <div class="post-body">
      <Content />
    </div>

    <ShareBar :post="post" />

    <RelatedPosts :post="post" />

    <nav class="pager" aria-label="Entradas">
      <a v-if="older" :href="withBase(older.url)">← {{ older.n }} {{ older.titulo }}</a>
      <a :href="withBase('/')">voltar ao log ↑</a>
      <a v-if="newer" :href="withBase(newer.url)">{{ newer.n }} {{ newer.titulo }} →</a>
    </nav>
  </article>
</template>

<style>
.meta {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--muted);
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin-top: 40px;
}
.post h1 {
  font-weight: 600;
  font-size: 38px;
  line-height: 1.15;
  letter-spacing: -0.015em;
  margin: 10px 0 8px;
  text-wrap: balance;
}
.post .dek {
  font-style: italic;
  color: var(--muted);
  font-size: 20px;
  margin: 0 0 28px;
}
.post-banner {
  margin: 0 0 32px;
}
.post-banner figcaption {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--muted);
  margin-top: 6px;
}
.post-body > h2 {
  font-family: var(--mono);
  font-size: 15px;
  font-weight: 700;
  margin: 40px 0 8px;
  scroll-margin-top: 84px;
}
.post-body > h2::before {
  content: '## ';
  color: var(--muted);
  font-weight: 400;
}
.post-body > h3 {
  font-family: var(--mono);
  font-size: 14px;
  font-weight: 500;
  margin: 28px 0 6px;
}
.post-body > h3::before {
  content: '### ';
  color: var(--muted);
}
.post-body .header-anchor {
  display: none;
}
.post-body p {
  margin: 0 0 1.1em;
}
.post-body > p:first-of-type::first-letter {
  font-family: var(--mono);
  font-weight: 700;
  float: left;
  font-size: 3.1em;
  line-height: 0.9;
  margin: 6px 8px 0 0;
}
.post-body blockquote {
  margin: 1.6em 0;
  padding: 0 0 0 18px;
  border-left: 3px double var(--ink);
  font-style: italic;
}
.post-body blockquote p {
  margin: 0;
}
.post-body ul,
.post-body ol {
  padding-left: 1.4em;
  margin: 0 0 1.1em;
}
.post-body ul li::marker {
  content: '– ';
  color: var(--muted);
}
.post-body ol li::marker {
  color: var(--muted);
  font-family: var(--mono);
  font-size: 0.85em;
}
.post-body img {
  display: block;
  border: 1px solid var(--rule);
}
.post-body figure {
  margin: 2em 0;
}
.post-body figcaption {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--muted);
  margin-top: 6px;
}
.post-body :not(pre) > code {
  font-family: var(--mono);
  font-size: 0.82em;
  background: var(--bar);
  border: 1px solid var(--rule);
  padding: 1px 4px;
}
.post-body hr {
  border: 0;
  border-top: 3px double var(--rule);
  margin: 2em 0;
}
.post-body table {
  border-collapse: collapse;
  font-family: var(--mono);
  font-size: 13px;
  display: block;
  overflow-x: auto;
  margin: 0 0 1.1em;
}
.post-body th,
.post-body td {
  border: 1px solid var(--rule);
  padding: 4px 8px;
  text-align: left;
}
.post-body th {
  background: var(--bar);
  font-weight: 500;
}

/* notas de rodapé */
.post-body .footnote-ref a {
  font-family: var(--mono);
  font-size: 11px;
  text-decoration: none;
}
.post-body .footnotes-sep {
  display: none;
}
.post-body .footnotes {
  font-size: 15px;
  color: var(--muted);
  border-top: 1px solid var(--rule);
  margin-top: 40px;
  padding-top: 12px;
}
.post-body .footnotes-list {
  padding-left: 1.4em;
  margin: 0;
}
.post-body .footnote-backref {
  text-decoration: none;
}

.pager {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 16px;
  font-family: var(--mono);
  font-size: 13px;
  margin-top: 32px;
  padding-top: 14px;
  border-top: 3px double var(--rule);
}
@media (max-width: 560px) {
  .post h1 {
    font-size: 30px;
  }
}
</style>
