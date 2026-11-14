/*
  Configurações do maylog que você edita à mão.
  Tudo o que aparece no site e não vem dos posts mora aqui.
*/

export interface Rede {
  assunto: string
  nome: string
  usuario: string
  url: string
}

export const site = {
  nome: 'maylog',
  frase: 'registros sobre o que der vontade de escrever.',
  autor: 'Mayke Erick',
  /* domínio de exemplo: troque quando escolher o seu */
  url: 'https://maylog.com.br',

  /* bloco "agora" da página inicial */
  agora: {
    atualizado: '2026-11-14',
    itens: [
      { rotulo: 'lendo', valor: 'Sozinho ao Redor do Mundo, de Joshua Slocum' },
      { rotulo: 'ouvindo', valor: 'Belchior' },
      { rotulo: 'aprendendo', valor: 'nada em específico no momento' },
      { rotulo: 'humor', valor: 'realista, com ressalvas' }
    ]
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
    { assunto: 'música', nome: 'stats.fm', usuario: 'o que mais ouço', url: 'https://stats.fm/user/maykeesa' },
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
    { rotulo: 'nome', valor: 'Mayke Erick' },
    { rotulo: 'na internet', valor: 'maykeesa' },
    { rotulo: 'ocupação', valor: 'programador' },
    { rotulo: 'tempo integral', valor: 'aprendiz da vida' },
    { rotulo: 'interesses', valor: 'código, filmes, anime, jogos, música' }
  ],

  /* colofão: como o site é feito */
  colofao: [
    { rotulo: 'código', valor: 'Vue.js + TypeScript (VitePress), feito com ajuda de IA' },
    { rotulo: 'textos', valor: 'arquivos Markdown, um por post' },
    { rotulo: 'fontes', valor: 'Source Serif 4 e IBM Plex Mono' },
    { rotulo: 'imagens', valor: 'banners convertidos em pontilhado de 1 bit' },
    { rotulo: 'temas', valor: 'white, dark e sepia' },
    { rotulo: 'inspiração', valor: 'weblogs do começo dos anos 2000' }
  ]
}
