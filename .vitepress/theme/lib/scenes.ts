/*
  Cenas pontilhadas: imagens em cenas/home/ (sorteadas na home e usadas nos posts sem banner)
  e em cenas/404/ (a TV sem sinal). O build converte cada .jpg em .dither.png;
  aqui só ficam os endereços dessas versões pontilhadas.

  Para trocar uma cena, substitua o .jpg. Para criar outra, coloque um .jpg novo na pasta.
*/

const files = import.meta.glob('/cenas/**/*.dither.png', {
  eager: true,
  query: '?url',
  import: 'default'
}) as Record<string, string>

/* "home/lua" → endereço da versão pontilhada */
const byName: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([key, url]) => [key.replace(/^\/cenas\//, '').replace(/\.dither\.png$/, ''), url])
)

/* nomes das cenas da home, em ordem alfabética (ex.: "aurora", "campo"…) */
export const HOME_SCENES = Object.keys(byName)
  .filter((k) => k.startsWith('home/'))
  .map((k) => k.slice('home/'.length))
  .sort()

export function sceneUrl(name: string): string | undefined {
  return byName[name.includes('/') ? name : `home/${name}`]
}
