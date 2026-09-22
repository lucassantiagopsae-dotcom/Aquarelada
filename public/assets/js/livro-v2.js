(function () {
  "use strict";
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  function icon(button, name) {
    button.replaceChildren();
    var marker = document.createElement("span");
    marker.setAttribute("data-lucide", name);
    marker.setAttribute("aria-hidden", "true");
    button.append(marker);
    if (window.lucide) window.lucide.createIcons();
    else marker.textContent = name === "pause" ? "\u23f8" : "\u25b6";
  }
  if (window.lucide) window.lucide.createIcons();
  var states = [];
  document.querySelectorAll("[data-v2-video]").forEach(function (video) {
    var state = { video: video, inView: false, autoplayFailed: false };
    states.push(state);
    function load() {
      var source = video.querySelector("source[data-src]");
      if (!source) return;
      source.src = source.dataset.src;
      source.removeAttribute("data-src");
      video.load();
    }
    function play() {
      load();
      var pending = video.play();
      if (pending) pending.catch(function () {
        state.autoplayFailed = true;
        video.controls = true;
      });
    }
    state.sync = function () {
      video.controls = reducedMotion.matches || state.autoplayFailed;
      if (reducedMotion.matches || !state.inView || document.hidden) video.pause();
      else if (!state.autoplayFailed) play();
    };
    video.addEventListener("error", function () {
      state.autoplayFailed = true;
      video.controls = true;
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        state.inView = entries[0].isIntersecting;
        state.sync();
      }, { threshold: 0.2 }).observe(video);
    } else {
      state.inView = true;
      state.sync();
    }
  });
  document.addEventListener("visibilitychange", function () { states.forEach(function (state) { state.sync(); }); });
  var motionButton = document.querySelector("[data-motion-toggle]");
  var rail = document.querySelector(".trilha");
  var motionPaused = reducedMotion.matches;
  function updateMotion() {
    document.body.classList.toggle("movimento-pausado", motionPaused);
    motionButton.hidden = reducedMotion.matches;
    var label = motionPaused ? "Reproduzir animações das brincadeiras" : "Pausar animações das brincadeiras";
    motionButton.setAttribute("aria-label", label);
    motionButton.title = label;
    icon(motionButton, motionPaused ? "play" : "pause");
  }
  motionButton.addEventListener("click", function () { motionPaused = !motionPaused; updateMotion(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) { rail.classList.toggle("v2-em-cena", entries[0].isIntersecting); }).observe(rail);
  } else rail.classList.add("v2-em-cena");
  reducedMotion.addEventListener("change", function () {
    motionPaused = reducedMotion.matches;
    updateMotion();
    states.forEach(function (state) { state.sync(); });
  });
  updateMotion();
})();
