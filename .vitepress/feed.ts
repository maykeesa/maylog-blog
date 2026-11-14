import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { createMarkdownRenderer, type SiteConfig } from 'vitepress'
import type { Plugin } from 'vite'
import { readContent } from './readContent'

const site = readContent()

/*
  Feeds dos posts, com o texto completo:
    /feed.json     /feed.xml       → posts em português
    /en/feed.json  /en/feed.xml    → só os posts que têm versão em inglês (index.en.md)
  JSON Feed 1.1 é o formato do botão do rodapé; o RSS 2.0 fica para leitores que só entendem XML.
  No build eles viram arquivos; no modo dev são gerados na hora.
*/

type Lang = 'pt' | 'en'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`
const base = () => site.url.replace(/\/$/, '')

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

function siteConfig(): SiteConfig {
  return (globalThis as unknown as { VITEPRESS_CONFIG: SiteConfig }).VITEPRESS_CONFIG
}

async function loadItems(lang: Lang): Promise<Item[]> {
  const config = siteConfig()
  const md = await createMarkdownRenderer(config.srcDir, config.markdown, config.site.base, config.logger)
  const postsDir = path.join(config.srcDir, 'posts')
  if (!fs.existsSync(postsDir)) return []
  return fs
    .readdirSync(postsDir)
    .filter((f) => !f.startsWith('_') && fs.existsSync(path.join(postsDir, f, 'index.md')))
    .filter((f) => lang === 'pt' || fs.existsSync(path.join(postsDir, f, 'index.en.md')))
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 30)
    .map((folder) => {
      const pt = matter(fs.readFileSync(path.join(postsDir, folder, 'index.md'), 'utf8'))
      const src = lang === 'en' ? matter(fs.readFileSync(path.join(postsDir, folder, 'index.en.md'), 'utf8')) : pt
      const fm = { ...pt.data, ...src.data }
      return {
        url: lang === 'en' ? `${base()}/en/posts/${folder}` : `${base()}/posts/${folder}/`,
        title: String(fm.titulo ?? folder),
        summary: String(fm.subtitulo ?? fm.resumo ?? ''),
        html: md.render(src.content, { relativePath: `posts/${folder}/index.md` }),
        date: new Date(`${isoDate(pt.data.data)}T12:00:00Z`),
        tags: [pt.data.tema, ...(Array.isArray(pt.data.tags) ? pt.data.tags : [])].filter(Boolean).map(String)
      }
    })
}

function toJson(items: Item[], lang: Lang): string {
  const prefix = lang === 'en' ? '/en' : ''
  return JSON.stringify(
    {
      version: 'https://jsonfeed.org/version/1.1',
      title: site.nome,
      home_page_url: `${base()}${prefix}/`,
      feed_url: `${base()}${prefix}/feed.json`,
      description: lang === 'en' ? site.fraseEn : site.frase,
      language: lang === 'en' ? 'en' : 'pt-BR',
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

function toXml(items: Item[], lang: Lang): string {
  const prefix = lang === 'en' ? '/en' : ''
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
    <link>${base()}${prefix}/</link>
    <description>${esc(lang === 'en' ? site.fraseEn : site.frase)}</description>
    <language>${lang === 'en' ? 'en' : 'pt-BR'}</language>
    <atom:link href="${base()}${prefix}/feed.xml" rel="self" type="application/rss+xml"/>
${body}
  </channel>
</rss>
`
}

/* no fim do build: grava os quatro arquivos */
export async function writeFeed(config: SiteConfig) {
  for (const lang of ['pt', 'en'] as const) {
    const items = await loadItems(lang)
    const dir = lang === 'en' ? path.join(config.outDir, 'en') : config.outDir
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'feed.json'), toJson(items, lang))
    fs.writeFileSync(path.join(dir, 'feed.xml'), toXml(items, lang))
  }
}

/* no modo dev: responde os feeds na hora, para o botão do rodapé funcionar */
export function feedDevServer(): Plugin {
  const routes: Record<string, { lang: Lang; json: boolean }> = {
    '/feed.json': { lang: 'pt', json: true },
    '/feed.xml': { lang: 'pt', json: false },
    '/en/feed.json': { lang: 'en', json: true },
    '/en/feed.xml': { lang: 'en', json: false }
  }
  return {
    name: 'maylog-feed-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const route = routes[(req.url || '').split('?')[0]]
        if (!route) return next()
        try {
          const items = await loadItems(route.lang)
          res.setHeader('Content-Type', route.json ? 'application/feed+json; charset=utf-8' : 'application/rss+xml; charset=utf-8')
          res.end(route.json ? toJson(items, route.lang) : toXml(items, route.lang))
        } catch (e) {
          next(e)
        }
      })
    }
  }
}

/* links que avisam os leitores de feed, conforme o idioma da página */
export function feedLinks(isEn: boolean): [string, Record<string, string>][] {
  const prefix = isEn ? '/en' : ''
  return [
    ['link', { rel: 'alternate', type: 'application/feed+json', title: `${site.nome} (json)`, href: `${prefix}/feed.json` }],
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: `${site.nome} (rss)`, href: `${prefix}/feed.xml` }]
  ]
}
