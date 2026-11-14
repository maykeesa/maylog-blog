import type { MarkdownRenderer } from 'vitepress'

/*
  Barra de título dos blocos de código: "typescript · src/posts.ts".
  No markdown, o nome do arquivo vai entre colchetes depois da linguagem:
    ```ts [src/posts.ts]
  Sem colchetes, a barra mostra só o nome da linguagem.
*/

const LANGS: Record<string, string> = {
  ts: 'typescript', js: 'javascript', mjs: 'javascript', md: 'markdown', sh: 'shell', bash: 'bash', zsh: 'shell',
  ps1: 'powershell', py: 'python', rb: 'ruby', rs: 'rust', go: 'go', java: 'java', kt: 'kotlin', cs: 'c#',
  cpp: 'c++', c: 'c', json: 'json', jsonc: 'json', yml: 'yaml', yaml: 'yaml', toml: 'toml', html: 'html',
  css: 'css', scss: 'scss', vue: 'vue', jsx: 'jsx', tsx: 'tsx', sql: 'sql', txt: 'texto', text: 'texto'
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function codeTitle(md: MarkdownRenderer) {
  const original = md.renderer.rules.fence
  if (!original) return
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    let file = ''
    const m = token.info.match(/\s\[([^\]]+)\]/)
    if (m) {
      file = m[1].trim()
      token.info = token.info.replace(m[0], '').trim()
    }
    const lang = token.info.trim().split(/[\s{:]/)[0]
    const label = (LANGS[lang] ?? lang) + (file ? ` · ${file}` : '')
    const html = original(tokens, idx, options, env, self)
    return label ? html.replace(/<span class="lang">[^<]*<\/span>/, `<span class="lang">${esc(label)}</span>`) : html
  }
}
