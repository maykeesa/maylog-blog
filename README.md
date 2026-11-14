# maylog

Registros sobre o que der vontade de escrever. Um weblog pessoal feito com VitePress, Vue e TypeScript.

## rodando

```bash
npm install
npm run dev      # prévia local, atualiza sozinha ao salvar
npm run build    # gera o site em .vitepress/dist
npm run preview  # abre o site gerado
```

## escrevendo um post

Cada post é uma pasta dentro de `posts/`, com o número do registro no começo do nome:

```
posts/
  012-sobre-escrever-sem-publico/
    index.md       ← o texto
    banner/
      banner.jpg   ← a foto do banner (opcional)
    imagens/
      print.png    ← prints e imagens do texto (opcional)
```

No topo do `index.md` ficam os dados do post:

```yaml
---
titulo: sobre escrever sem público
subtitulo: Um blog sem métricas é um caderno com a porta aberta.
data: 2026-11-13
tema: ensaio
tags: [escrita, blogs]
banner: banner/banner.jpg
---
```

- `titulo`, `data` e `tema` são obrigatórios.
- `banner` é opcional: a foto é convertida sozinha em pontilhado (`banner.dither.png`, gerado no build e fora do git). No post, clicar no banner mostra a foto original. Se a conversão ficar ruim, use `contraste: alto` ou `contraste: baixo`.
- Tamanho ideal do banner: foto horizontal em 16:9, com 1600×900 ou 1920×1080, abaixo de ~500 KB. Fotos em outro formato são cortadas para 16:9 na parte com mais detalhe; fotos verticais perdem muito, então vale cortar antes.
- Prints e imagens no meio do texto (`![legenda](./imagens/print.png)`) ficam no original.
- As imagens podem ficar soltas na pasta do post ou numa subpasta, como `imagens/`. Use o caminho relativo à pasta do post, tanto no texto quanto no `banner: imagens/banner.jpg`.
- Blocos de código: escreva a linguagem e, se quiser, o nome do arquivo entre colchetes. Para destacar linhas, use chaves:

  ````md
  ```ts [src/posts.ts] {2}
  const a = 1
  const b = 2 // esta linha fica destacada
  ```
  ````
- O número do registro (`012`) vem do nome da pasta.
- O tempo de leitura e o resumo são calculados sozinhos. Para escolher o resumo à mão, use `resumo:`.
- Pastas que começam com `_` são ignoradas (bom para rascunhos).

Os posts `001` e `002` são exemplos: troque ou apague quando escrever os seus.

## versão em inglês

O site inteiro existe em português (`/`) e em inglês (`/en/`). Para um post ter versão em inglês, crie um `index.en.md` na mesma pasta:

```yaml
---
titulo: on writing without an audience
subtitulo: A blog without metrics is a notebook with the door open.
---
```

Data, tema, tags e banner vêm do `index.md`. Sem o `index.en.md`, a página em inglês mostra o texto em português com um aviso, e o botão "en" do post em português fica desativado.

O texto de apresentação em inglês fica em `en/sobre.md`, e os textos da interface em `.vitepress/theme/lib/i18n.ts`.

## cenas pontilhadas

As imagens sorteadas na home (e usadas nos posts sem banner) ficam em `cenas/home/`; a TV da página 404 fica em `cenas/404/`. O build converte cada `.jpg` em pontilhado (`.dither.png`, fora do git), e o site pinta os pontos na cor do tema.

- Para trocar uma cena, substitua o `.jpg` mantendo o nome. Para criar outra, coloque um `.jpg` novo na pasta: ele entra no sorteio sozinho.
- O nome do arquivo vira o nome mostrado embaixo da imagem ("cena: farol").
- A faixa da home tem o formato 340×96 (bem largo); imagens em outro formato são mostradas recortadas no meio.
- Imagens em tons de cinza são pontilhadas como estão; fotos coloridas ganham ajuste de contraste, como os banners.

## onde editar o resto

- `sobre.md`: o texto de apresentação da página sobre.
- `.vitepress/theme/site.ts`: frase do topo, bloco "agora", canais que acompanho, redes, contato, ficha e colofão.
- `.vitepress/theme/styles/tokens.css`: cores dos temas white, dark e sepia.
