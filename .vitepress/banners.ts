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

async function convert(src: string, out: string, contraste: string) {
  const a = CONTRASTE[contraste] ?? CONTRASTE.normal
  const { data } = await sharp(src)
    .rotate()
    .resize(BANNER_W, BANNER_H, { fit: 'cover', position: 'attention' })
    .grayscale()
    .normalise()
    .linear(a, -(128 * (a - 1)))
    .raw()
    .toBuffer({ resolveWithObject: true })
  const gray = new Float32Array(BANNER_W * BANNER_H)
  for (let i = 0; i < gray.length; i++) gray[i] = data[i] / 255
  const bits = atkinson(gray, BANNER_W, BANNER_H)
  const rgba = Buffer.alloc(BANNER_W * BANNER_H * 4)
  for (let i = 0; i < bits.length; i++) rgba[i * 4 + 3] = bits[i] ? 255 : 0
  await sharp(rgba, { raw: { width: BANNER_W, height: BANNER_H, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(out)
}

const mtime = (f: string) => (fs.existsSync(f) ? fs.statSync(f).mtimeMs : 0)

export async function ditherAll(root: string, log = (m: string) => console.log(m)) {
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
        if (!rel.startsWith('posts/') || rel.endsWith('.dither.png')) return
        if (/\.(md|jpe?g|png|webp)$/i.test(rel)) await ditherAll(root)
      }
      server.watcher.on('add', onChange)
      server.watcher.on('change', onChange)
    }
  }
}
