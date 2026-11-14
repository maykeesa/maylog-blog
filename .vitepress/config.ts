import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vitepress'
import { site } from './theme/site'
import { createCssVariablesTheme } from 'shiki'
import footnote from 'markdown-it-footnote'
import { ditherBanners } from './banners'
import { feedDevServer, writeFeed } from './feed'
import { ogHead, pageInfo, writeOgImages } from './og'

/* Aplica o tema salvo antes da página aparecer, para não piscar no tema errado. */
const themeBootstrap = `(function () {
  try {
    var t = localStorage.getItem('maylog-theme');
    if (t !== 'white' && t !== 'dark' && t !== 'sepia') {
      t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'white';
    }
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'white');
  }
})();`

/* Destaque de código com variáveis CSS: as cores vêm dos tokens --c-* de cada tema. */
const codeTheme = createCssVariablesTheme({
  name: 'maylog',
  variablePrefix: '--shiki-',
  variableDefaults: {},
  fontStyle: true
})

export default defineConfig({
  lang: 'pt-BR',
  title: 'maylog',
  description: 'registros sobre o que der vontade de escrever.',
  cleanUrls: true,
  appearance: false,
  srcExclude: ['README.md', 'TODO.md', '**/index.en.md'],
  locales: {
    root: { label: 'pt', lang: 'pt-BR' },
    en: { label: 'en', lang: 'en', link: '/en/', description: 'notes on whatever feels worth writing.' }
  },
  vite: {
    plugins: [ditherBanners(), feedDevServer()]
  },
  markdown: {
    theme: codeTheme,
    lineNumbers: true,
    config(md) {
      md.use(footnote)
    }
  },
  /* mapa do site para buscadores (usa o domínio de site.ts) */
  sitemap: {
    hostname: site.url.replace(/\/$/, '') + '/'
  },
  async buildEnd(config) {
    await writeFeed(config)
    await writeOgImages(config)
    fs.writeFileSync(
      path.join(config.outDir, 'robots.txt'),
      `User-agent: *\nAllow: /\n\nSitemap: ${site.url.replace(/\/$/, '')}/sitemap.xml\n`
    )
  },
  /* título da aba e descrição vêm do post (titulo e subtitulo), nos dois idiomas */
  transformPageData(pageData) {
    const info = pageInfo(pageData.relativePath, pageData.params)
    const t = info.title ?? pageData.frontmatter.titulo
    if (t) pageData.title = String(t)
    if (info.description) pageData.description = info.description
  },
  /* prévia do link ao compartilhar (Open Graph) */
  transformHead: ogHead,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap'
      }
    ],
    ['script', {}, themeBootstrap]
  ]
})
