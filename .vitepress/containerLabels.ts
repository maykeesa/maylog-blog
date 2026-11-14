import type { MarkdownRenderer } from 'vitepress'

/*
  Títulos padrão das caixas especiais (::: tip, ::: warning…) no idioma da página.
  Os padrões em português são definidos em config.ts (markdown.container); nas páginas em /en/
  eles são trocados pelos equivalentes em inglês. Títulos escritos à mão (::: tip meu título) ficam como estão.
*/

const EN: Record<string, [pt: string, en: string]> = {
  tip: ['dica', 'tip'],
  info: ['info', 'info'],
  warning: ['atenção', 'warning'],
  danger: ['perigo', 'danger'],
  details: ['detalhes', 'details']
}

export function containerLabels(md: MarkdownRenderer) {
  for (const [kind, [pt, en]] of Object.entries(EN)) {
    const rule = `container_${kind}_open`
    const original = md.renderer.rules[rule]
    if (!original) continue
    md.renderer.rules[rule] = (tokens, idx, options, env, self) => {
      const html = original(tokens, idx, options, env, self)
      /* página em /en/ com texto traduzido (as que caem no português trazem a marca maylog:pt) */
      const isEn = String(env?.relativePath ?? '').startsWith('en/')
      const ptText = tokens.some((t) => t.type === 'html_block' && t.content.includes('maylog:pt'))
      if (!isEn || ptText) return html
      return html
        .replace(`<p class="custom-block-title">${pt}</p>`, `<p class="custom-block-title">${en}</p>`)
        .replace(`<summary>${pt}</summary>`, `<summary>${en}</summary>`)
    }
  }
}
