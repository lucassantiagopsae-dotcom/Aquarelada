---
name: lp-alto-nivel
description: Constrói landing pages com padrão visual de referência (nível Refero/Godly/Awwwards), usando um vocabulário de 30 arquétipos de seção e regras de composição auditáveis que impedem a página de virar "chapéu, título, subtítulo, card-card-card". Use SEMPRE que o usuário pedir uma landing page, LP, página de vendas, página de captura, home de site, one-pager, ou disser que quer uma página "bonita", "de alto nível", "que não pareça feita por IA", "no nível do Refero/Dribbble". Use também ao revisar, auditar ou reformular uma página existente que ficou repetitiva, genérica ou cansativa de ver — mesmo que o usuário não use a palavra "landing page".
---

# Landing pages de alto nível

## O problema que essa skill existe para resolver

Páginas geradas por IA são raramente feias. Elas são **previsíveis** — e previsível cansa mais rápido que feio.

O padrão é sempre o mesmo: chapéu, título, subtítulo, grade de cards. Repetido cinco vezes com conteúdos diferentes. O olho decodifica a estrutura nos primeiros três segundos e, a partir daí, não recebe nenhum estímulo novo. A pessoa rola até o fim sem ler nada, porque a página já contou tudo o que tinha de estrutural na primeira tela.

A causa é uma pergunta que nunca é feita: **que forma essa informação quer ter?**

Uma sequência de passos quer ser uma linha do tempo, não três cards. Uma comparação quer ser duas colunas confrontadas, não três cards. Uma estatística quer ser um número gigante ocupando a tela, não um card com um ícone. Quando o card vira resposta universal, a página perde a capacidade de comunicar hierarquia — tudo tem o mesmo peso visual, então nada tem peso.

Essa skill força a pergunta antes de qualquer HTML ser escrito, e depois audita se ela foi realmente respondida.

## Processo

### Fase 1 — Mapa de conteúdo (antes de escrever qualquer código)

Liste as seções da página em texto puro. Para cada uma, responda três coisas:

1. **Que trabalho essa seção faz?** (convencer, explicar, provar, comparar, remover objeção, converter)
2. **Qual a natureza do conteúdo?** (sequência, comparação, quantidade, narrativa, lista paralela, processo espacial)
3. **Qual arquétipo serve essa natureza?** — consulte `references/arquetipos.md`

Escreva esse mapa e mostre ao usuário antes de construir. É a etapa mais barata de corrigir e a que mais determina o resultado. Uma página com o mapa errado não se salva com CSS bonito.

Use a tabela de tradução abaixo. Ela existe porque o instinto do modelo é sempre voltar pro card:

| Se o conteúdo é… | A forma é | Nunca use |
|---|---|---|
| Sequência onde a ordem importa | `stepper-numerado`, `timeline-vertical` | card-grid |
| Comparação entre duas opções | `comparacao-lado-a-lado`, `tabela-comparativa`, `slider-antes-depois` | card-grid |
| Como algo funciona (processo) | `diagrama-anotado`, `split-sticky`, `scrollytelling` | card-grid |
| Um número, resultado ou métrica | `numero-gigante`, `estudo-de-caso` | card com ícone |
| Prova social | `depoimento-full-bleed`, `mural-depoimentos`, `logo-wall` | card-grid genérico |
| Objeções e dúvidas | `faq-acordeao` | card-grid |
| 3 a 6 itens genuinamente paralelos | `bento-assimetrico` (preferido) ou `card-grid` (só uma vez) | — |
| Mais de 8 itens homogêneos | `scroll-horizontal`, `mosaico` | grade com 12 cards |
| Algo espacial ou visual por natureza | ilustração, diagrama, mosaico | lista de bullets |

### Fase 2 — Construção

Cada seção da página carrega atributos que declaram sua composição. Isso não é burocracia: é o que torna as regras auditáveis por script em vez de discutíveis por opinião.

```html
<section data-arquetipo="timeline-vertical" data-tom="escuro" data-forma="bloco-contido">
```

- **`data-arquetipo`** — nome exato vindo de `references/arquetipos.md`
- **`data-tom`** — `claro` | `escuro` | `cor` | `imagem`. Declare o **tom que o olho percebe**, não o `background` da tag. Uma seção com fundo marfim contendo um bloco grafite de 900px de altura é percebida como escura — marque `escuro`.
- **`data-forma`** — `faixa-full-bleed` | `bloco-contido` | `contido`. Ver a distinção em `references/ritmo-e-composicao.md`, é uma das decisões que mais afeta o resultado.
- **`data-tratamento`** — a superfície dominante: `card-branco` | `card-escuro` | `bloco-cor` | `imagem-fundo` | `texto-puro` | `tabela` | `ilustracao`
- **`data-divisa`** — como a seção entra em relação à anterior: `reta` | `inclinada` | `curva` | `sobreposta` | `recorte`
- **`data-cabecalho="padrao"`** — marque **apenas** se a seção abre com o trio chapéu/título/subtítulo
- **`data-ancora="visual"`** — marque se a seção tem ilustração, foto, diagrama ou gráfico com peso real na composição
- **`data-variacao="interna"`** — apenas em `card-grid`, quando os cards variam de verdade entre si (tamanho, cor, presença de foto)

Detalhes de tipografia, cor, espaçamento e o que caracteriza "cara de IA": `references/ritmo-e-composicao.md`. Animação e movimento: `references/movimento.md`.

### Fase 3 — Auditoria

Rode o auditor antes de considerar a página pronta:

```bash
node .claude/skills/lp-alto-nivel/scripts/auditar-lp.mjs caminho/da/pagina.html
```

Ele sai com código 1 se alguma regra de composição falhar, o que permite usá-lo como condição de parada de um loop.

**Este é o loop, e ele não é opcional:** rode o auditor, leia as falhas, corrija a página, rode de novo. Repita até sair com código 0. Só então passe para a verificação de cor e para o checklist.

Duas coisas que fazem esse ciclo degenerar e que precisam ser evitadas conscientemente:

- **Corrigir a marcação em vez do design.** Trocar um `data-tratamento` para escapar da R11 faz o auditor passar e a página continuar igual. Se a marcação estava certa, o que muda é a página.
- **Parar na primeira passada verde sem olhar a página.** O auditor mede composição, não qualidade. Uma página pode passar nas doze regras e ainda assim estar feia — ele elimina o erro estrutural, não substitui o olho.

**Não entregue com falha em aberto.** Se uma regra não faz sentido para esse caso específico, diga isso ao usuário com o motivo, em vez de ignorar em silêncio.

Depois da auditoria automática, percorra `references/checklist-entrega.md`, que cobre o que o script não alcança (briefing, acessibilidade, conversão).

## O objetivo por trás de todas as regras

Antes das regras, o critério que as justifica: **a página precisa ser prazerosa de rolar.**

Não "correta", não "completa" — prazerosa. A pessoa deve poder subir e descer a página e continuar tendo vontade de olhar. Toda regra abaixo existe a serviço disso, e nenhuma delas vale se o resultado ficar pior nesse quesito.

Isso muda a pergunta que se faz ao terminar uma seção. Não é "está bom?" — é **"a próxima seção vai dar um estímulo diferente da anterior?"** Quando a resposta é não, o trabalho ainda não acabou, mesmo que tudo esteja tecnicamente certo.

## Regras de composição

O auditor verifica estas. Elas existem para quebrar a monotonia estrutural — cada uma ataca um vício específico.

**As duas últimas seções da página são avaliadas com menos rigor** (R6, R7 e R11 as ignoram). Perto do fim, a pessoa já decidiu se vai converter ou não, e simplicidade ali funciona melhor que invenção: um FAQ com fundo cinza chapado e um CTA laranja chapado estão certos, porque a página está terminando. O esforço de variação pertence ao miolo.

**R1 — Nenhum arquétipo em duas seções consecutivas.**
Repetição adjacente é o que o olho detecta primeiro e o que mais rápido gera desinteresse.

**R2 — Nenhum arquétipo mais de duas vezes na página.**
Mesmo espaçada, a terceira repetição já denuncia que a estrutura é um molde.

**R3 — No máximo um `card-grid` uniforme.**
O card é uma ferramenta legítima para itens realmente paralelos e independentes. O problema nunca foi o card — foi a **grade uniforme**: seis retângulos idênticos, mesmo tamanho, mesma cor, mesmo tratamento.

Uma grade com variação interna real é outra coisa, e não conta para este limite. Marque com `data-variacao="interna"` quando os cards diferirem de verdade entre si: um escuro com foto ao lado de um escuro sem foto, um ocupando duas colunas, um na cor de destaque. A variação precisa ser visível de longe — trocar o ícone não é variação.

Uma grade uniforme por página é o suficiente para provar que foi escolha, não default.

**R4 — Cabeçalho padrão (chapéu + título + subtítulo) no máximo duas vezes.**
As outras seções precisam entrar de outro jeito: direto no visual, com uma pergunta, com um número, com uma frase solta em corpo grande, sem título nenhum. Isso sozinho já muda a percepção da página inteira.

**R5 — Ao menos uma seção `faixa-full-bleed` a cada quatro.**
Página inteira na mesma largura contida lê como documento, não como site.

**R6 — O ritmo tonal precisa ser irregular.**
Repare que esta regra **não pede alternância** — e a distinção é o ponto todo.

O reflexo, ao ouvir "varie o tom", é fazer claro-escuro-claro-escuro. Mas alternância perfeita é um padrão como qualquer outro: o olho decodifica `CECECECE` tão rápido quanto decodifica `CCCCCCCC`, e a partir daí a página volta a ser previsível. Trocar um passo por dois passos não resolve o problema, só o adia.

O que se mede é a irregularidade das corridas. Três seções claras, depois uma escura, depois duas claras, depois uma na cor de destaque — `3-1-2-1` — tem respiração. `1-1-1-1` não tem. O auditor reprova quando todas as corridas têm o mesmo tamanho, e também quando alguma passa de quatro seções.

Atenção ao que está sendo medido: é o **tom percebido**, não o CSS da seção. Cinco seções com fundo claro seguidas estão corretas se três delas forem dominadas por um bloco escuro ou colorido contido. O olho lê o bloco, não a tag.

**R12 — A forma da divisa também precisa variar.**
Complemento direto da R6: não basta variar *quando* o tom muda, é preciso variar *como* ele muda. Uma página em que toda transição é a mesma linha reta horizontal tem ritmo, mas não tem repertório.

Declare com `data-divisa`: `reta` | `inclinada` | `curva` | `sobreposta` | `recorte`. Quando houver três ou mais mudanças de tom, ao menos uma precisa usar divisa personalizada. É barato de implementar — um `clip-path` resolve — e é uma das diferenças mais visíveis entre uma página montada e uma página desenhada.

Isso importa especialmente quando a página cresce e passa a exigir mais peso escuro para manter a proporção da R10. A saída preguiçosa é acrescentar mais um retângulo preto de borda a borda; a saída boa é acrescentar a seção **e** entrar nela por uma diagonal.

**R7 — No máximo duas seções `faixa-full-bleed` com tom `escuro` ou `cor`.**
Esta é a regra que impede o vício de "a seção precisa de peso, então pinto a faixa inteira". Tipicamente o orçamento é: uma seção de peso no meio da página, mais o rodapé. Todo o resto do peso escuro deve vir de **blocos contidos** — que criam forma, aceitam sombra e preservam o neutro base ao redor. Ver `references/ritmo-e-composicao.md`.

**R8 — Ao menos seis arquétipos distintos em páginas com oito ou mais seções.**
Mede variedade real, não só ausência de repetição adjacente.

**R9 — Ao menos duas seções com `data-ancora="visual"`.**
Ícone de biblioteca não conta como âncora — é o disfarce mais comum de página sem imagem, e todo mundo reconhece.

**R10 — Proporção de cor na ordem de 70/30/10, medida por área.**
Aproximadamente 70% de neutro base, 30% de tom oposto, 10% de cor de destaque — **orientação, não aritmética**. Ninguém deve perseguir os números exatos; uma página real medida como referência deu 78/12/6 e está correta. O que a regra protege é a ordem de grandeza: base dominante, oposto presente o suficiente para criar peso, destaque escasso o suficiente para significar algo.

O uso prático é como orçamento: se a página cresce e o preto some proporcionalmente, isso é sinal de que falta uma seção de peso — não de que algum número precisa bater. Meça com `scripts/medir-paleta.js`; o auditor estático não enxerga cor.

**R11 — Nenhum tratamento visual repetido mais de duas vezes.**
Esta regra existe porque a repetição que mais cansa não é a de arquétipo, é a de **tratamento**: card branco na seção de benefícios, card branco nos depoimentos, card branco no FAQ. Os três arquétipos podem ser diferentes e a página ainda assim parecer a mesma coisa três vezes, porque o olho lê a superfície antes de ler a estrutura.

Declare com `data-tratamento` a superfície dominante da seção: `card-branco`, `card-escuro`, `bloco-cor`, `imagem-fundo`, `texto-puro`, `tabela`, `ilustracao`. Quando duas seções vizinhas na leitura fecharem o mesmo tratamento, troque a do meio — é exatamente o raciocínio que leva uma seção de depoimento a virar bloco laranja com imagem ao fundo, em vez do terceiro card branco da página.

## Como decidir quando as regras conflitam

As regras servem à variedade, e variedade serve à legibilidade — não o contrário. Se cumprir uma regra deixaria a informação mais confusa, a informação ganha. Nesse caso, escolha o arquétipo que comunica melhor e **explique a exceção ao usuário**, com o motivo. Uma exceção justificada é trabalho de design; uma exceção silenciosa é a skill sendo ignorada.

O que nunca é exceção aceitável: usar card-grid repetido porque foi mais rápido de escrever.

## Referências

- `references/arquetipos.md` — os 30 arquétipos, com quando usar, quando não usar e nota de implementação. **Leia antes da Fase 1.**
- `references/ritmo-e-composicao.md` — escala tipográfica, cor, espaçamento, e a lista do que faz uma página "parecer feita por IA"
- `references/movimento.md` — animação com propósito, durações, acessibilidade
- `references/checklist-entrega.md` — checklist final de três camadas (máquina, briefing, padrão visual)
- `scripts/auditar-lp.mjs` — auditor de composição
