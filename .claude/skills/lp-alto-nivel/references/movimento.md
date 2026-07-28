# Movimento

Animação é o recurso mais fácil de exagerar e o que mais rápido denuncia amadorismo quando exagerado. A régua é simples: **movimento que revela informação ou dá retorno a uma ação é design; movimento que só enfeita é ruído.**

## O princípio

Toda animação deve responder a uma destas perguntas:

- **O que aconteceu?** (feedback: botão pressionado, campo validado, item adicionado)
- **De onde isso veio / para onde foi?** (continuidade: modal abrindo a partir do botão, item saindo da lista)
- **O que eu deveria olhar agora?** (direção de atenção: um número contando, um elemento entrando quando entra em cena)

Se nenhuma das três se aplica, corte.

## Regras práticas

**Um só tipo de animação de entrada na página inteira.** Escolha um — subir com fade, ou fade puro, ou revelar por máscara — e use o mesmo em tudo. Cada seção entrando de um jeito diferente é o erro mais comum e o mais visível: transforma a página num carnaval sem hierarquia.

**Um momento "wow" por página, no máximo dois.** Um scrollytelling, uma transformação, um elemento manipulável. É a exceção que impressiona porque é exceção. Cinco momentos wow anulam uns aos outros e viram cansaço.

**Nada anima acima da dobra antes do conteúdo ser lido.** O hero pode ter movimento sutil, mas o título não deve fazer a pessoa esperar para ler. Atrasar a informação principal por causa de uma animação é sempre uma troca ruim.

**Deslocamento curto.** Entrada com 8-24px de deslocamento. Elemento vindo de 100px abaixo parece software de apresentação dos anos 2000.

**Escalonamento sutil.** Ao animar uma lista, 40-80ms entre itens. Mais que isso e o último item chega quando a pessoa já desistiu.

## Durações

| Tipo | Duração |
|---|---|
| Micro-interação (hover, clique, foco) | 120-200ms |
| Entrada de elemento | 350-550ms |
| Transição de seção ou página | 400-700ms |
| Nunca ultrapassar | 800ms |

**Curvas:** entrada com `ease-out` (rápido no começo, desacelerando — parece que o elemento chega). Saída com `ease-in`. `linear` só para movimento contínuo, como marquee. Evite `ease-in-out` em entradas: dá sensação de lentidão.

## Acessibilidade — não é opcional

Movimento pode causar desconforto real, incluindo náusea, em pessoas com sensibilidade vestibular. Respeitar a preferência do sistema é o mínimo:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Coloque isso na folha de estilo desde o início — depois vira dívida que ninguém paga.

## Desempenho

Anime apenas `transform` e `opacity`. São as duas propriedades que a GPU resolve sem recalcular layout. Animar `width`, `height`, `top`, `left`, `margin` ou `box-shadow` provoca reflow a cada quadro e trava em celular — que é onde a maior parte do tráfego de landing page está.

Para sombra, anime a opacidade de uma camada pseudo-elemento que já contém a sombra, em vez da `box-shadow` em si.

## Movimento que quase sempre vale a pena

- **Revelar por scroll**, sutil e uniforme, com o mesmo tipo em toda a página
- **Hover com intenção** em elementos clicáveis: elevação pequena, mudança de cor, seta que avança 2-4px
- **Contador animado** num `numero-gigante`, disparado quando entra em cena
- **Marquee contínuo** numa `faixa-marquee` — é o único caso em que loop infinito é adequado
- **Transição de estado em acordeão**, com altura animada via `grid-template-rows` ou `max-height`

## Movimento que quase nunca vale

- Parallax de fundo (raramente fica bom, sempre custa desempenho)
- Texto entrando letra por letra fora de um hero deliberadamente autoral
- Rotação contínua de elementos decorativos
- Elementos que se movem sozinhos sem relação com scroll ou ação
- Carrossel com avanço automático — remove o controle da pessoa e é ignorado
