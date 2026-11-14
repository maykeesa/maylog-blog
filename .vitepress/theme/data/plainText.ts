/* tira a marcação do markdown para virar texto puro (busca, resumo, tempo de leitura) */
export function plain(src: string): string {
  return src
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[\^[^\]]*\]:?/g, ' ')
    .replace(/[#>*_`~|-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
