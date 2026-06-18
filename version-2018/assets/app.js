(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".site-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
    if (!slides.length || !dots.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilter() {
    var input = document.querySelector("[data-filter-input]");
    var sort = document.querySelector("[data-sort-select]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var grid = document.querySelector("[data-card-grid]");
    var empty = document.querySelector(".empty-state");
    if (!cards.length) {
      return;
    }
    function apply() {
      var keyword = normalize(input ? input.value : "");
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var match = !keyword || text.indexOf(keyword) !== -1;
        card.style.display = match ? "" : "none";
        if (match) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }
    function sortCards() {
      if (!sort || !grid) {
        apply();
        return;
      }
      var mode = sort.value;
      cards.sort(function (left, right) {
        if (mode === "title") {
          return normalize(left.getAttribute("data-title")).localeCompare(normalize(right.getAttribute("data-title")), "zh-Hans-CN");
        }
        return Number(right.getAttribute("data-year")) - Number(left.getAttribute("data-year"));
      });
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
      apply();
    }
    if (input) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query) {
        input.value = query;
      }
      input.addEventListener("input", apply);
    }
    if (sort) {
      sort.addEventListener("change", sortCards);
      sortCards();
    } else {
      apply();
    }
  }

  function setupHomeSearch() {
    var form = document.querySelector("[data-home-search]");
    if (!form) {
      return;
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input");
      var value = input ? input.value.trim() : "";
      var url = "./search.html";
      if (value) {
        url += "?q=" + encodeURIComponent(value);
      }
      window.location.href = url;
    });
  }

  function initPlayer(source) {
    ready(function () {
      var video = document.getElementById("movie-video");
      var overlay = document.getElementById("play-overlay");
      var button = document.getElementById("play-button");
      if (!video || !source) {
        return;
      }
      var loaded = false;
      function load() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            maxBufferLength: 60,
            backBufferLength: 30
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }
      }
      function play() {
        load();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }
      if (button) {
        button.addEventListener("click", play);
      }
      if (overlay) {
        overlay.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (overlay && video.currentTime < 0.2) {
          overlay.classList.remove("is-hidden");
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilter();
    setupHomeSearch();
  });

  window.VideoSite = {
    initPlayer: initPlayer
  };
})();
