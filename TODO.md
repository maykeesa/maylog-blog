# TODO

O que ficou para depois. Apague o item quando terminar.

## conteúdo

- [ ] Trocar ou apagar os posts de exemplo em `posts/` (`001-primeiro-registro`, `002-guia-de-markdown` e `003-tudo-que-o-markdown-faz`).

## para publicar

- [ ] Escolher e registrar o domínio (Registro.br para `.com.br`, ou Cloudflare/Porkbun para `.com`, `.blog`, `.dev`).
- [ ] Trocar `url` no `conteudo.yml` pelo domínio escolhido (usado nos links de compartilhar, nos feeds e no sitemap).
- [ ] Escolher a hospedagem (Cloudflare Pages, Netlify, Vercel ou GitHub Pages) e ligar a publicação automática a cada envio para o GitHub.
- [ ] Apontar o domínio para a hospedagem.

## melhorias combinadas

- [ ] Agendar posts: post com `data` no futuro só aparece quando a data chega, com um build automático diário.
- [ ] "ouvindo" do bloco agora se atualizando sozinho pelo Spotify ou stats.fm.
- [ ] Contador de visitas de verdade: um serviço que responda `{"count": 1234}` a um POST (ex.: Cloudflare Worker com KV) e configurar `contador.url` no `conteudo.yml`.

## para depois do blog no ar

- [ ] Comentários.
- [ ] Newsletter por e-mail.

## pontos técnicos conhecidos

- [ ] O e-mail saiu do HTML gerado, mas ainda aparece no JavaScript do site. Para esconder de vez, guardar codificado no `conteudo.yml`.
- [ ] A página 404 é montada só no navegador (o HTML gerado vem vazio); com JavaScript desligado ela não aparece.
- [ ] Testar tudo no navegador e no celular, nos três temas e nos dois idiomas (incluindo o zoom no Firefox).
