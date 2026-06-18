(function () {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var result = document.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var data = window.SEARCH_INDEX || [];

    var render = function (items) {
        if (!result) {
            return;
        }
        result.innerHTML = items.slice(0, 120).map(function (item) {
            return '<article class="movie-card">' +
                '<a class="poster-link" href="' + item.url + '">' +
                '<span class="poster-bg"></span>' +
                '<img src="./' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="this.style.opacity=\'0\'">' +
                '<span class="play-chip">播放</span>' +
                '</a>' +
                '<div class="movie-card-body">' +
                '<div class="movie-card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.region) + '</span></div>' +
                '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
                '<p>' + escapeHtml(item.oneLine) + '</p>' +
                '<div class="tag-row"><span>' + escapeHtml(item.genre) + '</span></div>' +
                '</div>' +
                '</article>';
        }).join('');
    };

    var escapeHtml = function (value) {
        return String(value || '').replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    };

    var runSearch = function (term) {
        var words = term.trim().toLowerCase().split(/\s+/).filter(Boolean);
        var items = data.filter(function (item) {
            if (!words.length) {
                return true;
            }
            var hay = [item.title, item.year, item.type, item.region, item.genre, item.oneLine].join(' ').toLowerCase();
            return words.every(function (word) {
                return hay.indexOf(word) !== -1;
            });
        });
        render(items.length ? items : data.slice(0, 60));
    };

    if (input) {
        input.value = query;
    }
    runSearch(query);
    if (form && input) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var term = input.value.trim();
            var url = term ? 'search.html?q=' + encodeURIComponent(term) : 'search.html';
            window.history.replaceState(null, '', url);
            runSearch(term);
        });
    }
})();
