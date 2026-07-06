# Checklist de assets recuperados

## Imagens apontadas com sucesso

- `assets/images/supermanual-logo.png` <- `Brincadeiras _ Super Manual/imgi_1_supermanual-logo.png`
- `assets/images/aquarelada-logo.png` <- `WhatsApp Image 2026-07-06 at 16.32.03 (3).jpeg` convertido para PNG
- `assets/icons/app-icon-180.png` <- `WhatsApp Image 2026-07-06 at 16.32.03.jpeg` convertido para PNG
- `assets/icons/app-icon-192.png` <- `WhatsApp Image 2026-07-06 at 16.32.03 (1).jpeg` convertido para PNG
- `assets/icons/app-icon-512.png` <- `WhatsApp Image 2026-07-06 at 16.32.03 (2).jpeg` convertido para PNG
- `assets/images/hero-brinquedos.png` <- montagem criada com as imagens `WhatsApp Image 2026-07-06 at 16.32.14*.jpeg`
- `assets/plays/elastico.svg` <- `Brincadeiras _ Super Manual/imgi_2_elastico.svg`
- `assets/plays/carrinho-de-rolima.svg` <- `Brincadeiras _ Super Manual/imgi_3_carrinho-de-rolima.svg`
- `assets/plays/amarelinha.svg` <- `Brincadeiras _ Super Manual/imgi_2_amarelinha.svg`
- `assets/plays/pipa.svg` <- `Brincadeiras _ Super Manual/imgi_3_pipa.svg`
- `assets/plays/ioio.svg` <- `Brincadeiras _ Super Manual/imgi_2_ioio.svg`
- `assets/plays/corrida-de-saco.svg` <- `Brincadeiras _ Super Manual/imgi_5_corrida-de-saco.svg`
- `assets/plays/taco.svg` <- `Brincadeiras _ Super Manual/imgi_7_taco.svg`
- `assets/plays/bolinha-de-gude.svg` <- `Brincadeiras _ Super Manual/imgi_6_bolinha-de-gude.svg`
- `assets/plays/cabaninha.svg` <- `Brincadeiras _ Super Manual/imgi_10_cabaninha.svg`

## Arquivos auxiliares copiados para a estrutura esperada

- `assets/css/styles.css` <- `styles.css`
- `assets/js/app.js` <- `app.js`
- `assets/js/generated-data.js` <- `generated-data.js`

## Status

- Todas as imagens referenciadas por HTML, CSS, manifest e dados JS existem agora.
- Todos os caminhos de imagem testados responderam HTTP 200 localmente.
- A tela `brincadeiras.html?tag=Livro` carregou os SVGs reais sem imagens quebradas.

## PDFs recuperados depois da reorganização

- Os 14 PDFs que estavam faltando foram baixados da versão publicada e salvos em `assets/pdfs/`.
- A validação atual não encontrou PDFs faltando.

## Observacoes

- O arquivo original `assets/images/hero-brinquedos.png` nao veio com esse nome. Para nao deixar o caminho quebrado, ele foi reconstruido como uma montagem com as imagens de brincadeiras recebidas pelo WhatsApp.
- Existem duplicatas na pasta `Brincadeiras _ Super Manual`; elas foram ignoradas porque os arquivos tem o mesmo conteudo.
- A checagem principal deste arquivo cobre imagens. Os PDFs faltantes do pacote recebido foram recuperados da versão publicada.
