import { Redis } from '@upstash/redis'

/*
  Contador de visitas do rodapé, rodando como função da Vercel em maylog.net/api/contador.
    POST                    → soma uma visita
    POST ?novo=1            → soma uma visita e um visitante (primeira vez daquele navegador)
    POST ?novo=1&visita=0   → soma só o visitante (a visita desta sessão já tinha sido contada)
    GET                     → só lê os totais
  Sempre devolve {"count": visitantes, "visitas": visitas}.

  Quem decide se o visitante é novo é o próprio navegador (um sinal no localStorage),
  então o servidor não recebe nem guarda nada de quem visita: só os dois números.
  O banco é um Redis da Upstash ligado ao projeto pelo painel da Vercel
  (variáveis KV_REST_API_URL e KV_REST_API_TOKEN).
*/

const VISITAS = 'maylog:contador:visitas'
const VISITANTES = 'maylog:contador:visitantes'

const redis = new Redis({
  url: process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? '',
  token: process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? ''
})

function reply(visitantes: unknown, visitas: unknown) {
  return Response.json(
    { count: Number(visitantes) || 0, visitas: Number(visitas) || 0 },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}

export async function POST(request: Request) {
  const params = new URL(request.url).searchParams
  const novo = params.get('novo') === '1'
  const visita = params.get('visita') !== '0'
  if (novo && !visita) {
    const [visitantes, visitas] = await Promise.all([redis.incr(VISITANTES), redis.get<number>(VISITAS)])
    return reply(visitantes, visitas)
  }
  if (novo) {
    const [visitas, visitantes] = await redis.pipeline().incr(VISITAS).incr(VISITANTES).exec<[number, number]>()
    return reply(visitantes, visitas)
  }
  const [visitas, visitantes] = await Promise.all([redis.incr(VISITAS), redis.get<number>(VISITANTES)])
  return reply(visitantes, visitas)
}

export async function GET() {
  const [visitas, visitantes] = await redis.mget<[number | null, number | null]>(VISITAS, VISITANTES)
  return reply(visitantes, visitas)
}
