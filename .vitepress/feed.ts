import fs from 'node:fs'
import path from 'node:path'
import { createContentLoader, type SiteConfig } from 'vitepress'
import type { Plugin } from 'vite'
import { site } from './theme/site'

/*
  Feeds dos posts, com o texto completo:
    /feed.json  → JSON Feed 1.1 (o botão do rodapé aponta para este)
    /feed.xml   → RSS 2.0, para leitores que só entendem XML
  No build eles viram arquivos; no modo dev são gerados na hora.
*/

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`

function isoDate(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  return String(v ?? '').slice(0, 10)
}

interface Item {
  url: string
  title: string
  summary: string
  html: string
  date: Date
  tags: string[]
}

async function loadItems(): Promise<Item[]> {
  const base = site.url.replace(/\/$/, '')
  const raw = await createContentLoader('posts/*/index.md', { render: true }).load()
  return raw
    .map((p) => ({ p, folder: p.url.replace(/^\/posts\//, '').replace(/\/$/, '') }))
    .filter(({ folder }) => !folder.startsWith('_'))
    .sort((a, b) => b.folder.localeCompare(a.folder))
    .slice(0, 30)
    .map(({ p, folder }) => ({
      url: base + p.url,
      title: String(p.frontmatter.titulo ?? folder),
      summary: String(p.frontmatter.subtitulo ?? p.frontmatter.resumo ?? ''),
      html: p.html ?? '',
      date: new Date(`${isoDate(p.frontmatter.data)}T12:00:00Z`),
      tags: [p.frontmatter.tema, ...(Array.isArray(p.frontmatter.tags) ? p.frontmatter.tags : [])].filter(Boolean).map(String)
    }))
}

function toJson(items: Item[]): string {
  const base = site.url.replace(/\/$/, '')
  return JSON.stringify(
    {
      version: 'https://jsonfeed.org/version/1.1',
      title: site.nome,
      home_page_url: `${base}/`,
      feed_url: `${base}/feed.json`,
      description: site.frase,
      language: 'pt-BR',
      authors: [{ name: site.autor }],
      items: items.map((i) => ({
        id: i.url,
        url: i.url,
        title: i.title,
        summary: i.summary || undefined,
        content_html: i.html,
        date_published: i.date.toISOString(),
        tags: i.tags
      }))
    },
    null,
    2
  )
}

function toXml(items: Item[]): string {
  const base = site.url.replace(/\/$/, '')
  const body = items
    .map(
      (i) => `    <item>
      <title>${esc(i.title)}</title>
      <link>${i.url}</link>
      <guid isPermaLink="true">${i.url}</guid>
      <pubDate>${i.date.toUTCString()}</pubDate>
${i.tags.map((t) => `      <category>${esc(t)}</category>`).join('\n')}
      <description>${cdata(i.html)}</description>
    </item>`
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(site.nome)}</title>
    <link>${base}/</link>
    <description>${esc(site.frase)}</description>
    <language>pt-BR</language>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/>
${body}
  </channel>
</rss>
`
}

/* no fim do build: grava os dois arquivos */
export async function writeFeed(config: SiteConfig) {
  const items = await loadItems()
  fs.writeFileSync(path.join(config.outDir, 'feed.json'), toJson(items))
  fs.writeFileSync(path.join(config.outDir, 'feed.xml'), toXml(items))
}

/* no modo dev: responde /feed.json e /feed.xml na hora, para o botão do rodapé funcionar */
export function feedDevServer(): Plugin {
  return {
    name: 'maylog-feed-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url || '').split('?')[0]
        if (url !== '/feed.json' && url !== '/feed.xml') return next()
        try {
          const items = await loadItems()
          const json = url === '/feed.json'
          res.setHeader('Content-Type', json ? 'application/feed+json; charset=utf-8' : 'application/rss+xml; charset=utf-8')
          res.end(json ? toJson(items) : toXml(items))
        } catch (e) {
          next(e)
        }
      })
    }
  }
}
