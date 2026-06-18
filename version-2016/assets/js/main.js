(function () {
    var navButton = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-nav]');
    if (navButton && nav) {
        navButton.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('form[action$="search.html"]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                input && input.focus();
            }
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;
        var setSlide = function (nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        };
        var start = function () {
            timer = window.setInterval(function () {
                setSlide(index + 1);
            }, 5200);
        };
        var restart = function () {
            window.clearInterval(timer);
            start();
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                setSlide(i);
                restart();
            });
        });
        prev && prev.addEventListener('click', function () {
            setSlide(index - 1);
            restart();
        });
        next && next.addEventListener('click', function () {
            setSlide(index + 1);
            restart();
        });
        setSlide(0);
        start();
    }
})();
