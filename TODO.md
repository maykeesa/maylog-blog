# TODO

O que ficou para depois. Apague o item quando terminar.

## conteúdo

- [ ] Trocar ou apagar os posts de exemplo em `posts/` (`001-primeiro-registro`, `002-guia-de-markdown` e `003-tudo-que-o-markdown-faz`).

## domínio próprio

O site está no ar em https://maylog.vercel.app, publicado sozinho a cada `git push`.

- [ ] Escolher e registrar o domínio (Registro.br para `.com.br`, ou Cloudflare/Porkbun para `.com`, `.blog`, `.dev`).
- [ ] Adicionar o domínio na Vercel (Settings → Domains) e criar no registro os apontamentos DNS que ela pedir.
- [ ] Trocar `url` no `conteudo.yml` pelo domínio novo (usado nos links de compartilhar, nos feeds e no sitemap).

## melhorias combinadas

- [ ] "ouvindo" do bloco agora se atualizando sozinho pelo Spotify ou stats.fm.
- [ ] Contador de visitas de verdade: um serviço que responda `{"count": 1234}` a um POST (ex.: Cloudflare Worker com KV) e configurar `contador.url` no `conteudo.yml`.

## para depois do blog no ar

- [ ] Comentários.
- [ ] Newsletter por e-mail.

## pontos técnicos conhecidos

- [ ] Testar tudo no navegador e no celular, nos três temas e nos dois idiomas (incluindo o zoom no Firefox).
