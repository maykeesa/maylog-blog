import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { plain } from './plainText'

/*
  Texto completo de cada post, só para a busca.
  Fica separado da lista de posts para não pesar todas as páginas: o site só baixa
  este arquivo quando alguém usa o campo de busca (ver composables/useSearchText.ts).
*/

export interface SearchText {
  pt: string
  en?: string
}

declare const data: Record<string, SearchText>
export { data }

const read = (file: string) => (fs.existsSync(file) ? plain(matter(fs.readFileSync(file, 'utf8')).content) : undefined)

export default {
  watch: ['../../../posts/*/index.md', '../../../posts/*/index.en.md'],
  load(files: string[]): Record<string, SearchText> {
    const out: Record<string, SearchText> = {}
    for (const file of files.filter((f) => /[\\/]index\.md$/.test(f))) {
      const dir = path.dirname(file)
      const folder = path.basename(dir)
      if (folder.startsWith('_')) continue
      const n = (folder.match(/^(\d+)-/) || [])[1] || '000'
      out[n] = { pt: read(file) ?? '', en: read(path.join(dir, 'index.en.md')) }
    }
    return out
  }
}
