/*
  O e-mail não vai escrito no JavaScript do site: no build ele é embaralhado
  (invertido, cada letra trocada e escrita em hexadecimal) e só é desembaralhado
  no navegador. Robôs que procuram "algo@algo.com" no código não acham nada.
  No conteudo.yml ele continua escrito normal.
*/

const KEY = 0x2a

export function encodeMail(email: string): string {
  return [...email]
    .reverse()
    .map((c) => (c.charCodeAt(0) ^ KEY).toString(16).padStart(4, '0'))
    .join('')
}

export function decodeMail(code: string): string {
  let out = ''
  for (let i = 0; i < code.length; i += 4) out = String.fromCharCode(parseInt(code.slice(i, i + 4), 16) ^ KEY) + out
  return out
}
