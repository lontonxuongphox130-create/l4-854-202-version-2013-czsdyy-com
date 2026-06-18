(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupMobileMenu() {
        var button = qs('.mobile-menu-button');
        var panel = qs('#mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var isOpen = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!isOpen));
            panel.hidden = isOpen;
        });
    }

    function setupHeroCarousel() {
        var hero = qs('[data-hero-carousel]');
        if (!hero) {
            return;
        }
        var slides = qsa('.hero-slide', hero);
        var dots = qsa('.hero-dot', hero);
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var target = parseInt(dot.getAttribute('data-go-slide'), 10);
                show(target);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function setupLocalFilters() {
        qsa('.local-filter').forEach(function (input) {
            var scope = qs('[data-filter-scope]');
            if (!scope) {
                return;
            }
            var cards = qsa('.movie-card', scope);
            input.addEventListener('input', function () {
                var term = normalize(input.value);
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute('data-search'));
                    card.classList.toggle('is-hidden-by-filter', Boolean(term) && haystack.indexOf(term) === -1);
                });
            });
        });
    }

    function setupSearchPage() {
        var page = qs('[data-search-page]');
        if (!page) {
            return;
        }
        var input = qs('.search-input', page);
        var category = qs('.category-select', page);
        var region = qs('.region-select', page);
        var clear = qs('.clear-search', page);
        var count = qs('.search-count', page);
        var cards = qsa('.movie-card', page);
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function apply() {
            var term = normalize(input && input.value);
            var selectedCategory = normalize(category && category.value);
            var selectedRegion = normalize(region && region.value);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var cardCategory = normalize(card.getAttribute('data-category'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var matchesTerm = !term || haystack.indexOf(term) !== -1;
                var matchesCategory = !selectedCategory || cardCategory === selectedCategory;
                var matchesRegion = !selectedRegion || cardRegion === selectedRegion;
                var isVisible = matchesTerm && matchesCategory && matchesRegion;
                card.classList.toggle('is-hidden-by-filter', !isVisible);
                if (isVisible) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = visible + ' 部影片';
            }
        }

        [input, category, region].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        if (clear) {
            clear.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                if (category) {
                    category.value = '';
                }
                if (region) {
                    region.value = '';
                }
                apply();
            });
        }
        apply();
    }

    function setupPlayers() {
        qsa('.watch-player').forEach(function (wrapper) {
            var button = qs('.player-start', wrapper);
            var video = qs('video', wrapper);
            var status = qs('.player-status', wrapper);
            if (!button || !video) {
                return;
            }

            function setStatus(message) {
                if (status) {
                    status.textContent = message || '';
                }
            }

            function playVideo() {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        setStatus('点击播放器控制栏继续播放');
                    });
                }
            }

            function initialize() {
                var source = video.getAttribute('data-src');
                if (!source) {
                    setStatus('暂无可用播放源');
                    return;
                }
                wrapper.classList.add('is-playing');
                video.controls = true;
                if (video.getAttribute('data-ready') === 'true') {
                    playVideo();
                    return;
                }
                video.setAttribute('data-ready', 'true');
                setStatus('正在加载播放源...');

                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus('');
                        playVideo();
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setStatus('播放源加载失败，请稍后再试');
                            try {
                                hls.destroy();
                            } catch (error) {}
                        }
                    });
                    video._hls = hls;
                    return;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.addEventListener('loadedmetadata', function () {
                        setStatus('');
                        playVideo();
                    }, { once: true });
                    video.load();
                    return;
                }

                setStatus('当前浏览器暂不支持 HLS 播放，请使用支持 HLS 的浏览器访问');
            }

            button.addEventListener('click', initialize);
            video.addEventListener('play', function () {
                wrapper.classList.add('is-playing');
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHeroCarousel();
        setupLocalFilters();
        setupSearchPage();
        setupPlayers();
    });
})();
