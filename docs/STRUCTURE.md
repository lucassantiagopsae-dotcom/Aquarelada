# Estrutura do site

## Rotas

- `/` -> `index.html`
- `/supermanual/` -> `supermanual/index.html`
- `/acesso/` -> `acesso/index.html`
- `/brincadeiras/` -> `brincadeiras/index.html`
- `/item/` -> `item/index.html`
- `/cantigas/` -> `cantigas/index.html`
- `/adivinhas/` -> `adivinhas/index.html`
- `/desafios/` -> `desafios/index.html`
- `/dobraduras/` -> `dobraduras/index.html`
- `/e-se/` -> `e-se/index.html`
- `/trava-linguas/` -> `trava-linguas/index.html`

## Assets

- `assets/css/` -> estilos do site
- `assets/js/` -> scripts e dados gerados
- `assets/images/` -> logos e imagens principais
- `assets/icons/` -> ícones do app/PWA
- `assets/plays/` -> ilustrações SVG das brincadeiras
- `assets/pdfs/` -> PDFs para download

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
