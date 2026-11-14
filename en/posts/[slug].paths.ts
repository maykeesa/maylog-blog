import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

/*
  Cria uma página em /en/posts/<pasta> para cada post.
  Usa o index.en.md quando existe; senão mostra o texto em português (com um aviso na página).
*/
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const postsDir = path.join(root, 'posts')

/* imagens com caminho relativo apontam para a pasta original do post */
function fixImages(body: string, folder: string) {
  return body.replace(/(!\[[^\]]*\]\()(?!https?:|\/)(\.\/)?([^)]+\))/g, `$1/posts/${folder}/$3`)
}

export default {
  watch: ['../../posts/*/index.md', '../../posts/*/index.en.md'],
  paths() {
    if (!fs.existsSync(postsDir)) return []
    return fs
      .readdirSync(postsDir)
      .filter((folder) => !folder.startsWith('_') && fs.existsSync(path.join(postsDir, folder, 'index.md')))
      .map((folder) => {
        const enFile = path.join(postsDir, folder, 'index.en.md')
        const hasEn = fs.existsSync(enFile)
        const src = fs.readFileSync(hasEn ? enFile : path.join(postsDir, folder, 'index.md'), 'utf8')
        return { params: { slug: folder, ptOnly: !hasEn }, content: fixImages(matter(src).content, folder) }
      })
  }
}
