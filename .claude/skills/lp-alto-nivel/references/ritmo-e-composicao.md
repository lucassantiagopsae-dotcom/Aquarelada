# Ritmo, cor e composição

## Índice
- [Cor: a regra 70/30/10](#cor-a-regra-703010)
- [Faixa vs. bloco contido](#faixa-vs-bloco-contido)
- [Tipografia](#tipografia)
- [Espaçamento](#espacamento)
- [Forma e profundidade](#forma-e-profundidade)
- [Divisas entre seções](#divisas-entre-secoes)
- [Variação dentro de uma mesma grade](#variacao-dentro-de-uma-mesma-grade)
- [Layout dependente de estado](#layout-dependente-de-estado)
- [O que faz uma página "parecer feita por IA"](#o-que-faz-uma-pagina-parecer-feita-por-ia)

---

## Cor: a regra 70/30/10

Aproximadamente **70% neutro base, 30% tom oposto, 10% cor de destaque** — medido por **área ocupada na página inteira**, não por contagem de seções.

O vício que essa regra corrige: alternar branco puro com cinza levíssimo do começo ao fim. Não está errado tecnicamente — os dois tons até criam alguma separação. O problema é a monotonia: quando o único recurso tonal da página é "claro" e "um pouquinho menos claro", nenhuma seção consegue ter mais peso que outra. Tudo fica no mesmo plano, e a página não tem clímax.

Os 30% de tom oposto existem justamente para criar esse contraste de peso. Sem eles, os 10% de destaque também não funcionam, porque destaque precisa de algo escuro contra o que brilhar.

### Escolhendo os tons

**Neutro base — evite branco puro.** `#FFFFFF` lê como interface e documento. Um off-white levemente quente (marfim, `#FBFAF7`) ou levemente frio dá acabamento imediato e não custa nada. Branco puro fica reservado para os blocos que precisam saltar sobre o base.

**Tom oposto — evite preto puro.** `#000000` é duro e achata a sombra. Um grafite (`#0A0C10`, `#101319`) tem mais profundidade.

**Destaque — uma cor só.** Ela marca o que é clicável e o que é o ponto de cada seção. Se aparecer em decoração, perde a função de sinalizar. Duas cores de destaque quase sempre significam que nenhuma das duas está funcionando.

### Medindo de verdade

A proporção é fácil de estimar errado no olho, porque seções escuras costumam ser mais curtas que as claras. Meça:

```bash
node scripts/medir-paleta.js https://url-da-pagina
```

Ou cole `scripts/medir-paleta.js` no console do navegador. Ele retorna a distribuição real por área de pixel.

Uma distribuição saudável de exemplo, medida numa página real de referência:

| Faixa | Cores | Área |
|---|---|---|
| Base | marfim + branco + areia | 78% |
| Oposto | grafite | 13% |
| Destaque | laranja | 6% |

Note que não bate exatamente 70/30/10 — a regra é uma proporção alvo, não uma meta a perseguir. O que importa é a ordem de grandeza: base dominante, oposto presente o suficiente para dar peso, destaque escasso o suficiente para significar algo.

---

## Faixa vs. bloco contido

Esta é uma das decisões mais subestimadas na construção de uma página, e a que mais rapidamente eleva o resultado.

Quando uma seção precisa de peso escuro ou colorido, existem duas formas de dar esse peso:

**Faixa full-bleed** — a seção inteira recebe o fundo escuro, de borda a borda.

**Bloco contido** — a seção continua com o fundo claro, e dentro dela um bloco escuro com raio de canto ocupa a área do conteúdo.

O instinto é sempre o primeiro, porque é uma linha de CSS. Mas o segundo é quase sempre mais interessante, por quatro razões concretas:

1. **Cria forma, não faixa.** Um bloco com canto arredondado tem contorno — o olho o reconhece como objeto. Uma faixa não tem contorno, só limite superior e inferior. Objetos prendem atenção; faixas são atravessadas.
2. **Preserva o neutro base.** O marfim continua envolvendo o bloco, então os 70% não são consumidos e a identidade tonal da página se mantém.
3. **Aceita sombra.** Bloco contido pode ter elevação e parecer estar *sobre* a página. Faixa full-bleed é sempre plana — não existe sombra possível quando não há borda.
4. **Permite transbordo.** Um elemento pode escapar do bloco e invadir a área clara — imagem cortada pela borda, badge flutuante sobreposto, número que ultrapassa. Isso cria profundidade em camadas, e é impossível numa faixa.

**Orçamento prático:** no máximo duas faixas full-bleed escuras ou coloridas na página (tipicamente uma seção de peso no meio + o rodapé). Todo o resto do peso vem de blocos contidos. Isso é a regra R7 do SKILL.md.

**Outras formas de dar peso sem pintar a faixa inteira:**
- Bloco contido ocupando 100% da altura da seção e ~85% da largura
- Bloco sangrando por um lado só (encosta na borda direita, respira à esquerda)
- Bloco escuro atrás de conteúdo claro, deslocado alguns pixels — cria camada
- Divisão diagonal ou curva entre dois tons (`clip-path`), em vez de linha reta
- Faixa full-bleed que ocupa só metade da altura da seção, com o conteúdo cavalgando a divisa

---

## Tipografia

**Duas famílias no máximo.** Uma de display (títulos) e uma de texto. Uma família só também funciona bem se ela tiver bons pesos.

**Três pesos no máximo por família.** Mais que isso vira ruído sem hierarquia.

**O salto entre níveis precisa ser grande.** Este é o erro de escala mais comum: h1 em 40px e h2 em 32px. A razão de 1,25x não cria hierarquia — cria a sensação de que alguém errou o tamanho. Use razão de **1,5x a 2x entre níveis de display**.

Uma escala real de referência, de uma página que funciona:

```
Display:  112px → 72px → 36px → 24px → 20px    (razões: 1,55 · 2,0 · 1,5 · 1,2)
Texto:     18px → 16px → 14px → 12px
```

Repare no salto de 112 para 72 no topo. É desconfortável de escrever e é exatamente por isso que funciona.

**Coragem de escala no hero.** Se o título principal não parecer grande demais enquanto você escreve, ele vai parecer pequeno demais quando a pessoa abrir. Referências de alto nível usam 96-140px em desktop sem hesitar.

**Medida de linha.** Texto corrido entre 60 e 75 caracteres por linha. Parágrafo ocupando 1200px de largura é ilegível e denuncia falta de cuidado.

**Altura de linha inversa ao tamanho.** Título gigante pede 0,95-1,05. Texto corrido pede 1,5-1,7. Aplicar 1,5 num título de 112px arruína o bloco.

---

## Espaçamento

**Use uma escala, não números soltos.** Base de 4px ou 8px: 8, 16, 24, 32, 48, 64, 96, 128, 160.

**Espaço vertical entre seções é maior que o instinto pede.** 96-160px em desktop. Seção colada em seção é a causa mais comum da sensação de "página apertada", e é grátis de corrigir.

**Espaço agrupa.** Elementos relacionados ficam próximos; grupos diferentes ficam distantes. Quando tudo tem o mesmo espaçamento, o leitor não consegue perceber estrutura — e a página parece uma lista, não uma composição.

**Assimetria é uma ferramenta.** Divisão 50/50 é o default preguiçoso. 60/40, 45/55 ou 70/30 criam tensão e direcionam o olho. Vale para heros, splits e bentos.

---

## Forma e profundidade

**Raio de canto consistente.** Escolha 2-3 valores e use só eles (ex.: 16px para cards, 24-28px para blocos grandes, pill para botões). Raios variando sem critério é um dos sinais mais rápidos de página montada às pressas.

**Sombra colorida, não preta.** Um botão laranja com sombra laranja translúcida (`shadow-laranja/25`) parece iluminado; com sombra preta parece sujo. A sombra deve puxar o matiz do elemento ou do fundo. Detalhe pequeno, diferença grande.

**Camadas criam profundidade.** Elementos que se sobrepõem — badge flutuando sobre a imagem, cartão invadindo a borda do bloco, número atrás do texto — dão dimensão que nenhuma quantidade de gradiente consegue dar.

**Transbordo intencional.** Deixar algo ser cortado pela borda da tela ou do bloco sugere que existe mais, e cria vontade de rolar.

---

## Divisas entre seções

A transição entre duas seções é uma decisão de design, e quase sempre é tratada como se não fosse. O default — linha reta horizontal, borda a borda — é invisível de tão comum, e usá-lo em toda a página é o que faz o conjunto parecer um documento empilhado em vez de uma composição.

Não se trata de personalizar todas: uma página com seis divisas diagonais fica cansativa por outro motivo. Uma ou duas, nos pontos de virada, já mudam a leitura inteira.

**Diagonal** — `clip-path: polygon(0 0, 100% 0, 100% 100%, 0 calc(100% - 80px))`. A mais versátil. Funciona melhor quando o ângulo é sutil (60-100px de queda numa tela de 1440px); ângulos agressivos envelhecem rápido.

**Curva** — um SVG de onda posicionado na borda, ou `border-radius` grande no topo do bloco seguinte. Combina com marcas de tom mais suave.

**Sobreposta** — a seção seguinte sobe e invade a anterior, geralmente com um cartão ou imagem cavalgando a divisa. Cria profundidade e é a mais fácil de acertar.

**Recorte** — o bloco seguinte tem cantos arredondados grandes e "flutua" sobre o anterior, deixando a cor de baixo aparecer nas laterais.

**Nenhuma** — dois blocos da mesma cor separados só por espaço. Também é uma escolha legítima, e a mais adequada quando as duas seções são conceitualmente contínuas.

Quando a página cresce e passa a pedir mais peso escuro para manter a proporção, o instinto é acrescentar mais um retângulo preto de borda a borda. A alternativa melhor é acrescentar a seção **e** entrar nela por uma diagonal — o custo é uma linha de CSS e o ganho é alto.

## Variação dentro de uma mesma grade

Uma grade de cards não precisa ter cards iguais. Essa é a saída mais rápida quando o conteúdo realmente pede uma grade mas a página não aguenta mais uma superfície uniforme.

Formas de variar que funcionam:
- Um card ocupando duas colunas ou duas linhas
- Um card na cor de destaque, o resto neutro
- Dois cards escuros, mas um com foto e o outro só com texto
- Um card com altura maior, quebrando o alinhamento da base
- Um card sem borda, "vazado", entre cards sólidos

A variação precisa ser perceptível de longe, com a página desfocada. Trocar o ícone ou a cor do rótulo não é variação — é o mesmo card seis vezes com detalhes diferentes.

## Layout dependente de estado

Um recurso subutilizado: o layout não precisa ser o mesmo o tempo todo. O caso mais útil é o cabeçalho.

No topo da página, quando o hero ocupa a tela, um cabeçalho com fundo sólido corta a composição — a "barra gigante" que estraga a primeira impressão. A solução é deixá-lo transparente e **deslocar a navegação** para onde ela não colide com o conteúdo do hero. Se o visual do hero está à direita, a navegação vai para a esquerda, próxima ao logo.

Depois que a pessoa rola, o contexto muda: não há mais hero para preservar, e agora a navegação precisa de legibilidade sobre conteúdo variado. Aí entra o fundo sólido ou translúcido, e a navegação pode voltar ao centro.

Numa página real medida como referência, esse deslocamento era de 326px à esquerda do centro no topo, com o cabeçalho transparente. Não é um efeito — é uma resposta a um problema de composição concreto, e é por isso que funciona.

A mesma lógica vale para outros elementos: um CTA flutuante que só aparece depois da primeira seção, um índice lateral que surge quando o conteúdo longo começa, um botão que muda de tamanho ao sair da dobra.

## O que faz uma página "parecer feita por IA"

Lista de sinais concretos. A presença de qualquer um deles é motivo para refazer aquela parte.

**Cor e fundo**
- Gradiente roxo-para-azul em qualquer lugar
- Alternância branco / cinza-clarinho do topo ao rodapé, sem nenhum tom pesado
- Mais de uma cor de destaque
- Branco puro como base e preto puro como oposto
- Vidro fosco (glassmorphism) aplicado sem motivo
- Sombra preta genérica em tudo

**Estrutura**
- Todo bloco abrindo com chapéu + título + subtítulo
- Grade de cards repetida em três ou mais seções
- Três cards com ícone circular, título e duas linhas de texto (o formato mais reconhecível de todos)
- Todas as seções na mesma largura contida
- Todas as seções com o mesmo espaçamento vertical
- Divisões sempre em linha reta horizontal
- Alternância perfeita claro-escuro-claro-escuro do começo ao fim
- Cabeçalho com barra sólida desde o topo, cortando o hero

**Conteúdo visual**
- Ícone de biblioteca como única âncora visual da seção
- Emoji usado como ícone
- Foto de banco de imagem de pessoas sorrindo em escritório
- Nenhuma ilustração, diagrama ou imagem de produto real na página inteira

**Texto**
- "Transforme sua [coisa] com nossa solução inovadora"
- "Descubra o poder de…"
- Benefícios genéricos que serviriam para qualquer empresa de qualquer setor
- Depoimentos sem nome, empresa ou número
- Três colunas de texto de exatamente o mesmo comprimento

O teste rápido: **se você trocar o logo e o nome do produto, a página serve para outra empresa?** Se serve, ela ainda não é dessa empresa.
