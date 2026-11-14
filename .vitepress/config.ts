import { defineConfig } from 'vitepress'

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

export default defineConfig({
  lang: 'pt-BR',
  title: 'maylog',
  description: 'registros sobre o que der vontade de escrever.',
  cleanUrls: true,
  appearance: false,
  srcExclude: ['README.md'],
  head: [
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
