/*
  Configurações do maylog que você edita à mão.
  Tudo o que aparece no site e não vem dos posts mora aqui.
  Campos terminados em "En" são a versão em inglês (se faltar, usa o português).
*/

export interface Rede {
  assunto: string
  nome: string
  usuario: string
  usuarioEn?: string
  url: string
}

export interface Par {
  rotulo: string
  valor: string
  rotuloEn?: string
  valorEn?: string
}

export const site = {
  nome: 'maylog',
  frase: 'registros sobre o que der vontade de escrever.',
  fraseEn: 'notes on whatever feels worth writing.',
  autor: 'Mayke Erick',
  /* domínio de exemplo: troque quando escolher o seu */
  url: 'https://maylog.com.br',

  /* bloco "agora" da página inicial */
  agora: {
    atualizado: '2026-11-14',
    itens: [
      { rotulo: 'lendo', rotuloEn: 'reading', valor: 'Sozinho ao Redor do Mundo, de Joshua Slocum', valorEn: 'Sailing Alone Around the World, by Joshua Slocum' },
      { rotulo: 'ouvindo', rotuloEn: 'listening', valor: 'Belchior' },
      { rotulo: 'aprendendo', rotuloEn: 'learning', valor: 'nada em específico no momento', valorEn: 'nothing in particular right now' },
      { rotulo: 'humor', rotuloEn: 'mood', valor: 'realista, com ressalvas', valorEn: 'realistic, with caveats' }
    ] satisfies Par[]
  },

  /* bloco "acompanho" da página inicial */
  acompanho: [
    { nome: '@GutoGalego', onde: 'youtube', url: 'https://www.youtube.com/@GutoGalego' },
    { nome: '@IrmaosKatoosh', onde: 'youtube', url: 'https://www.youtube.com/@IrmaosKatoosh' },
    { nome: '@kaiodelaqua', onde: 'youtube', url: 'https://www.youtube.com/@kaiodelaqua' },
    { nome: '@andrenomaderaiz', onde: 'youtube', url: 'https://www.youtube.com/@andrenomaderaiz' }
  ],

  /* "me encontre por aí", no rodapé */
  redes: [
    { assunto: 'código', nome: 'github', usuario: '/maykeesa', url: 'https://github.com/maykeesa' },
    { assunto: 'trabalho', nome: 'linkedin', usuario: '/in/maykeesa', url: 'https://www.linkedin.com/in/maykeesa/' },
    { assunto: 'fotos', nome: 'instagram', usuario: '@maykeesa', url: 'https://instagram.com/maykeesa' },
    { assunto: 'jogos', nome: 'steam', usuario: '/id/maykeesa', url: 'https://steamcommunity.com/id/maykeesa' },
    { assunto: 'música', nome: 'spotify', usuario: 'playlists', url: 'https://open.spotify.com/user/22oxtqydoyl2g5sfy7gnum5va' },
    { assunto: 'música', nome: 'stats.fm', usuario: 'o que mais ouço', usuarioEn: 'what I play most', url: 'https://stats.fm/user/maykeesa' },
    { assunto: 'filmes', nome: 'letterboxd', usuario: '/MaykeESA', url: 'https://letterboxd.com/MaykeESA/' },
    { assunto: 'anime', nome: 'myanimelist', usuario: '/maykeesa', url: 'https://myanimelist.net/profile/maykeesa' }
  ] satisfies Rede[],

  contato: {
    email: 'maykeesa.contato@gmail.com'
  },

  /*
    Contador de visitas do rodapé (botão 88×31).
    Sem "url", ele é só de brincadeira: mostra "base" + as visitas deste navegador.
    Com "url", busca o total de verdade: um endereço que responda {"count": 1234} a um POST
    (por exemplo um Cloudflare Worker com KV, sem cookies).
  */
  contador: {
    url: '',
    base: 1337
  },

  /* ficha da página "sobre" (o contato entra sozinho no fim) */
  ficha: [
    { rotulo: 'nome', rotuloEn: 'name', valor: 'Mayke Erick' },
    { rotulo: 'na internet', rotuloEn: 'online', valor: 'maykeesa' },
    { rotulo: 'ocupação', rotuloEn: 'occupation', valor: 'programador', valorEn: 'programmer' },
    { rotulo: 'tempo integral', rotuloEn: 'full-time', valor: 'aprendiz da vida', valorEn: 'lifelong learner' },
    { rotulo: 'interesses', rotuloEn: 'interests', valor: 'código, filmes, anime, jogos, música', valorEn: 'code, film, anime, games, music' }
  ] satisfies Par[],

  /* colofão: como o site é feito */
  colofao: [
    { rotulo: 'código', rotuloEn: 'code', valor: 'Vue.js + TypeScript (VitePress), feito com ajuda de IA', valorEn: 'Vue.js + TypeScript (VitePress), built with AI help' },
    { rotulo: 'textos', rotuloEn: 'writing', valor: 'arquivos Markdown, um por post', valorEn: 'Markdown files, one per post' },
    { rotulo: 'fontes', rotuloEn: 'fonts', valor: 'Source Serif 4 e IBM Plex Mono', valorEn: 'Source Serif 4 and IBM Plex Mono' },
    { rotulo: 'imagens', rotuloEn: 'images', valor: 'banners convertidos em pontilhado de 1 bit', valorEn: 'banners converted to 1-bit dithering' },
    { rotulo: 'temas', rotuloEn: 'themes', valor: 'white, dark e sepia', valorEn: 'white, dark and sepia' },
    { rotulo: 'inspiração', rotuloEn: 'inspiration', valor: 'weblogs do começo dos anos 2000', valorEn: 'early-2000s weblogs' }
  ] satisfies Par[]
}

/* escolhe o rótulo e o valor no idioma pedido */
export function par(p: Par, lang: 'pt' | 'en') {
  return lang === 'en' ? { rotulo: p.rotuloEn ?? p.rotulo, valor: p.valorEn ?? p.valor } : { rotulo: p.rotulo, valor: p.valor }
}
