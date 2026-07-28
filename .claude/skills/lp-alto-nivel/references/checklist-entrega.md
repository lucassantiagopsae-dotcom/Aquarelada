# Checklist de entrega

Três camadas, verificadas de formas diferentes. A página só está pronta quando as três passam.

A separação importa porque cada camada tem um dono: a máquina resolve a primeira sozinha, o briefing decide a segunda, e o olho treinado julga a terceira. Misturar as três é o que faz revisão de página virar discussão sem fim.

---

## Camada 1 — Verificável por máquina

Nada aqui é opinião. Se falhou, corrige.

**Composição**
- [ ] `node scripts/auditar-lp.mjs <arquivo>` sai com código 0
- [ ] `scripts/medir-paleta.js` mostra proporção próxima de 70/30/10 sem diagnósticos críticos

**Funcionamento**
- [ ] Console do navegador sem erros
- [ ] Console sem avisos relevantes (recurso 404, atributo inválido)
- [ ] Todo formulário envia e retorna sucesso — testado de verdade, não presumido
- [ ] Todo link leva a algum lugar (nenhum `href="#"` ou `href=""` remanescente)
- [ ] Toda imagem carrega (nenhum ícone de imagem quebrada)

**Responsivo**
- [ ] 360px — sem rolagem horizontal, nada cortado, nada sobreposto
- [ ] 768px — layout se reorganiza, não apenas encolhe
- [ ] 1280px e 1920px — conteúdo não se perde em largura excessiva

**Acessibilidade**
- [ ] Toda imagem com `alt` descritivo (ou `alt=""` se for puramente decorativa)
- [ ] Contraste de texto atinge AA (4,5:1 para corpo, 3:1 para texto grande)
- [ ] Navegação por teclado alcança todos os elementos interativos, com foco visível
- [ ] Hierarquia de títulos sem saltos (h1 → h2 → h3, nunca h1 → h4)
- [ ] `prefers-reduced-motion` respeitado

**Desempenho**
- [ ] Imagens em formato moderno e dimensionadas para o uso real
- [ ] Nada acima da dobra depende de JavaScript para aparecer
- [ ] Fontes com `font-display: swap`

**Metadados**
- [ ] `<title>` e `meta description` escritos para essa página
- [ ] Open Graph com imagem — é o que aparece quando alguém compartilha
- [ ] `favicon` presente
- [ ] `lang` correto no `<html>`

---

## Camada 2 — Verificável contra o briefing

Esta camada é a condição de parada que vem do cliente. Se não houver briefing escrito, ela não pode ser verificada — e a página não pode ser considerada entregue.

- [ ] Todos os pontos que o cliente pediu estão cobertos, item por item
- [ ] A oferta está explícita: o que é, para quem, o que a pessoa recebe
- [ ] O CTA é **um só**, repetido ao longo da página com a mesma palavra
- [ ] O tom de voz corresponde ao da marca
- [ ] Nenhuma informação foi inventada. Preço, prazo, garantia, número, depoimento — se não estava no briefing, não entra
- [ ] Objeções previsíveis do público estão respondidas em algum lugar
- [ ] A prova social é específica (nome, empresa, número), não genérica
- [ ] O rastreamento pedido está instalado e testado (pixel, analytics, tag de origem do lead)

**Lacunas do briefing:** se faltar informação, liste as perguntas para o cliente em vez de preencher com texto plausível. Texto inventado em landing page vira promessa comercial — o custo do erro não é estético.

---

## Camada 3 — Verificável contra o padrão visual

Aqui entra julgamento, mas os itens foram escritos para serem o mais concretos possível.

**Hierarquia**
- [ ] Ao abrir a página, existe um único elemento que o olho encontra primeiro
- [ ] A razão entre h1 e h2 é de pelo menos 1,5x
- [ ] Cada seção tem um elemento claramente dominante — não três elementos de peso igual

**Cor**
- [ ] Uma única cor de destaque, usada apenas no que é clicável ou no ponto da seção
- [ ] Neutro base não é branco puro; tom oposto não é preto puro
- [ ] Sombras puxam o matiz do elemento, não são pretas genéricas

**Espaço**
- [ ] Espaçamento vertical entre seções entre 96px e 160px em desktop
- [ ] Espaçamentos seguem uma escala, não valores soltos
- [ ] Texto corrido entre 60 e 75 caracteres por linha
- [ ] Existe pelo menos uma composição assimétrica (não 50/50)

**Forma**
- [ ] Raios de canto limitados a 2-3 valores em toda a página
- [ ] Existe ao menos um elemento em sobreposição criando camada
- [ ] Existe ao menos um transbordo intencional (algo cortado pela borda)

**O teste final**
- [ ] Rolando a página inteira rápido, cada seção parece diferente da anterior
- [ ] Trocando o logo e o nome, a página **não** serviria para outra empresa
- [ ] Nenhum item da lista "parecer feita por IA" em `ritmo-e-composicao.md` está presente

---

## Antes de entregar ao cliente

- [ ] Página aberta em celular real, não apenas no simulador do navegador
- [ ] Texto lido em voz alta uma vez — erros de português e frases travadas aparecem no ouvido, não no olho
- [ ] Formulário preenchido de ponta a ponta, confirmando que o lead chegou ao destino
- [ ] Compartilhamento testado em WhatsApp, para conferir como o card aparece
