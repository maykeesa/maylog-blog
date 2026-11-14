import { readContent } from '../../readContent'
import { encodeMail } from '../lib/mail'
import type { Site } from '../site'

/*
  Entrega o conteudo.yml aos componentes. No modo dev, salvar o arquivo atualiza a página.
  O e-mail vai embaralhado (veja lib/mail.ts); use decodeMail(site.contato.codigo).
*/

export type ClientSite = Omit<Site, 'contato'> & { contato: { codigo: string } }

declare const data: ClientSite
export { data }

export default {
  watch: ['../../../conteudo.yml'],
  load(files: string[]): ClientSite {
    const { contato, ...rest } = readContent(files[0])
    return { ...rest, contato: { codigo: encodeMail(contato.email) } }
  }
}
