(function () {
  "use strict";
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
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
  var rail = document.querySelector(".trilha");
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) { rail.classList.toggle("v2-em-cena", entries[0].isIntersecting); }).observe(rail);
  } else rail.classList.add("v2-em-cena");
  reducedMotion.addEventListener("change", function () {
    states.forEach(function (state) { state.sync(); });
  });
})();
