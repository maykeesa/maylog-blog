import type { Post } from '../data/posts.data'

/*
  Busca por tudo: título, tema, tags e texto.
  Aceita filtros (tag:ia, titulo:vue, tema:ensaio, texto:rss, data:2026.10) e "frase exata".
  Casa só o começo das palavras e ignora acentos e maiúsculas: "ia" acha "IA", mas não "dia".
*/

export type Field = 'título' | 'tema' | 'tags' | 'texto' | 'data'
export interface Criterion {
  f: Field | null
  t: string
}
export interface Result {
  post: Post
  where: Field[]
  score: number
}
export interface Segment {
  text: string
  hit: boolean
}

const ALIAS: Record<string, Field> = {
  tag: 'tags', tags: 'tags',
  titulo: 'título', title: 'título',
  tema: 'tema', topic: 'tema', categoria: 'tema',
  texto: 'texto', text: 'texto', conteudo: 'texto',
  data: 'data', date: 'data', ano: 'data', mes: 'data'
}

export function norm(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}
function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
function finder(term: string) {
  return new RegExp('(^|[^a-z0-9])(' + escapeRe(term) + ')', 'g')
}

export function parse(q: string): Criterion[] {
  const out: Criterion[] = []
  const re = /([^\s:"]+):"([^"]*)"?|([^\s:"]+):(\S+)|"([^"]*)"?|(\S+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(q))) {
    const field = m[1] || m[3]
    const val = m[2] !== undefined ? m[2] : m[4]
    if (field && ALIAS[norm(field)] && val) out.push({ f: ALIAS[norm(field)], t: norm(val).trim() })
    else if (m[5] !== undefined) {
      if (m[5].trim()) out.push({ f: null, t: norm(m[5]).trim() })
    } else if (!(/:$/.test(m[0]) && ALIAS[norm(m[0].slice(0, -1))])) out.push({ f: null, t: norm(m[0]) })
  }
  return out.filter((c) => c.t)
}

export function termsFor(crit: Criterion[], field: Field): string[] {
  return crit.filter((c) => c.f === null || c.f === field).map((c) => c.t)
}

/* textOf: texto completo do post (baixado à parte); enquanto não chega, procura só no subtítulo */
function fields(p: Post, textOf: (p: Post) => string): Record<Exclude<Field, 'data'>, string> {
  return { título: p.titulo, tema: p.tema, tags: p.tags.join(' '), texto: `${p.subtitulo} ${textOf(p)}` }
}

export function search(posts: Post[], q: string, textOf: (p: Post) => string = () => ''): Result[] {
  const crit = parse(q)
  if (!crit.length) return []
  const out: Result[] = []
  for (const p of posts) {
    const fs = fields(p, textOf)
    const where: Field[] = []
    let score = 0
    const all = crit.every((c) => {
      if (c.f === 'data') {
        const ok = p.dataLog.startsWith(c.t.replace(/[-/]/g, '.'))
        if (ok && !where.includes('data')) where.push('data')
        return ok
      }
      let hit = false
      ;(Object.keys(fs) as (keyof typeof fs)[]).forEach((f) => {
        if (c.f && c.f !== f) return
        const n = (norm(fs[f]).match(finder(c.t)) || []).length
        if (n) {
          hit = true
          if (!where.includes(f)) where.push(f)
          score += n * (f === 'texto' ? 1 : 4)
        }
      })
      return hit
    })
    if (all) out.push({ post: p, where, score })
  }
  return out.sort((a, b) => b.score - a.score || b.post.n.localeCompare(a.post.n))
}

function ranges(text: string, terms: string[]): [number, number][] {
  const n = norm(text)
  const out: [number, number][] = []
  terms.forEach((t) => {
    const re = finder(t)
    let m: RegExpExecArray | null
    while ((m = re.exec(n))) out.push([m.index + m[1].length, m.index + m[1].length + t.length])
  })
  return out.sort((a, b) => a[0] - b[0])
}

/* divide o texto em pedaços marcados (para destacar os termos achados) */
export function segments(text: string, terms: string[]): Segment[] {
  const out: Segment[] = []
  let pos = 0
  for (const [a, b] of ranges(text, terms)) {
    if (a < pos) continue
    if (a > pos) out.push({ text: text.slice(pos, a), hit: false })
    out.push({ text: text.slice(a, b), hit: true })
    pos = b
  }
  if (pos < text.length) out.push({ text: text.slice(pos), hit: false })
  return out
}

/* trecho do texto em volta da primeira ocorrência */
export function snippet(text: string, terms: string[]): string | null {
  const r = ranges(text, terms)[0]
  if (!r) return null
  let a = Math.max(0, r[0] - 70)
  let b = Math.min(text.length, r[1] + 110)
  while (a > 0 && text[a - 1] !== ' ') a--
  while (b < text.length && text[b] !== ' ') b++
  return (a > 0 ? '… ' : '') + text.slice(a, b) + (b < text.length ? ' …' : '')
}
