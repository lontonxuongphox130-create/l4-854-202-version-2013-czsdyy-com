(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    start();
                });
            });
            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    start();
                });
            }
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
        var yearFilters = Array.prototype.slice.call(document.querySelectorAll("[data-year-filter]"));

        function applyFilters() {
            var keyword = normalize(filterInputs.map(function (input) {
                return input.value;
            }).join(" "));
            var year = yearFilters.length ? String(yearFilters[0].value || "") : "";
            var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .category-card"));
            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-year"),
                    card.textContent
                ].join(" "));
                var cardYear = String(card.getAttribute("data-year") || "");
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedYear = !year || cardYear === year;
                card.classList.toggle("is-filtered-out", !(matchedKeyword && matchedYear));
            });
        }

        filterInputs.forEach(function (input) {
            input.addEventListener("input", applyFilters);
        });
        yearFilters.forEach(function (select) {
            select.addEventListener("change", applyFilters);
        });
    });

    window.MoviePlayer = {
        init: function (options) {
            var video = document.getElementById(options.videoId);
            var trigger = document.getElementById(options.triggerId);
            var cover = document.getElementById(options.coverId);
            var loaded = false;
            var hlsInstance = null;

            function attach() {
                if (!video || loaded) {
                    return;
                }
                loaded = true;
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(options.url);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        var playing = video.play();
                        if (playing && playing.catch) {
                            playing.catch(function () {});
                        }
                    });
                } else {
                    video.src = options.url;
                    var play = video.play();
                    if (play && play.catch) {
                        play.catch(function () {});
                    }
                }
            }

            if (trigger) {
                trigger.addEventListener("click", attach);
            }
            if (cover) {
                cover.addEventListener("click", attach);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (!loaded) {
                        attach();
                    }
                });
                window.addEventListener("pagehide", function () {
                    if (hlsInstance) {
                        hlsInstance.destroy();
                    }
                });
            }
        }
    };
})();
