(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-menu]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-slide-to]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5600);
  }

  function initFilters() {
    var input = document.querySelector("[data-search-input]");
    var filters = Array.prototype.slice.call(document.querySelectorAll("[data-filter-key]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-text]"));
    if (!input && !filters.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && input) {
      input.value = q;
    }
    function run() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-text") || "").toLowerCase();
        var ok = !keyword || text.indexOf(keyword) !== -1;
        filters.forEach(function (filter) {
          var value = filter.value;
          var key = filter.getAttribute("data-filter-key");
          var cardValue = card.getAttribute("data-" + key) || "";
          if (value && cardValue.indexOf(value) === -1) {
            ok = false;
          }
        });
        card.classList.toggle("is-hidden", !ok);
      });
    }
    if (input) {
      input.addEventListener("input", run);
    }
    filters.forEach(function (filter) {
      filter.addEventListener("change", run);
    });
    run();
  }

  window.createMoviePlayer = function (videoId, overlayId, source) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !source) {
      return;
    }
    var loaded = false;
    var hlsInstance = null;
    function load() {
      if (!loaded) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
        loaded = true;
      }
      overlay.classList.add("hide");
      video.setAttribute("controls", "controls");
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {});
      }
    }
    overlay.addEventListener("click", load);
    video.addEventListener("click", function () {
      if (video.paused) {
        load();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
