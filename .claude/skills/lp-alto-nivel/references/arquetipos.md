# Vocabulário de arquétipos de seção

Trinta formas de apresentar informação numa página. O nome na primeira coluna é o valor exato de `data-arquetipo`.

A regra de ouro ao escolher: **o arquétipo deve vir da natureza do conteúdo, não da conveniência de implementação.** Se você escolheu porque é mais rápido de codar, escolheu errado.

## Índice
- [Abertura](#abertura)
- [Explicar e ensinar](#explicar-e-ensinar)
- [Comparar](#comparar)
- [Enumerar](#enumerar)
- [Provar](#provar)
- [Converter e fechar](#converter-e-fechar)
- [Respiro e transição](#respiro-e-transicao)

---

## Abertura

### `hero-split`
Texto de um lado, visual do outro. O cavalo de batalha — funciona quase sempre, e é justamente por isso que não deve ser automático.
**Use quando:** há um visual forte (produto, foto, ilustração) e a proposta precisa de 2-3 linhas de texto.
**Evite quando:** o visual disponível é fraco. Um hero-split com foto de banco de imagem genérica é pior que um hero tipográfico.
**Nota:** a assimetria importa. 50/50 é o default preguiçoso; 60/40 ou 45/55 dá tensão.

### `hero-full-bleed`
Imagem ou vídeo cobrindo a tela, texto sobreposto.
**Use quando:** existe uma imagem realmente boa, e a emoção importa mais que a informação.
**Evite quando:** o contraste do texto sobre a imagem não fecha sem uma camada escura pesada — o resultado é sempre sujo.

### `hero-tipografico`
Tipografia enorme, pouco ou nenhum visual. A frase é o design.
**Use quando:** a proposta de valor é uma frase forte, ou não há material visual bom disponível.
**Nota:** exige coragem de escala. Se o título não estiver desconfortavelmente grande, não funciona.

### `hero-produto-flutuante`
Texto centrado, produto/mockup "flutuando" logo abaixo, muitas vezes cortado pela borda inferior.
**Use quando:** o produto é visual (app, software, livro, objeto) e mostrar já é argumento.
**Nota:** o corte na borda é o que cria a vontade de rolar.

### `hero-interativo`
Um elemento manipulável já na primeira tela: slider, toggle, calculadora, campo que responde.
**Use quando:** a interação demonstra o valor melhor do que a descrição.
**Evite quando:** for interação decorativa — aí só atrasa a leitura.

---

## Explicar e ensinar

### `stepper-numerado`
Passos numerados, horizontais ou em zigue-zague. Ordem visível.
**Use quando:** o conteúdo é um processo de 3 a 5 etapas.
**Substitui:** card-grid, sempre que houver sequência. Se você numerou os cards, o arquétipo certo era esse.

### `timeline-vertical`
Cronologia com eixo visível.
**Use quando:** há tempo envolvido — história da marca, jornada do cliente, antes/durante/depois.

### `diagrama-anotado`
Uma ilustração, screenshot ou foto com rótulos apontando para partes específicas.
**Use quando:** é preciso explicar como algo funciona ou do que é feito.
**Nota:** é o arquétipo mais subutilizado e um dos que mais eleva a percepção de qualidade, porque exige entender o conteúdo de verdade. Vale o trabalho.

### `split-sticky`
Visual fixo de um lado enquanto o texto rola do outro; o visual troca conforme a seção ativa.
**Use quando:** há 3-5 pontos que se referem ao mesmo objeto visto de ângulos diferentes.

### `scrollytelling`
O visual se transforma conforme o scroll avança.
**Use quando:** a transformação em si é a mensagem.
**Custo:** alto de implementar e fácil de errar. Um por página, no máximo.

### `zigue-zague`
Blocos alternando texto-visual, visual-texto.
**Use quando:** há 3-4 recursos que merecem cada um sua própria imagem.
**Cuidado:** é o segundo vício mais comum depois do card. Alternar lado não é variedade estrutural — quatro blocos de zigue-zague seguidos ainda são quatro blocos iguais. Quebre o ritmo no meio.

---

## Comparar

### `comparacao-lado-a-lado`
Duas colunas confrontadas: antes/depois, com/sem, nós/eles.
**Use quando:** a mensagem é uma diferença.
**Nota:** o lado indesejado deve ser visualmente apagado (dessaturado, menor, sem cor de destaque). Se os dois lados têm o mesmo peso, a comparação não comunica.

### `tabela-comparativa`
Matriz de linhas e colunas.
**Use quando:** são muitos critérios e o leitor está em modo de decisão.
**Nota:** tabela bem tipografada é elegante. O erro é tratá-la como dado bruto — merece o mesmo cuidado de espaçamento e hierarquia que o resto da página.

### `slider-antes-depois`
Divisória arrastável revelando duas versões da mesma imagem.
**Use quando:** o resultado é visual e a diferença é óbvia ao olho.

---

## Enumerar

### `bento-assimetrico`
Grade de células de tamanhos diferentes, com uma ou duas dominantes.
**Use quando:** há 4-8 itens de importância desigual.
**Por que preferir ao card-grid:** a assimetria já embute hierarquia. O leitor sabe por onde começar. Numa grade uniforme, ele não sabe — e não escolhe.

### `card-grid`
Grade uniforme. **Máximo uma vez por página.**
**Use quando:** os itens são de fato paralelos, independentes e de mesma importância — e são 3 a 6.
**Sinal de que está errado:** você numerou os cards (era stepper), os cards têm tamanhos de texto muito diferentes (era bento), ou existem mais de oito (era scroll-horizontal ou mosaico).

### `lista-editorial`
Lista numerada com tratamento de revista: número grande, texto forte, filete separando.
**Use quando:** há itens com peso de argumento, que merecem ser lidos e não escaneados.
**Nota:** alternativa direta e mais sofisticada ao card-grid, e muito mais barata de implementar bem.

### `scroll-horizontal`
Faixa que rola lateralmente.
**Use quando:** há muitos itens homogêneos (portfólio, catálogo, depoimentos) e a completude não é obrigatória.
**Sempre:** deixe visível que há mais conteúdo à direita — item cortado na borda, ou indicador.

### `mosaico`
Masonry de imagens em alturas variadas.
**Use quando:** o conteúdo é essencialmente visual e a quantidade impressiona.

---

## Provar

### `numero-gigante`
Uma estatística ocupando escala tipográfica máxima, com legenda curta.
**Use quando:** existe um número que sozinho sustenta o argumento.
**Nota:** um número por seção. Três números grandes lado a lado voltam a ser card-grid disfarçado.

### `depoimento-full-bleed`
Uma citação grande por vez, ocupando a largura toda, com fundo próprio.
**Use quando:** há um depoimento realmente bom e específico.
**Nota:** citação específica ("economizei 6 horas por semana") convence; citação genérica ("adorei, recomendo") ocupa espaço e reduz a credibilidade da página.

### `mural-depoimentos`
Muitas citações curtas em masonry.
**Use quando:** o volume é o argumento — provar que há muita gente satisfeita.

### `logo-wall`
Faixa de logos de clientes, parceiros ou imprensa.
**Use quando:** os nomes têm reconhecimento no público-alvo.
**Nota:** todos em uma cor só (cinza ou a cor do fundo invertida). Logos coloridos misturados destroem a composição.

### `estudo-de-caso`
Um caso concreto: situação, o que foi feito, resultado numérico.
**Use quando:** há um resultado real e verificável para mostrar.
**Nota:** é a prova social mais forte que existe e a mais ignorada. Se o briefing tiver material para um, ele vale por três seções de depoimento.

---

## Converter e fechar

### `cta-full-bleed`
Faixa de cor sólida, uma única ação, nada competindo.
**Use quando:** é o momento de fechar.
**Nota:** o vazio ao redor do botão é o que faz o botão funcionar. Não preencha.

### `formulario-split`
Formulário de um lado, reforço do outro (o que a pessoa recebe, prova, garantia).
**Use quando:** o formulário pede mais de dois campos e precisa de justificativa ao lado.

### `planos-precos`
Comparação de planos.
**Nota:** destaque um plano com peso visual real (elevação, cor, escala), não apenas com uma etiqueta "mais popular".

### `faq-acordeao`
Perguntas expansíveis.
**Use quando:** existem objeções concretas a remover antes da conversão.
**Nota:** a pergunta deve estar escrita como a pessoa realmente pensa, com as palavras dela — não na linguagem da empresa.

### `rodape-editorial`
Rodapé que faz trabalho: última chamada, navegação com hierarquia, personalidade da marca.
**Nota:** é a última impressão. Rodapé de três colunas de links cinza joga fora o efeito de tudo que veio antes.

---

## Respiro e transição

### `faixa-marquee`
Texto ou logos correndo horizontalmente em loop.
**Use quando:** é preciso um respiro entre dois blocos densos, ou para dar energia.
**Nota:** funciona como pontuação visual, não como conteúdo. Não coloque informação importante ali.

### `citacao-solta`
Uma frase da marca, sem atribuição, em corpo grande, isolada com muito espaço.
**Use quando:** é preciso mudar o andamento entre duas seções pesadas.
**Nota:** o mais barato de implementar e um dos mais eficazes para quebrar monotonia. Subutilizado.

### `faixa-imagem`
Uma imagem full-bleed de altura reduzida, sem texto, apenas separando blocos.
**Use quando:** as seções vizinhas são densas de texto e a página precisa respirar.

### `divisor-tipografico`
Uma palavra ou número gigante como divisória de capítulo ("01 — Como funciona").
**Use quando:** a página é longa e se beneficia de estrutura de capítulos.
