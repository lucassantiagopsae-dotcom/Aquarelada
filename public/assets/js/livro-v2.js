(function () {
  "use strict";
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (window.lucide) window.lucide.createIcons();
  var states = [];
  document.querySelectorAll("[data-v2-video]").forEach(function (video) {
    var state = { video: video, inView: false, needsGesture: false };
    states.push(state);
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.controls = false;
    video.removeAttribute("controls");
    function load() {
      var source = video.querySelector("source[data-src]");
      if (!source) return;
      source.src = source.dataset.src;
      source.removeAttribute("data-src");
      video.load();
    }
    function play() {
      load();
      if (!video.paused) return;
      var pending = video.play();
      if (pending) pending.then(function () {
        state.needsGesture = false;
      }).catch(function () {
        state.needsGesture = true;
        video.controls = false;
        video.removeAttribute("controls");
      });
    }
    state.sync = function () {
      video.controls = false;
      video.removeAttribute("controls");
      if (reducedMotion.matches || !state.inView || document.hidden) video.pause();
      else play();
    };
    video.addEventListener("error", function () {
      state.needsGesture = true;
      video.controls = false;
      video.removeAttribute("controls");
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
  function resumeVideosFromGesture() {
    states.forEach(function (state) {
      if (state.inView && !document.hidden && !reducedMotion.matches) state.sync();
    });
  }
  document.addEventListener("pointerdown", resumeVideosFromGesture, { capture: true, passive: true });
  document.addEventListener("touchstart", resumeVideosFromGesture, { capture: true, passive: true });
  document.addEventListener("keydown", resumeVideosFromGesture, true);
  document.addEventListener("visibilitychange", function () { states.forEach(function (state) { state.sync(); }); });
  var rail = document.querySelector(".trilha");
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) { rail.classList.toggle("v2-em-cena", entries[0].isIntersecting); }).observe(rail);
  } else rail.classList.add("v2-em-cena");
  reducedMotion.addEventListener("change", function () {
    states.forEach(function (state) { state.sync(); });
  });
})();
