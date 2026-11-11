(function () {
  function play(id) {
    var v = document.getElementById(id);
    if (!v) return;
    document.querySelectorAll(".ffo-film video").forEach(function (o) {
      if (o !== v) {
        try { o.pause(); } catch (e) {}
        var c = o.closest(".ffo-film");
        if (c) c.classList.remove("is-playing");
      }
    });
    var card = v.closest(".ffo-film");
    var p = v.play();
    if (p && p.then) {
      p.then(function () { if (card) card.classList.add("is-playing"); }).catch(function () {});
    } else if (card) {
      card.classList.add("is-playing");
    }
  }
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-play]");
    if (!btn) return;
    e.preventDefault();
    play(btn.getAttribute("data-play"));
  });
  function bind(v) {
    v.addEventListener("play", function () {
      var c = v.closest(".ffo-film");
      if (c) c.classList.add("is-playing");
    });
    v.addEventListener("pause", function () {
      var c = v.closest(".ffo-film");
      if (c) c.classList.remove("is-playing");
    });
    v.addEventListener("ended", function () {
      var c = v.closest(".ffo-film");
      if (c) c.classList.remove("is-playing");
    });
  }
  function boot() {
    document.querySelectorAll(".ffo-film video").forEach(bind);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
