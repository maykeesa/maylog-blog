import type { Post } from '../data/posts.data'

/*
  Endereços do banner de cada post: a foto original e a versão pontilhada gerada no build.
  Os arquivos são encontrados pelo Vite, que já cuida de copiar e versionar.
*/
const images = import.meta.glob('/posts/*/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default'
}) as Record<string, string>

export interface Banner {
  original: string
  dither?: string
}

export function bannerOf(p: Post): Banner | undefined {
  if (!p.banner) return undefined
  const key = `/posts/${p.slug}/${p.banner}`
  const original = images[key]
  if (!original) return undefined
  return { original, dither: images[key.replace(/\.[^.]+$/, '.dither.png')] }
}

/* lê a imagem pontilhada e devolve os bits (1 = tinta), para recolorir no tema atual */
const cache = new Map<string, Promise<{ bits: Uint8Array; w: number; h: number }>>()
export function loadBits(url: string) {
  let p = cache.get(url)
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const c = document.createElement('canvas')
        c.width = img.naturalWidth
        c.height = img.naturalHeight
        const ctx = c.getContext('2d')
        if (!ctx) return reject(new Error('sem canvas'))
        ctx.drawImage(img, 0, 0)
        const d = ctx.getImageData(0, 0, c.width, c.height).data
        const bits = new Uint8Array(c.width * c.height)
        for (let i = 0; i < bits.length; i++) bits[i] = d[i * 4 + 3] > 127 ? 1 : 0
        resolve({ bits, w: c.width, h: c.height })
      }
      img.onerror = () => reject(new Error('banner não carregou'))
      img.src = url
    })
    cache.set(url, p)
  }
  return p
}
