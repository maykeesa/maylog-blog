# TODO

O que ficou para depois. Marque com `[x]` quando terminar.

## conteúdo

- [ ] Escrever o texto de apresentação em `sobre.md` (português) e `en/sobre.md` (inglês).
- [ ] Trocar ou apagar os posts de exemplo `posts/001-primeiro-registro` e `posts/002-guia-de-markdown`.
- [ ] Colocar uma foto de verdade na página sobre (hoje é uma cena pontilhada no lugar).

## para publicar

- [ ] Escolher e registrar o domínio (Registro.br para `.com.br`, ou Cloudflare/Porkbun para `.com`, `.blog`, `.dev`).
- [ ] Trocar `url` em `.vitepress/theme/site.ts` pelo domínio escolhido (usado nos links de compartilhar e nos feeds).
- [ ] Escolher a hospedagem (Cloudflare Pages, Netlify, Vercel ou GitHub Pages) e ligar a publicação automática a cada envio para o GitHub.
- [ ] Apontar o domínio para a hospedagem.

## melhorias combinadas

- [x] Prévia do link ao compartilhar (Open Graph: título, subtítulo e banner como imagem no WhatsApp, LinkedIn etc.).
- [x] Sitemap para o Google (gerado com o domínio de `site.ts`; confira depois de trocar o domínio).
- [x] Feeds em inglês (`/en/feed.json` e `/en/feed.xml`).
- [ ] Agendar posts: post com `data` no futuro só aparece quando a data chega, com um build automático diário.
- [x] Mostrar o nome do arquivo na barra dos blocos de código (ex.: "typescript · src/posts.ts").
- [ ] "ouvindo" do bloco agora se atualizando sozinho pelo Spotify ou stats.fm.
- [ ] Contador de visitas de verdade: um serviço que responda `{"count": 1234}` a um POST (ex.: Cloudflare Worker com KV) e configurar `contador.url` em `site.ts`.

## para depois do blog no ar

- [ ] Comentários.
- [ ] Newsletter por e-mail.

## pontos técnicos conhecidos

- [ ] O e-mail saiu do HTML gerado, mas ainda aparece no JavaScript do site. Para esconder de vez, guardar codificado em `site.ts`.
- [ ] A página 404 é montada só no navegador (o HTML gerado vem vazio); com JavaScript desligado ela não aparece.
- [ ] Testar tudo no navegador e no celular, nos três temas e nos dois idiomas.
