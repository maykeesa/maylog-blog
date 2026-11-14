/*
  Gera os arquivos fixos do favicon em public/: favicon.svg (tema white) e apple-touch-icon.png (180×180).
  Rode de novo se mudar o desenho em .vitepress/theme/lib/favicon.ts:
    node scripts/favicon.mjs
*/
import fs from 'node:fs'
import sharp from 'sharp'
import { faviconSvg, FAVICON_COLORS } from '../.vitepress/theme/lib/favicon.ts'

fs.mkdirSync('public', { recursive: true })
const { ink, paper } = FAVICON_COLORS.white
const svg = faviconSvg(ink, paper)
fs.writeFileSync('public/favicon.svg', svg)
await sharp(Buffer.from(svg), { density: 1200 }).resize(180, 180, { kernel: 'nearest' }).png().toFile('public/apple-touch-icon.png')
await sharp(Buffer.from(svg), { density: 300 }).resize(32, 32, { kernel: 'nearest' }).png().toFile('public/favicon-32.png')
console.log('favicon gerado em public/')
