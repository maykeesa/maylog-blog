import fs from 'node:fs'
import path from 'node:path'
import { createContentLoader, type SiteConfig } from 'vitepress'
import { site } from './theme/site'

/* Gera o feed RSS (feed.xml) com os posts completos, no fim do build. */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`

function isoDate(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  return String(v ?? '').slice(0, 10)
}

export async function writeFeed(config: SiteConfig) {
  const base = site.url.replace(/\/$/, '')
  const raw = await createContentLoader('posts/*/index.md', { render: true }).load()
  const items = raw
    .map((p) => ({ ...p, folder: p.url.replace(/^\/posts\//, '').replace(/\/$/, '') }))
    .filter((p) => !p.folder.startsWith('_'))
    .sort((a, b) => b.folder.localeCompare(a.folder))
    .slice(0, 30)

  const xmlItems = items
    .map((p) => {
      const link = base + p.url
      const date = new Date(`${isoDate(p.frontmatter.data)}T12:00:00Z`).toUTCString()
      const tags = (Array.isArray(p.frontmatter.tags) ? p.frontmatter.tags : []).map((t: string) => `<category>${esc(String(t))}</category>`).join('')
      return `    <item>
      <title>${esc(String(p.frontmatter.titulo ?? p.folder))}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${date}</pubDate>
      <category>${esc(String(p.frontmatter.tema ?? ''))}</category>${tags}
      <description>${cdata(p.html ?? '')}</description>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(site.nome)}</title>
    <link>${base}/</link>
    <description>${esc(site.frase)}</description>
    <language>pt-BR</language>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/>
${xmlItems}
  </channel>
</rss>
`
  fs.writeFileSync(path.join(config.outDir, 'feed.xml'), xml)
}
