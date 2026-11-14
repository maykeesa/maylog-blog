import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import sharp from 'sharp'
import type { HeadConfig, SiteConfig, TransformContext } from 'vitepress'
import { readContent } from './readContent'
import { ditherOutput } from './banners'
import { feedLinks } from './feed'

const site = readContent()

/*
  Prévia do link ao compartilhar (WhatsApp, LinkedIn, X, Telegram…).
  - No build, gera og/<pasta>.png (1200×630) para cada post: o banner pontilhado
    (ou a cena fixa do post) com a marca maylog_ no canto. og/site.png serve as outras páginas.
  - Em cada página, escreve as tags Open Graph: título, descrição, imagem, endereço e idioma.
*/

const OG_W = 1200
const OG_H = 630
const INK = '#141414'
const PAPER = '#fafaf7'

interface Meta {
  titulo: string
  descricao: string
  n: string
  banner?: string
}

const root = process.cwd()
const postsDir = path.join(root, 'posts')
const cache = new Map<string, Record<string, unknown>>()

function fm(file: string): Record<string, unknown> {
  if (!cache.has(file)) cache.set(file, fs.existsSync(file) ? matter(fs.readFileSync(file, 'utf8')).data : {})
  return cache.get(file)!
}

function meta(folder: string, lang: 'pt' | 'en'): Meta {
  const pt = fm(path.join(postsDir, folder, 'index.md'))
  const en = lang === 'en' ? fm(path.join(postsDir, folder, 'index.en.md')) : {}
  const pick = (k: string) => String((en[k] as string) ?? (pt[k] as string) ?? '')
  return {
    titulo: pick('titulo') || folder,
    descricao: pick('subtitulo') || pick('resumo') || site.frase,
    n: (folder.match(/^(\d+)-/) || [])[1] || '000',
    banner: pt.banner ? String(pt.banner) : undefined
  }
}

type Bits = { bits: Uint8Array; w: number; h: number }

/* lê um PNG pontilhado (gerado no build) e devolve os bits: 1 onde há tinta */
async function readBits(file: string): Promise<Bits | undefined> {
  if (!fs.existsSync(file)) return undefined
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const bits = new Uint8Array(info.width * info.height)
  for (let i = 0; i < bits.length; i++) bits[i] = data[i * 4 + 3] > 127 ? 1 : 0
  return { bits, w: info.width, h: info.height }
}

/* cenas da home, em ordem alfabética (a mesma regra de sceneFor no site) */
const scenesDir = path.join(root, 'cenas', 'home')
function homeScenes(): string[] {
  if (!fs.existsSync(scenesDir)) return []
  return fs
    .readdirSync(scenesDir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f) && !f.endsWith('.dither.png'))
    .map((f) => f.replace(/\.[^.]+$/, ''))
    .sort()
}
const sceneBits = (name: string) => readBits(path.join(scenesDir, `${name}.dither.png`))
const blank = (): Bits => ({ bits: new Uint8Array(340 * 190), w: 340, h: 190 })

/* bits do post: do banner pontilhado, ou da cena fixa do post quando não há banner */
async function postBits(folder: string, m: Meta): Promise<Bits> {
  if (m.banner) {
    const fromBanner = await readBits(ditherOutput(path.join(postsDir, folder, m.banner)))
    if (fromBanner) return fromBanner
  }
  const list = homeScenes()
  const n = parseInt(m.n, 10) || 0
  return (list.length && (await sceneBits(list[n % list.length]))) || blank()
}

function hex(c: string) {
  const v = parseInt(c.slice(1), 16)
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
}

async function card(art: { bits: Uint8Array; w: number; h: number }, label: string, out: string) {
  const ink = hex(INK), paper = hex(PAPER)
  const rgb = Buffer.alloc(art.w * art.h * 3)
  for (let i = 0; i < art.bits.length; i++) rgb.set(art.bits[i] ? ink : paper, i * 3)
  /*
    Cenas da home (faixas bem largas): mostradas inteiras, emolduradas no papel, em vez de recortadas.
    Banners (16:9): ampliados para preencher a imagem toda.
  */
  if (art.w / art.h > 2.2) {
    const s = Math.floor((OG_W - 180) / art.w)
    const w = art.w * s, h = art.h * s
    /* etiqueta em cima e a faixa logo abaixo (o X escreve o título no canto de baixo) */
    const labelTop = Math.round((OG_H - h - 108) / 2)
    const left = Math.round((OG_W - w) / 2), top = labelTop + 108
    const strip = await sharp(rgb, { raw: { width: art.w, height: art.h, channels: 3 } })
      .resize(w, h, { kernel: 'nearest' })
      .png()
      .toBuffer()
    const frame = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_W}" height="${OG_H}">
        <rect x="${left - 6}" y="${top - 6}" width="${w + 12}" height="${h + 12}" fill="none" stroke="${INK}" stroke-width="3"/>
        <rect x="${left - 6}" y="${labelTop}" width="${36 + label.length * 21}" height="72" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>
        <text x="${left + 12}" y="${labelTop + 49}" font-family="IBM Plex Mono, DejaVu Sans Mono, Consolas, monospace" font-size="34" font-weight="700" fill="${INK}">${label}</text>
      </svg>`
    )
    await sharp({ create: { width: OG_W, height: OG_H, channels: 3, background: PAPER } })
      .composite([{ input: strip, left, top }, { input: frame }])
      .png({ compressionLevel: 9, palette: true })
      .toFile(out)
    return
  }
  /* amplia sem suavizar (pixels nítidos) e recorta para 1200×630; a etiqueta fica no canto de cima, longe do título que o X escreve embaixo */
  const scale = Math.ceil(Math.max(OG_W / art.w, OG_H / art.h))
  const big = await sharp(rgb, { raw: { width: art.w, height: art.h, channels: 3 } })
    .resize(art.w * scale, art.h * scale, { kernel: 'nearest' })
    .png()
    .toBuffer()
  const badge = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_W}" height="${OG_H}">
      <rect x="40" y="40" width="${36 + label.length * 21}" height="72" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>
      <text x="58" y="89" font-family="IBM Plex Mono, DejaVu Sans Mono, Consolas, monospace" font-size="34" font-weight="700" fill="${INK}">${label}</text>
    </svg>`
  )
  await sharp(big)
    .resize(OG_W, OG_H, { fit: 'cover', kernel: 'nearest' })
    .composite([{ input: badge }])
    .png({ compressionLevel: 9, palette: true })
    .toFile(out)
}

/* título e descrição da página (usados na aba e no <meta name="description"> do VitePress) */
export function pageInfo(relativePath: string, params?: Record<string, unknown>): { title?: string; description?: string } {
  let folder = ''
  if (relativePath.startsWith('posts/')) folder = relativePath.split('/')[1]
  else if (relativePath.startsWith('en/posts/')) folder = String(params?.slug ?? '')
  if (!folder) return {}
  const m = meta(folder, relativePath.startsWith('en/') ? 'en' : 'pt')
  return { title: m.titulo, description: m.descricao }
}

/* no fim do build */
export async function writeOgImages(config: SiteConfig) {
  const dir = path.join(config.outDir, 'og')
  fs.mkdirSync(dir, { recursive: true })
  await card((await sceneBits('mar')) || blank(), 'maylog_', path.join(dir, 'site.png'))
  if (!fs.existsSync(postsDir)) return
  for (const folder of fs.readdirSync(postsDir)) {
    if (folder.startsWith('_') || !fs.existsSync(path.join(postsDir, folder, 'index.md'))) continue
    const m = meta(folder, 'pt')
    await card(await postBits(folder, m), `maylog_ · nº ${m.n}`, path.join(dir, `${folder}.png`))
  }
}

/* tags de cada página */
export function ogHead({ pageData }: TransformContext): HeadConfig[] {
  const base = site.url.replace(/\/$/, '')
  const rel = pageData.relativePath
  const isEn = rel.startsWith('en/')
  const lang = isEn ? 'en' : 'pt'

  let folder = ''
  if (rel.startsWith('posts/')) folder = rel.split('/')[1]
  else if (rel.startsWith('en/posts/')) folder = String(pageData.params?.slug ?? '')

  const frase = isEn ? site.fraseEn : site.frase
  /* "título · maylog", sem repetir o nome quando o título já tem a palavra maylog */
  const withSite = (t: string) => (t.toLowerCase().includes(site.nome.toLowerCase()) ? t : `${t} · ${site.nome}`)
  let title = site.nome
  let description = frase
  let image = `${base}/og/site.png`
  let type = 'website'
  let pathName = '/' + rel.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')

  if (folder) {
    const m = meta(folder, lang)
    title = withSite(m.titulo)
    description = m.descricao
    image = `${base}/og/${folder}.png`
    type = 'article'
    pathName = isEn ? `/en/posts/${folder}` : `/posts/${folder}/`
  } else if (pageData.frontmatter.titulo) {
    title = withSite(String(pageData.frontmatter.titulo))
  }

  const url = base + pathName
  return [
    ['meta', { property: 'og:site_name', content: site.nome }],
    ['meta', { property: 'og:type', content: type }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: url }],
    ['meta', { property: 'og:image', content: image }],
    ['meta', { property: 'og:image:width', content: String(OG_W) }],
    ['meta', { property: 'og:image:height', content: String(OG_H) }],
    ['meta', { property: 'og:locale', content: isEn ? 'en_US' : 'pt_BR' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['link', { rel: 'canonical', href: url }],
    ...feedLinks(isEn)
  ]
}
