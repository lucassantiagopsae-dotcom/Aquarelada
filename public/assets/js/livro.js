/* Um Dia Diferente, Como Era Antigamente! — comportamento da landing page.
   Dois trabalhos apenas: estado do cabeçalho e revelação por scroll.
   O hero não depende deste arquivo para aparecer (animação é CSS pura). */

(function () {
  "use strict";

  /* ---- cabeçalho dependente de estado ----
     Transparente sobre o hero; sólido e com CTA depois que ele sai de cena. */
  var cabecalho = document.getElementById("cabecalho");
  if (cabecalho) {
    var gatilho = Math.round(window.innerHeight * 0.72);
    var pendente = false;

    var atualizar = function () {
      cabecalho.classList.toggle("rolado", window.scrollY > gatilho);
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

    atualizar();
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
