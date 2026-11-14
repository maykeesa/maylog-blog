import { onBeforeUnmount, readonly, shallowRef } from 'vue'

/*
  Recado passageiro, como o "copiado!" dos botões de copiar: aparece e some depois de `ms`.
  Um recado novo reinicia a contagem, e o timer é cancelado se o componente sair da tela.
*/
export function useFlash(ms = 1800) {
  const message = shallowRef('')
  let timer: ReturnType<typeof setTimeout> | undefined

  function flash(text: string) {
    clearTimeout(timer)
    message.value = text
    timer = setTimeout(() => (message.value = ''), ms)
  }

  onBeforeUnmount(() => clearTimeout(timer))

  return { message: readonly(message), flash }
}
