---
titulo: guia de markdown do maylog
subtitulo: Tudo o que dá para usar num post, num lugar só.
data: 2026-11-14
tema: técnica
tags: [markdown, guia]
banner: banner/banner.jpg
---

Este post de exemplo mostra cada elemento de formatação que o maylog estiliza. Use como referência e apague quando não precisar mais.

## texto

Parágrafos normais, com **negrito**, *itálico*, [links](https://vitepress.dev) e `código no meio do texto`.

> Citações viram um bloco em itálico com uma linha dupla do lado.

## listas

- item com traço
- outro item
  - e um subitem

1. lista numerada
2. segundo passo

## código

```ts
// como o maylog encontra os posts
const posts = import.meta.glob('./posts/*/index.md', { eager: true })

export function recentes(n = 6): Post[] {
  return Object.values(posts)
    .map((p) => p.frontmatter as Post)
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, n)
}
```

## notas de rodapé

Uma frase com nota[^1].

[^1]: E aqui o texto da nota, que aparece no fim do post.
