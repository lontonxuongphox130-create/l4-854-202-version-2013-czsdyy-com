(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        var open = mobileNav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var slideIndex = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      slideIndex = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === slideIndex);
      });

      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === slideIndex);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = parseInt(dot.getAttribute('data-slide') || '0', 10);
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(slideIndex + 1);
      }, 5600);
    }

    document.querySelectorAll('.filter-scope').forEach(function (scope) {
      var input = scope.querySelector('.site-search');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var chips = Array.prototype.slice.call(scope.querySelectorAll('.filter-chip'));
      var chipValue = '全部';

      function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
      }

      function applyFilter() {
        var keyword = normalize(input ? input.value : '');
        var chip = normalize(chipValue);

        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-category'),
            card.textContent
          ].join(' '));

          var keywordOk = !keyword || text.indexOf(keyword) !== -1;
          var chipOk = chip === '全部' || text.indexOf(chip) !== -1;
          card.classList.toggle('is-hidden', !(keywordOk && chipOk));
        });
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chipValue = chip.getAttribute('data-filter') || '全部';
          chips.forEach(function (item) {
            item.classList.toggle('is-active', item === chip);
          });
          applyFilter();
        });
      });

      if (chips[0]) {
        chips[0].classList.add('is-active');
      }
    });

    var initialized = new WeakSet();

    function initializeVideo(video) {
      if (initialized.has(video)) {
        return Promise.resolve();
      }

      var source = video.querySelector('source');
      var streamUrl = source ? source.getAttribute('src') : video.getAttribute('src');

      if (!streamUrl) {
        return Promise.resolve();
      }

      initialized.add(video);

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        return new Promise(function (resolve) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function () {
            resolve();
          });
          video._hlsPlayer = hls;
        });
      }

      video.src = streamUrl;
      return Promise.resolve();
    }

    document.querySelectorAll('.video-box').forEach(function (box) {
      var video = box.querySelector('video');
      var button = box.querySelector('.play-overlay');

      if (!video) {
        return;
      }

      function startPlayback() {
        initializeVideo(video).then(function () {
          var playTask = video.play();
          if (playTask && typeof playTask.then === 'function') {
            playTask.catch(function () {});
          }
          box.classList.add('is-playing');
        });
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          startPlayback();
        });
      }

      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          box.classList.remove('is-playing');
        }
      });

      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });
    });
  });
})();
