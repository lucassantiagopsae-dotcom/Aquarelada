# Estrutura do site

## Rotas

- `/` -> `public/index.html`
- `/livro/` -> `public/livro/index.html`
- `/livro-v2/` -> `public/livro-v2/index.html`
- `/livro-escolas/` -> `public/livro-escolas/index.html`
- `/livro-nostalgia/` -> `public/livro-nostalgia/index.html`
- `/supermanual/` -> `public/supermanual/index.html`
- `/acesso/` -> `public/acesso/index.html`
- `/brincadeiras/` -> `public/brincadeiras/index.html`
- `/item/` -> `public/item/index.html`
- `/cantigas/` -> `public/cantigas/index.html`
- `/adivinhas/` -> `public/adivinhas/index.html`
- `/desafios/` -> `public/desafios/index.html`
- `/dobraduras/` -> `public/dobraduras/index.html`
- `/e-se/` -> `public/e-se/index.html`
- `/trava-linguas/` -> `public/trava-linguas/index.html`

## Assets

- `public/assets/css/` -> estilos do site
- `public/assets/js/` -> scripts e dados gerados
- `public/assets/images/` -> logos e imagens principais
- `public/assets/icons/` -> ícones do app/PWA
- `public/assets/plays/` -> ilustrações SVG das brincadeiras
- `public/assets/pdfs/` -> PDFs para download

## Arquivos de origem

- `source/whatsapp-images/` -> imagens recebidas pelo WhatsApp
- `source/recovered-assets/` -> pacote de imagens/SVG usado para recuperar assets
- `source/published-site/` -> cópia baixada do site publicado para restaurar textos originais
- `source/diagnostics/` -> arquivos auxiliares usados na análise

## Configuração

- `serve-local.mjs` -> servidor local com suporte a rotas limpas e URLs antigas
- `vercel.json` -> redirects/rewrites para publicação na Vercel
- `manifest.webmanifest` -> configuração PWA
- `sitemap.xml` -> mapa das páginas públicas
