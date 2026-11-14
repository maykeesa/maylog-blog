import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { plain } from './plainText'

/*
  Lê todos os posts durante o build:
    posts/NNN-slug/index.md      → versão em português (obrigatória)
    posts/NNN-slug/index.en.md   → versão em inglês (opcional)
  O número do registro vem do começo do nome da pasta (ex.: 012-sobre-escrever).
*/

export interface PostText {
  titulo: string
  subtitulo: string
  resumo: string
  minutos: number
}

export interface Post extends PostText {
  n: string
  slug: string
  url: string // /posts/NNN-slug/
  enUrl: string // /en/posts/NNN-slug
  data: string // 2026-11-13
  dataLog: string // 2026.11.13
  ano: string
  tema: string
  tags: string[]
  banner?: string
  contraste?: string
  en?: PostText
  ptOnly?: boolean // preenchido na versão traduzida da lista, quando o post não tem inglês
}

declare const data: Post[]
export { data }

function isoDate(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  return String(v ?? '').slice(0, 10)
}


function firstParagraph(body: string): string {
  const para = body
    .trim()
    .split(/\n\s*\n/)
    .find((p) => p.trim() && !/^(#|```|!\[|>|-|\*|\d+\.)/.test(p.trim()))
  return para ? plain(para) : ''
}

function readText(file: string, fallbackTitle: string): { fm: Record<string, unknown>; text: PostText } {
  const { data: fm, content } = matter(fs.readFileSync(file, 'utf8'))
  const texto = plain(content)
  return {
    fm,
    text: {
      titulo: String(fm.titulo ?? fallbackTitle),
      subtitulo: String(fm.subtitulo ?? ''),
      resumo: String(fm.resumo ?? firstParagraph(content)),

      minutos: Math.max(1, Math.round(texto.split(' ').length / 200))
    }
  }
}

export default {
  watch: ['../../../posts/*/index.md', '../../../posts/*/index.en.md'],
  load(files: string[]): Post[] {
    const ptFiles = files.filter((f) => f.endsWith(`${path.sep}index.md`) || f.endsWith('/index.md'))
    return ptFiles
      .map((file) => {
        const folder = path.basename(path.dirname(file))
        const n = (folder.match(/^(\d+)-/) || [])[1] || '000'
        const { fm, text } = readText(file, folder)
        const enFile = path.join(path.dirname(file), 'index.en.md')
        const en = fs.existsSync(enFile) ? readText(enFile, text.titulo).text : undefined
        const data = isoDate(fm.data)
        return {
          ...text,
          n,
          slug: folder,
          url: `/posts/${folder}/`,
          enUrl: `/en/posts/${folder}`,
          data,
          dataLog: data.replace(/-/g, '.'),
          ano: data.slice(0, 4),
          tema: String(fm.tema ?? 'notas'),
          tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
          banner: fm.banner ? String(fm.banner) : undefined,
          contraste: fm.contraste ? String(fm.contraste) : undefined,
          en
        }
      })
      .filter((p) => !p.slug.startsWith('_'))
      .sort((a, b) => b.n.localeCompare(a.n))
  }
}
