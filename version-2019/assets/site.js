(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mainNav = document.querySelector('[data-main-nav]');
  var navSearch = document.querySelector('[data-global-search]');

  if (menuButton && mainNav && navSearch) {
    menuButton.addEventListener('click', function () {
      mainNav.classList.toggle('is-open');
      navSearch.classList.toggle('is-open');
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function getQueryFromUrl() {
    try {
      return new URLSearchParams(window.location.search).get('q') || '';
    } catch (error) {
      return '';
    }
  }

  function filterCards(query, scope) {
    var root = scope || document;
    var cards = Array.prototype.slice.call(root.querySelectorAll('.searchable'));
    var term = normalize(query);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var matched = !term || haystack.indexOf(term) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    var container = root.querySelector('[data-search-results]') || root.querySelector('.movie-grid');
    var empty = root.querySelector('[data-empty-state]');

    if (container) {
      if (!empty) {
        empty = document.createElement('div');
        empty.className = 'no-results';
        empty.setAttribute('data-empty-state', 'true');
        empty.textContent = '没有找到匹配影片，请尝试其他关键词。';
        container.appendChild(empty);
      }
      empty.style.display = visible === 0 ? '' : 'none';
    }
  }

  var localSearch = document.querySelector('[data-local-search]');
  if (localSearch) {
    var input = localSearch.querySelector('input');
    var initial = getQueryFromUrl();

    if (input && initial) {
      input.value = initial;
      filterCards(initial, document);
    }

    localSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      filterCards(input ? input.value : '', document);
    });

    if (input) {
      input.addEventListener('input', function () {
        filterCards(input.value, document);
      });
    }
  }

  document.querySelectorAll('[data-filter-value]').forEach(function (button) {
    button.addEventListener('click', function () {
      var value = button.getAttribute('data-filter-value') || '';
      var panel = button.closest('[data-filter-panel]') || document;

      panel.querySelectorAll('[data-filter-value]').forEach(function (item) {
        if ((item.getAttribute('data-filter-value') || '') === value) {
          item.classList.add('is-active');
        } else if (value === '' && (item.getAttribute('data-filter-value') || '') === '') {
          item.classList.add('is-active');
        } else {
          item.classList.remove('is-active');
        }
      });

      filterCards(value, document);
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        restart();
      });
    }

    restart();
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var source = player.getAttribute('data-src');
    var loaded = false;
    var hlsInstance = null;

    function loadSource() {
      if (!video || !source || loaded) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }

      loaded = true;
    }

    function playVideo() {
      if (!video) {
        return;
      }

      loadSource();
      video.controls = true;
      player.classList.add('is-playing');

      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        playVideo();
      });
    }

    player.addEventListener('click', function (event) {
      if (event.target === video && !video.paused) {
        return;
      }
      playVideo();
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
