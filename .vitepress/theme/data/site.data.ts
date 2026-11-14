import { readContent } from '../../readContent'
import type { Site } from '../site'

/*
  Entrega o conteudo.yml aos componentes. No modo dev, salvar o arquivo atualiza a página.
*/

declare const data: Site
export { data }

export default {
  watch: ['../../../conteudo.yml'],
  load(files: string[]): Site {
    return readContent(files[0])
  }
}
