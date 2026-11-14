import { createContentLoader } from 'vitepress'

/*
  Lê todos os posts em posts/NNN-slug/index.md durante o build.
  O número do registro vem do começo do nome da pasta (ex.: 012-sobre-escrever).
*/

export interface Post {
  n: string
  slug: string
  url: string
  titulo: string
  subtitulo: string
  data: string // 2026-11-13
  dataLog: string // 2026.11.13
  ano: string
  tema: string
  tags: string[]
  banner?: string
  contraste?: string
  minutos: number
  resumo: string
  texto: string // texto puro, usado pela busca
}

declare const data: Post[]
export { data }

function isoDate(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  return String(v ?? '').slice(0, 10)
}

/* tira a marcação do markdown para virar texto puro (busca, resumo, tempo de leitura) */
function plain(src: string): string {
  return src
    .replace(/^---[\s\S]*?---/, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[\^[^\]]*\]:?/g, ' ')
    .replace(/[#>*_`~|-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function firstParagraph(src: string): string {
  const body = src.replace(/^---[\s\S]*?---/, '').trim()
  const para = body.split(/\n\s*\n/).find((p) => p.trim() && !/^(#|```|!\[|>|-|\*|\d+\.)/.test(p.trim()))
  return para ? plain(para) : ''
}

export default createContentLoader('posts/*/index.md', {
  includeSrc: true,
  transform(raw): Post[] {
    return raw
      .map(({ url, frontmatter: fm, src = '' }) => {
        const folder = url.replace(/^\/posts\//, '').replace(/\/$/, '')
        const n = (folder.match(/^(\d+)-/) || [])[1] || '000'
        const data = isoDate(fm.data)
        const texto = plain(src)
        return {
          n,
          slug: folder,
          url,
          titulo: String(fm.titulo ?? folder),
          subtitulo: String(fm.subtitulo ?? ''),
          data,
          dataLog: data.replace(/-/g, '.'),
          ano: data.slice(0, 4),
          tema: String(fm.tema ?? 'notas'),
          tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
          banner: fm.banner ? String(fm.banner) : undefined,
          contraste: fm.contraste ? String(fm.contraste) : undefined,
          minutos: Math.max(1, Math.round(texto.split(' ').length / 200)),
          resumo: String(fm.resumo ?? firstParagraph(src)),
          texto
        }
      })
      .filter((p) => !p.slug.startsWith('_'))
      .sort((a, b) => b.n.localeCompare(a.n))
  }
})
