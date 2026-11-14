import fs from 'node:fs'
import path from 'node:path'
import { imageSize } from 'image-size'
import type { MarkdownRenderer } from 'vitepress'

/*
  Anota largura e altura nas imagens do texto (![legenda](./imagens/print.png)).
  Com isso o navegador reserva o espaço antes de a imagem carregar, e a página não "pula"
  quando ela chega, o que manteria o sumário levando ao lugar certo.
*/
export function imageDimensions(md: MarkdownRenderer, srcDir: string) {
  const original = md.renderer.rules.image
  if (!original) return
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const src = token.attrGet('src') || ''
    if (src && !/^(https?:)?\/\//.test(src) && !token.attrGet('width')) {
      /* caminho relativo ao arquivo do post, ou a partir da raiz do projeto (/posts/...) */
      const base = src.startsWith('/') ? srcDir : path.dirname(String(env?.path ?? ''))
      const file = path.join(base, decodeURI(src.replace(/[?#].*$/, '')))
      try {
        if (fs.existsSync(file)) {
          const { width, height } = imageSize(file)
          if (width && height) {
            token.attrSet('width', String(width))
            token.attrSet('height', String(height))
          }
        }
      } catch {
        /* formato que não dá para ler: a imagem segue sem tamanho */
      }
    }
    return original(tokens, idx, options, env, self)
  }
}
