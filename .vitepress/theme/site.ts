/*
  Tipos do conteúdo do site. Os valores ficam no conteudo.yml, na raiz do projeto:
  edite lá, não aqui. Nos componentes, use `import { data as site } from '../data/site.data'`.
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

export interface Site {
  nome: string
  autor: string
  url: string
  frase: string
  fraseEn: string
  agora: { atualizado: string; itens: Par[] }
  acompanho: { nome: string; onde: string; url: string }[]
  redes: Rede[]
  contato: { email: string }
  contador: { url: string; base: number }
  ficha: Par[]
  colofao: Par[]
}

/* escolhe o rótulo e o valor no idioma pedido */
export function par(p: Par, lang: 'pt' | 'en') {
  return lang === 'en' ? { rotulo: p.rotuloEn ?? p.rotulo, valor: p.valorEn ?? p.valor } : { rotulo: p.rotulo, valor: p.valor }
}
