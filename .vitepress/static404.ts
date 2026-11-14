import fs from 'node:fs'
import path from 'node:path'
import type { SiteConfig } from 'vitepress'
import postsLoader from './theme/data/posts.data'

/*
  O VitePress sempre gera o 404.html com a página vazia (a 404 do tema é montada no navegador,
  porque só lá se sabe qual endereço a pessoa tentou abrir). Para quem está com o JavaScript
  desligado, este passo coloca no 404.html uma versão simples, dentro de <noscript>:
  aviso em português e inglês, os três posts mais recentes e os links de volta.
  Com JavaScript ligado, o <noscript> é ignorado e a 404 completa aparece como sempre.
*/

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function recentPosts(srcDir: string) {
  const dir = path.join(srcDir, 'posts')
  if (!fs.existsSync(dir)) return []
  const files = fs
    .readdirSync(dir)
    .map((d) => path.join(dir, d, 'index.md'))
    .filter((f) => fs.existsSync(f))
  return postsLoader.load(files).slice(0, 3)
}

function fallback(config: SiteConfig): string {
  const base = config.site.base
  const posts = recentPosts(config.srcDir)
    .map(
      (p) =>
        `<li style="display:flex;gap:12px;align-items:baseline"><span style="font-family:var(--mono);font-size:13px;color:var(--muted)">${esc(p.dataLog)}</span>` +
        `<a href="${base}${p.url.replace(/^\//, '')}">${esc(p.titulo)}</a></li>`
    )
    .join('')
  return `<noscript><div class="wrap" style="padding-top:40px;display:grid;gap:16px">
<p style="margin:0;font-family:var(--mono);font-weight:700"><a href="${base}" style="color:var(--ink);text-decoration:none">maylog_</a></p>
<h1 style="font-family:var(--mono);font-weight:700;font-size:72px;line-height:1;letter-spacing:-0.05em;margin:8px 0 0">404</h1>
<p style="margin:0;max-width:34em">Esta página não existe. Talvez tenha mudado de endereço, ou o link veio com um erro de digitação.</p>
<p lang="en" style="margin:0;max-width:34em;color:var(--muted)">This page doesn't exist. Maybe it moved, or the link came with a typo.</p>
${posts ? `<p style="margin:8px 0 0;font-family:var(--mono);font-size:13px">▸ os mais recentes · the latest</p><ul style="list-style:none;margin:0;padding:0;display:grid;gap:6px">${posts}</ul>` : ''}
<p style="font-family:var(--mono);font-size:13px;display:flex;flex-wrap:wrap;gap:4px 10px;margin:4px 0 0">
<a href="${base}">← voltar ao log</a><span style="color:var(--muted)">·</span><a href="${base}arquivos">ver arquivos</a><span style="color:var(--muted)">·</span><a href="${base}en/" lang="en">english</a>
</p></div></noscript>`
}

export function writeStatic404(config: SiteConfig) {
  const file = path.join(config.outDir, '404.html')
  if (!fs.existsSync(file)) return
  const html = fs.readFileSync(file, 'utf8')
  if (html.includes('<noscript><div class="wrap"')) return
  fs.writeFileSync(file, html.replace('<div id="app">', `${fallback(config)}<div id="app">`))
}
