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
    banner.jpg     ← a foto do banner (opcional)
```

No topo do `index.md` ficam os dados do post:

```yaml
---
titulo: sobre escrever sem público
subtitulo: Um blog sem métricas é um caderno com a porta aberta.
data: 2026-11-13
tema: ensaio
tags: [escrita, blogs]
banner: banner.jpg
---
```

- `titulo`, `data` e `tema` são obrigatórios.
- O número do registro (`012`) vem do nome da pasta.
- O tempo de leitura e o resumo são calculados sozinhos. Para escolher o resumo à mão, use `resumo:`.
- Pastas que começam com `_` são ignoradas (bom para rascunhos).

Os posts `001` e `002` são exemplos: troque ou apague quando escrever os seus.

## onde editar o resto

- `sobre.md`: o texto de apresentação da página sobre.
- `.vitepress/theme/site.ts`: frase do topo, bloco "agora", canais que acompanho, redes, contato, ficha e colofão.
- `.vitepress/theme/styles/tokens.css`: cores dos temas white, dark e sepia.
