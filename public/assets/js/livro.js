/* Um Dia Diferente, Como Era Antigamente! — comportamento da landing page.
   CTA flutuante, carrossel das brincadeiras e revelação por scroll.
   O hero não depende deste arquivo para aparecer (animação é CSS pura). */

(function () {
  "use strict";

  function metaText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function initAmazonLeadClicks() {
    document.addEventListener("click", function (evento) {
      if (!evento.target || !evento.target.closest) return;
      var link = evento.target.closest("[data-meta-event]");
      if (!link) return;
      var eventName = link.getAttribute("data-meta-event") || "Lead";
      var contentName = link.getAttribute("data-meta-content-name") || document.title;
      var buttonLabel = metaText(link.getAttribute("data-meta-button-label") || link.textContent).slice(0, 120);
      var leadForm = link.getAttribute("data-meta-lead-form") || "amazon-click";

      if (window.fbq) {
        window.fbq("track", eventName, {
          content_name: contentName,
          content_category: "livro",
          lead_form: leadForm,
          click_type: "amazon",
          button_label: buttonLabel
        });
      }
    }, true);
  }

  initAmazonLeadClicks();

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

  /* ---- vídeo decorativo, carregado só quando faz falta ----
     O <source> nasce com data-src, então o navegador não baixa nada no
     carregamento inicial. O arquivo só entra quando a seção chega perto
     da tela, e o vídeo pausa quando sai — não adianta gastar bateria
     rodando um loop que ninguém está vendo. */
  var videos = document.querySelectorAll("[data-video-preguicoso]");
  if (videos.length) {
    var carregar = function (video) {
      if (video.dataset.carregado) return;
      video.dataset.carregado = "1";
      var fontes = video.querySelectorAll("source[data-src]");
      for (var f = 0; f < fontes.length; f++) {
        fontes[f].src = fontes[f].dataset.src;
        fontes[f].removeAttribute("data-src");
      }
      video.load();
    };

    var tocar = function (video) {
      var tentativa = video.play();
      /* autoplay bloqueado não é erro nosso: o poster continua no lugar */
      if (tentativa && tentativa.catch) tentativa.catch(function () {});
    };

    if ("IntersectionObserver" in window) {
      var observadorVideo = new IntersectionObserver(
        function (entradas) {
          entradas.forEach(function (entrada) {
            var video = entrada.target;
            if (entrada.isIntersecting) {
              carregar(video);
              tocar(video);
            } else if (!video.paused) {
              video.pause();
            }
          });
        },
        { rootMargin: "200px 0px" }
      );
      for (var v = 0; v < videos.length; v++) observadorVideo.observe(videos[v]);
    } else {
      for (var w = 0; w < videos.length; w++) {
        carregar(videos[w]);
        tocar(videos[w]);
      }
    }
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
