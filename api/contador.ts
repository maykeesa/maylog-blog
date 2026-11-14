import { Redis } from '@upstash/redis'

/*
  Contador de visitas do rodapé, rodando como função da Vercel em maylog.net/api/contador.
    POST → soma uma visita e devolve o total: {"count": 1234}
    GET  → só devolve o total, sem somar
  O total fica num banco Redis da Upstash, ligado ao projeto pelo painel da Vercel
  (variáveis KV_REST_API_URL e KV_REST_API_TOKEN). Não guarda nada de quem visita, só o número.
*/

const KEY = 'maylog:visitas'

const redis = new Redis({
  url: process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? '',
  token: process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? ''
})

function reply(count: number) {
  return Response.json({ count }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST() {
  return reply(await redis.incr(KEY))
}

export async function GET() {
  return reply(Number(await redis.get<number>(KEY)) || 0)
}
