/* Um Dia Diferente, Como Era Antigamente! — comportamento da landing page.
   CTA flutuante, carrossel das brincadeiras e revelação por scroll.
   O hero não depende deste arquivo para aparecer (animação é CSS pura). */

(function () {
  "use strict";

  /* ---- CTA flutuante dependente de estado ----
     Aparece depois que o hero sai de cena; some de novo perto do
     fechamento, onde a página já tem um CTA grande cuidando disso. */
  var ctaFlutuante = document.getElementById("cta-flutuante");
  var fechoDaPagina = document.querySelector(".fechar");
  if (ctaFlutuante) {
    var gatilho = Math.round(window.innerHeight * 0.72);
    var pendente = false;
    var dentroDoFecho = false;

    var atualizar = function () {
      var visivel = window.scrollY > gatilho && !dentroDoFecho;
      ctaFlutuante.classList.toggle("visivel", visivel);
      pendente = false;
    };

    window.addEventListener(
      "scroll",
      function () {
        if (!pendente) {
          pendente = true;
          window.requestAnimationFrame(atualizar);
        }
      },
      { passive: true }
    );

    window.addEventListener("resize", function () {
      gatilho = Math.round(window.innerHeight * 0.72);
      atualizar();
    });

    if (fechoDaPagina && "IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entradas) {
          dentroDoFecho = entradas[0].isIntersecting;
          atualizar();
        },
        { threshold: 0.15 }
      ).observe(fechoDaPagina);
    }

    atualizar();
  }

  /* ---- carrossel das brincadeiras ----
     No mobile o scroll nativo resolve. No desktop, botões e arraste com mouse
     deixam claro que a faixa continua para os lados. */
  var trilha = document.querySelector(".trilha");
  var trilhaRail = document.querySelector(".trilha__rail");
  if (trilha && trilhaRail) {
    var btnAnterior = trilha.querySelector("[data-trilha-prev]");
    var btnProximo = trilha.querySelector("[data-trilha-next]");
    var inicioX = 0;
    var scrollInicial = 0;
    var arrastando = false;
    var arrastou = false;
    var frameEstado = 0;

    var passoTrilha = function () {
      var primeiroCard = trilhaRail.querySelector(".brincadeira");
      if (!primeiroCard) return Math.round(trilhaRail.clientWidth * 0.82);
      var estilos = window.getComputedStyle(trilhaRail);
      var gap = parseFloat(estilos.columnGap || estilos.gap || "0") || 0;
      return Math.round(primeiroCard.getBoundingClientRect().width + gap);
    };

    var atualizarControles = function () {
      if (!btnAnterior || !btnProximo) return;
      var maxScroll = trilhaRail.scrollWidth - trilhaRail.clientWidth - 2;
      btnAnterior.disabled = trilhaRail.scrollLeft <= 2;
      btnProximo.disabled = trilhaRail.scrollLeft >= maxScroll;
    };

    var agendarEstado = function () {
      if (frameEstado) return;
      frameEstado = window.requestAnimationFrame(function () {
        frameEstado = 0;
        atualizarControles();
      });
    };

    var rolarTrilha = function (direcao) {
      trilhaRail.scrollBy({
        left: direcao * passoTrilha(),
        behavior: "smooth"
      });
    };

    if (btnAnterior) btnAnterior.addEventListener("click", function () { rolarTrilha(-1); });
    if (btnProximo) btnProximo.addEventListener("click", function () { rolarTrilha(1); });

    trilhaRail.addEventListener("scroll", agendarEstado, { passive: true });
    window.addEventListener("resize", agendarEstado);

    trilhaRail.addEventListener("keydown", function (evento) {
      if (evento.key !== "ArrowLeft" && evento.key !== "ArrowRight") return;
      evento.preventDefault();
      rolarTrilha(evento.key === "ArrowRight" ? 1 : -1);
    });

    trilhaRail.addEventListener("dragstart", function (evento) {
      evento.preventDefault();
    });

    trilhaRail.addEventListener("pointerdown", function (evento) {
      if (evento.pointerType === "mouse" && evento.button !== 0) return;
      arrastando = true;
      arrastou = false;
      inicioX = evento.clientX;
      scrollInicial = trilhaRail.scrollLeft;
      trilhaRail.classList.add("arrastando");
      trilhaRail.setPointerCapture(evento.pointerId);
    });

    trilhaRail.addEventListener("pointermove", function (evento) {
      if (!arrastando) return;
      var delta = evento.clientX - inicioX;
      if (Math.abs(delta) > 4) arrastou = true;
      trilhaRail.scrollLeft = scrollInicial - delta;
    });

    var encerrarArraste = function (evento) {
      if (!arrastando) return;
      var destino = scrollInicial - (evento.clientX - inicioX);
      arrastando = false;
      if (arrastou) trilhaRail.scrollLeft = destino;
      if (trilhaRail.hasPointerCapture(evento.pointerId)) {
        trilhaRail.releasePointerCapture(evento.pointerId);
      }
      window.requestAnimationFrame(function () {
        trilhaRail.classList.remove("arrastando");
        if (arrastou) agendarEstado();
      });
    };

    trilhaRail.addEventListener("pointerup", encerrarArraste);
    trilhaRail.addEventListener("pointercancel", encerrarArraste);
    trilhaRail.addEventListener("lostpointercapture", function () {
      arrastando = false;
      trilhaRail.classList.remove("arrastando");
    });

    atualizarControles();
  }

  /* ---- revelação por scroll ----
     Um único tipo de entrada em toda a página: subir 18px com fade. */
  var alvos = document.querySelectorAll(".reveal");
  if (!alvos.length) return;

  var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduzido || !("IntersectionObserver" in window)) {
    for (var i = 0; i < alvos.length; i++) alvos[i].classList.add("visivel");
    return;
  }

  var observador = new IntersectionObserver(
    function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add("visivel");
        observador.unobserve(entrada.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
  );

  /* Escalonamento sutil entre irmãos: 60ms, dentro da faixa recomendada. */
  var porSecao = {};
  Array.prototype.forEach.call(alvos, function (el) {
    var secao = el.closest("section, footer");
    var chave = secao ? (secao.className || "raiz") : "raiz";
    porSecao[chave] = (porSecao[chave] || 0) + 1;
    var indice = Math.min(porSecao[chave] - 1, 5);
    el.style.transitionDelay = indice * 60 + "ms";

    /* Já está na tela no carregamento (inclusive em janelas muito altas):
       revela na hora, sem depender do observer disparar. */
    if (el.getBoundingClientRect().top < window.innerHeight) {
      el.classList.add("visivel");
      return;
    }
    observador.observe(el);
  });

  /* Rede de segurança: se por qualquer motivo o observer não disparar para
     algum elemento, ele reaparece em vez de ficar invisível para sempre.
     Conteúdo escondido por falha de script é pior que conteúdo sem animação. */
  window.addEventListener("load", function () {
    window.setTimeout(function () {
      Array.prototype.forEach.call(alvos, function (el) {
        el.classList.add("visivel");
      });
    }, 2500);
  });
})();
