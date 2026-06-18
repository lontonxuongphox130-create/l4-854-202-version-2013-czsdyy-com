(function () {
  var menuButton = document.querySelector(".mobile-menu-button");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      menuButton.textContent = open ? "×" : "☰";
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function applyCardSearch(input) {
    var scope = input.closest(".js-search-scope") || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".js-movie-card"));
    var empty = scope.querySelector(".no-results");
    var keyword = normalize(input.value);
    var visibleCount = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-filter") || card.textContent);
      var matched = !keyword || text.indexOf(keyword) !== -1;
      card.classList.toggle("hidden-card", !matched);
      if (matched) {
        visibleCount += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("show", visibleCount === 0);
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll(".js-card-search"), function (input) {
    input.addEventListener("input", function () {
      applyCardSearch(input);
    });
  });

  window.MovieStream = {
    init: function (source) {
      var video = document.querySelector(".movie-video");
      var overlay = document.querySelector(".play-overlay");
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function attachSource() {
        if (video.getAttribute("data-ready") === "true") {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }

        video.setAttribute("data-ready", "true");
      }

      function beginPlay() {
        attachSource();

        if (overlay) {
          overlay.classList.add("is-hidden");
        }

        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", beginPlay);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          beginPlay();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  };
})();
