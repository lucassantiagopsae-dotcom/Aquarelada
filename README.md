# Aquarelada Editora

Site institucional, landing pages do livro **Um Dia Diferente, Como Era Antigamente!** e Super Manual de Brincadeiras da Aquarelada Editora.

## Publicacao

- Producao: <https://www.aquarelada.com.br>
- Hospedagem: Vercel
- Projeto Vercel: `aquarelada-site`
- Branch de producao: `master`
- Diretorio publicado: `public`
- Build: site estatico, sem etapa de compilacao

Os pushes em `master` geram uma nova publicacao automatica pela integracao entre GitHub e Vercel.

## Desenvolvimento local

Requisitos: Node.js 18 ou superior.

```powershell
npm install
npm run dev
```

O servidor local fica disponivel em <http://127.0.0.1:4177>.

Antes de publicar:

```powershell
npm run check
```

## Estrutura

- `public/`: paginas, estilos, scripts e arquivos publicados pela Vercel
- `api/`: funcoes serverless para leads e Meta Conversions API
- `lib/`: codigo compartilhado pelas funcoes serverless
- `source/`: materiais de origem e arquivos usados na producao
- `docs/`: documentacao tecnica e historico de implementacao
- `tools/`: validadores e utilitarios locais
- `vercel.json`: redirects, rewrites e configuracao de deploy

O mapa completo de paginas e assets esta em [`docs/STRUCTURE.md`](docs/STRUCTURE.md).

## Variaveis de ambiente

As credenciais nao devem ser salvas no repositorio. Elas sao configuradas no projeto da Vercel conforme a funcionalidade utilizada:

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `RESEND_API_KEY`
- `LEAD_FROM_EMAIL`
- `LEAD_REPLY_FROM`
- `LEAD_NOTIFY_TO`
- `PUBLIC_BASE_URL`
- `META_PIXEL_ID`
- `META_ACCESS_TOKEN`
- `META_TEST_EVENT_CODE` (somente ambientes de teste)

Mais detalhes sobre leads e integracoes estao em [`SETUP-LEADS.md`](SETUP-LEADS.md) e [`docs/META-CAPI-CODEX-VSCODE.md`](docs/META-CAPI-CODEX-VSCODE.md).

## Transferencia de propriedade

Ao transferir o repositorio no GitHub, confirme depois da aceitacao:

1. O novo proprietario tem acesso administrativo ao repositorio.
2. A integracao GitHub da equipe Aquarelada Editora na Vercel continua com acesso ao repositorio.
3. Um push de teste em `master` cria um deployment de producao.
4. O dominio `www.aquarelada.com.br` continua associado ao projeto `aquarelada-site`.

As variaveis de ambiente permanecem na Vercel e nao devem ser copiadas para arquivos do GitHub.
