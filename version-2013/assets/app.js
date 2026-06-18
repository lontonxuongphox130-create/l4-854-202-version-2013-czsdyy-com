(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle("is-active", pos === index);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle("is-active", pos === index);
      });
    }
    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, pos) {
      dot.addEventListener("click", function () {
        show(pos);
        start();
      });
    });
    start();
  }

  function textMatch(value, needle) {
    return String(value || "").toLowerCase().indexOf(needle) !== -1;
  }

  function initFilters() {
    var panel = document.querySelector(".filter-panel");
    if (!panel) {
      return;
    }
    var search = panel.querySelector("[data-filter='search']");
    var region = panel.querySelector("[data-filter='region']");
    var year = panel.querySelector("[data-filter='year']");
    var category = panel.querySelector("[data-filter='category']");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    function apply() {
      var q = search ? search.value.trim().toLowerCase() : "";
      var r = region ? region.value : "";
      var y = year ? year.value : "";
      var c = category ? category.value : "";
      cards.forEach(function (card) {
        var haystack = [card.dataset.title, card.dataset.region, card.dataset.year, card.dataset.tags, card.dataset.category].join(" ").toLowerCase();
        var ok = true;
        if (q && !textMatch(haystack, q)) {
          ok = false;
        }
        if (r && !textMatch(card.dataset.region, r)) {
          ok = false;
        }
        if (y && card.dataset.year !== y) {
          ok = false;
        }
        if (c && card.dataset.category !== c) {
          ok = false;
        }
        card.classList.toggle("is-filter-hidden", !ok);
      });
    }
    [search, region, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  window.initMoviePlayer = function (src) {
    ready(function () {
      var video = document.getElementById("movie-video");
      var start = document.getElementById("player-start");
      if (!video || !src) {
        return;
      }
      var loaded = false;
      var hls = null;
      function load() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(src);
          hls.attachMedia(video);
          return;
        }
        video.src = src;
      }
      function play() {
        load();
        if (start) {
          start.classList.add("is-hidden");
        }
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }
      if (start) {
        start.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (start) {
          start.classList.add("is-hidden");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
