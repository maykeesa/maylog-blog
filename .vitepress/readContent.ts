import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'
import type { Par, Rede, Site } from './theme/site'

/*
  Lê o conteudo.yml da raiz e devolve no formato que o tema usa.
  Roda no Node (config, feed, OG e o data loader site.data.ts).
*/

export const CONTENT_FILE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../conteudo.yml')

type Raw = Record<string, any>

const str = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : v == null ? '' : String(v))
const opt = (v: unknown) => (v == null || v === '' ? undefined : str(v))

const toPar = (p: Raw): Par => ({
  rotulo: str(p.rotulo),
  valor: str(p.valor),
  rotuloEn: opt(p.rotulo_en),
  valorEn: opt(p.valor_en)
})

const toRede = (r: Raw): Rede => ({
  assunto: str(r.assunto),
  nome: str(r.nome),
  usuario: str(r.usuario),
  usuarioEn: opt(r.usuario_en),
  url: str(r.url)
})

export function readContent(file = CONTENT_FILE): Site {
  let raw: Raw
  try {
    raw = (yaml.load(fs.readFileSync(file, 'utf8')) as Raw) ?? {}
  } catch (e) {
    throw new Error(`[maylog] não deu para ler o conteudo.yml: ${(e as Error).message}`)
  }
  const s = raw.site ?? {}
  return {
    nome: str(s.nome || 'maylog'),
    autor: str(s.autor),
    url: str(s.url),
    frase: str(s.frase),
    fraseEn: str(s.frase_en || s.frase),
    agora: {
      atualizado: str(raw.agora?.atualizado),
      itens: (raw.agora?.itens ?? []).map(toPar)
    },
    acompanho: (raw.acompanhando ?? []).map((c: Raw) => ({ nome: str(c.nome), onde: str(c.onde), url: str(c.url) })),
    redes: (raw.redes ?? []).map(toRede),
    contato: { email: str(raw.contato?.email) },
    contador: { url: str(raw.contador?.url), base: Number(raw.contador?.base) || 0 },
    ficha: (raw.ficha ?? []).map(toPar),
    colofao: (raw.colofao ?? []).map(toPar)
  }
}
