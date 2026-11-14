import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import type { Plugin } from 'vite'

/*
  Converte o banner de cada post em uma imagem pontilhada de 1 bit (PNG com fundo transparente),
  salva ao lado da original como <nome>.dither.png. Roda no começo do build e, no modo dev,
  sempre que um banner ou um index.md muda. Só reconverte o que mudou.

  No topo do index.md:
    banner: banner.jpg
    contraste: alto   # opcional: baixo | normal | alto
*/

export const BANNER_W = 340
export const BANNER_H = 190
const CONTRASTE: Record<string, number> = { baixo: 1.0, normal: 1.3, alto: 1.7 }

function frontmatter(md: string): Record<string, string> {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  const out: Record<string, string> = {}
  if (!m) return out
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/)
    if (kv) out[kv[1]] = kv[2].trim().replace(/^['"]|['"]$/g, '')
  }
  return out
}

function atkinson(gray: Float32Array, w: number, h: number): Uint8Array {
  const out = new Uint8Array(w * h)
  const sp = [[1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [0, 2]]
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x, old = gray[i], nv = old < 0.5 ? 0 : 1, err = (old - nv) / 8
      out[i] = nv === 0 ? 1 : 0
      for (const [dx, dy] of sp) {
        const nx = x + dx, ny = y + dy
        if (nx >= 0 && nx < w && ny < h) gray[ny * w + nx] += err
      }
    }
  return out
}

export function ditherOutput(file: string) {
  return file.replace(/\.[^.]+$/, '.dither.png')
}

/*
  - Banners: cortados em 16:9 (340×190) na parte com mais detalhe.
  - Cenas (keepShape): mantêm o formato da imagem, só reduzidas para 340 de largura.
  Fotos coloridas ganham o tratamento completo (escala de tons esticada e contraste);
  imagens que já vêm em tons de cinza, como as cenas exportadas, são pontilhadas como estão.
*/
async function convert(src: string, out: string, contraste: string, keepShape = false) {
  const meta = await sharp(src).metadata()
  const faithful = meta.space === 'b-w' || (meta.channels as number) === 1
  const a = faithful ? 1 : (CONTRASTE[contraste] ?? CONTRASTE.normal)
  let img = sharp(src).rotate()
  img = keepShape
    ? img.resize({ width: BANNER_W })
    : img.resize(BANNER_W, BANNER_H, { fit: 'cover', position: faithful ? 'centre' : 'attention' })
  img = img.grayscale()
  if (!faithful) img = img.normalise().linear(a, -(128 * (a - 1)))
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
  const w = info.width, h = info.height
  const gray = new Float32Array(w * h)
  for (let i = 0; i < gray.length; i++) gray[i] = data[i * info.channels] / 255
  const bits = atkinson(gray, w, h)
  const rgba = Buffer.alloc(w * h * 4)
  for (let i = 0; i < bits.length; i++) rgba[i * 4 + 3] = bits[i] ? 255 : 0
  await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(out)
}

const mtime = (f: string) => (fs.existsSync(f) ? fs.statSync(f).mtimeMs : 0)

/* lista as imagens de uma pasta e das subpastas (sem as versões já pontilhadas) */
function imagesIn(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) return imagesIn(p)
    return /\.(jpe?g|png|webp)$/i.test(e.name) && !e.name.endsWith('.dither.png') ? [p] : []
  })
}

/* cenas pontilhadas da home e da 404: cenas/home/*.jpg e cenas/404/*.jpg */
async function ditherScenes(root: string, log: (m: string) => void) {
  for (const src of imagesIn(path.join(root, 'cenas'))) {
    const out = ditherOutput(src)
    if (mtime(out) >= mtime(src)) continue
    try {
      await convert(src, out, 'normal', true)
      log(`[maylog] cena pontilhada: ${path.relative(root, out).replace(/\\/g, '/')}`)
    } catch (e) {
      log(`[maylog] não deu para converter ${path.relative(root, src)}: ${(e as Error).message}`)
    }
  }
}

export async function ditherAll(root: string, log = (m: string) => console.log(m)) {
  await ditherScenes(root, log)
  const postsDir = path.join(root, 'posts')
  if (!fs.existsSync(postsDir)) return
  for (const dir of fs.readdirSync(postsDir)) {
    const md = path.join(postsDir, dir, 'index.md')
    if (!fs.existsSync(md)) continue
    const fm = frontmatter(fs.readFileSync(md, 'utf8'))
    if (!fm.banner) continue
    const src = path.join(postsDir, dir, fm.banner)
    if (!fs.existsSync(src)) {
      log(`[maylog] banner não encontrado: posts/${dir}/${fm.banner}`)
      continue
    }
    const out = ditherOutput(src)
    if (mtime(out) >= Math.max(mtime(src), mtime(md))) continue
    try {
      await convert(src, out, fm.contraste || 'normal')
      log(`[maylog] banner pontilhado: posts/${dir}/${path.basename(out)}`)
    } catch (e) {
      log(`[maylog] não deu para converter posts/${dir}/${fm.banner}: ${(e as Error).message}`)
    }
  }
}

export function ditherBanners(): Plugin {
  let root = process.cwd()
  return {
    name: 'maylog-dither-banners',
    configResolved(c) {
      root = c.root
    },
    async buildStart() {
      await ditherAll(root)
    },
    configureServer(server) {
      const onChange = async (file: string) => {
        const rel = path.relative(root, file).replace(/\\/g, '/')
        if (!(rel.startsWith('posts/') || rel.startsWith('cenas/')) || rel.endsWith('.dither.png')) return
        if (/\.(md|jpe?g|png|webp)$/i.test(rel)) await ditherAll(root)
      }
      server.watcher.on('add', onChange)
      server.watcher.on('change', onChange)
    }
  }
}
