# Guia para implementar Meta CAPI com Codex no VS Code

Este guia serve para testar, em aula, um fluxo em que o Codex no VS Code implementa rastreamento server-side usando Vercel Functions e Meta Conversions API.

## Ideia principal

CAPI significa Conversions API. KPI e outra coisa: KPI e uma metrica de negocio; CAPI e uma API da Meta para enviar eventos do servidor.

O fluxo recomendado e:

1. O usuario acessa a LP ou envia um formulario.
2. O frontend chama uma rota interna no Vercel, por exemplo `/api/meta-capi`.
3. A rota serverless le os segredos em variaveis de ambiente.
4. A rota envia o evento para a Meta Conversions API.
5. A Meta recebe o evento no Dataset/Pixel configurado.

Nunca coloque o access token da Meta no HTML, JS publico, GitHub ou README publico.

## O que o Codex no VS Code consegue fazer

O Codex consegue implementar a parte tecnica no projeto se ele tiver acesso ao repositorio local e puder rodar comandos no terminal do VS Code.

Ele pode:

- Criar/editar arquivos do projeto.
- Criar uma rota serverless no Vercel.
- Integrar a rota com formularios e botoes.
- Rodar testes locais.
- Fazer commit e push, se autorizado.
- Configurar variaveis no Vercel via CLI, desde que o Vercel CLI esteja logado e o projeto esteja linkado.

Ele nao deve receber token secreto colado em arquivo versionado. Se precisar inserir token, prefira colar diretamente no prompt interativo do terminal quando o comando `vercel env add` pedir o valor.

## Pre-requisitos

No computador:

- VS Code com Codex.
- Node.js instalado.
- Vercel CLI instalado.
- Projeto clonado localmente.
- Projeto linkado ao Vercel.
- Conta Meta Business com acesso ao Events Manager.
- Pixel/Dataset da Meta criado.

Comandos uteis:

```bash
vercel --version
vercel login
vercel link
vercel env ls
```

## Dados que voce precisa pegar na Meta

No Events Manager da Meta:

1. Abra o Dataset/Pixel do projeto.
2. Copie o Pixel ID/Dataset ID.
3. Gere ou copie o Access Token da Conversions API.
4. Opcionalmente, abra a aba Test Events e copie o Test Event Code para validar em ambiente de teste.

Variaveis que usaremos:

```env
META_PIXEL_ID=
META_ACCESS_TOKEN=
META_TEST_EVENT_CODE=
PUBLIC_BASE_URL=
```

`META_TEST_EVENT_CODE` deve ser usado somente para teste. Depois pode remover ou deixar apenas no ambiente development/preview.

## Como configurar as variaveis no Vercel

Metodo seguro, interativo:

```bash
vercel env add META_PIXEL_ID production
vercel env add META_ACCESS_TOKEN production
vercel env add PUBLIC_BASE_URL production
```

Repita para `preview` e `development` se quiser testar fora da producao:

```bash
vercel env add META_PIXEL_ID preview
vercel env add META_ACCESS_TOKEN preview
vercel env add PUBLIC_BASE_URL preview

vercel env add META_PIXEL_ID development
vercel env add META_ACCESS_TOKEN development
vercel env add PUBLIC_BASE_URL development
vercel env add META_TEST_EVENT_CODE development
```

Para puxar as variaveis para o ambiente local:

```bash
vercel env pull .env.local --yes
```

Confira se `.env.local` esta no `.gitignore`. Se nao estiver, adicione antes de colocar qualquer segredo.

## Prompt pronto para colar no Codex do VS Code

Use este prompt dentro do VS Code, com o projeto aberto:

```text
Quero implementar Meta Conversions API neste projeto usando Vercel Functions.

Objetivo:
- Criar rastreamento server-side da Meta sem expor tokens no frontend.
- Usar variaveis de ambiente:
  - META_PIXEL_ID
  - META_ACCESS_TOKEN
  - META_TEST_EVENT_CODE opcional
  - PUBLIC_BASE_URL opcional
- Integrar primeiro o evento Lead no envio dos formularios existentes.
- Se houver CTAs para Amazon nas LPs do livro, adicionar tambem evento customizado de clique, como ClickAmazon, usando uma rota interna.

Regras de seguranca:
- Nunca hardcodar access token.
- Nunca commitar .env.local.
- Se .env.local nao estiver ignorado, atualizar .gitignore.
- Hashear email e telefone com SHA-256 antes de enviar em user_data.
- Enviar client_user_agent, event_source_url e action_source: "website".
- Quando possivel, enviar fbp e fbc lidos dos cookies.
- Usar event_id para permitir deduplicacao futura com Pixel do navegador.
- Nao quebrar os formularios existentes caso a Meta API falhe. A falha da Meta deve ser logada, mas o lead deve continuar sendo processado.

Tarefas:
1. Inspecione a estrutura do projeto, especialmente api/leads.js, public/assets/js/app.js e as LPs em public/livro, public/livro-escolas e public/livro-nostalgia.
2. Crie uma funcao helper server-side para enviar eventos para:
   https://graph.facebook.com/v21.0/{META_PIXEL_ID}/events
   Se o projeto ja usa outro padrao de API Vercel, siga o padrao local.
3. Crie ou integre uma rota /api/meta-capi para receber eventos do frontend quando necessario.
4. Integre o evento Lead no fluxo de captura de leads existente.
5. Para clique em Amazon, adicione data attributes nos CTAs e um listener no JS publico que envie o evento para /api/meta-capi antes/depois de abrir o link, sem travar a navegacao.
6. Inclua suporte opcional a META_TEST_EVENT_CODE quando existir.
7. Adicione logs seguros, sem imprimir token nem dados sensiveis crus.
8. Valide localmente com npm run dev ou o servidor local existente.
9. Mostre quais arquivos foram alterados e quais comandos de teste foram usados.

Antes de editar, confira git status. Ao final, nao faca commit/push sem minha autorizacao.
```

## Estrutura tecnica sugerida

Para este projeto, a integracao mais simples costuma ser:

- `api/leads.js`: disparar evento `Lead` depois que o lead for montado.
- `api/meta-capi.js`: rota generica para eventos de clique/visualizacao quando vierem do frontend.
- `public/assets/js/app.js`: listener para clique nos botoes da Amazon, se necessario.

Payload minimo recomendado para evento Lead:

```json
{
  "event_name": "Lead",
  "event_time": 1234567890,
  "action_source": "website",
  "event_source_url": "https://site.com/livro/",
  "user_data": {
    "em": ["sha256_do_email"],
    "ph": ["sha256_do_telefone"],
    "client_user_agent": "user-agent",
    "fbp": "cookie_fbp_se_existir",
    "fbc": "cookie_fbc_se_existir"
  },
  "custom_data": {
    "content_name": "Aquarelada - Livro",
    "lead_form": "manual-access"
  },
  "event_id": "lead_id_ou_uuid"
}
```

## Como testar na Meta

1. Adicione `META_TEST_EVENT_CODE` no ambiente development ou preview.
2. Rode localmente com as variaveis carregadas.
3. Envie um formulario de teste.
4. Abra Events Manager > Test Events.
5. Confirme se o evento aparece.
6. Depois teste em preview/production.

## Perguntas para decidir antes da implementacao

- Quais LPs devem disparar PageView/ViewContent server-side?
- Quais botoes contam como clique importante?
- O clique na Amazon deve ser evento `Contact`, `ViewContent`, `InitiateCheckout` ou customizado `ClickAmazon`?
- O formulario principal deve disparar somente `Lead` ou tambem algum evento customizado?
- Vai haver Pixel no navegador tambem? Se sim, precisamos planejar `event_id` para deduplicacao.

## Observacao para aula

O melhor exemplo didatico e:

1. Mostrar Pixel/Events Manager na Meta.
2. Gerar token e explicar que ele fica no servidor.
3. No VS Code, pedir ao Codex para implementar CAPI.
4. Colocar o token no Vercel via `vercel env add`, nao no codigo.
5. Rodar localmente.
6. Enviar evento teste.
7. Mostrar o evento chegando no Test Events da Meta.

Esse fluxo demonstra bem o valor da IA: ela implementa a rota, integra no projeto, protege segredo e ajuda a validar.
