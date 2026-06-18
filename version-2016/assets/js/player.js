(function () {
    var players = document.querySelectorAll('video[data-src]');
    players.forEach(function (video) {
        var source = video.getAttribute('data-src');
        var cover = video.closest('.player-wrap') && video.closest('.player-wrap').querySelector('.play-cover');
        var bindSource = function () {
            if (!source) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                video._hls = hls;
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
        };
        var playNow = function () {
            bindSource();
            cover && cover.classList.add('is-hidden');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    video.controls = true;
                });
            }
        };
        if (cover) {
            cover.addEventListener('click', playNow);
        }
        video.addEventListener('play', function () {
            cover && cover.classList.add('is-hidden');
        });
        video.addEventListener('click', function () {
            if (video.paused) {
                playNow();
            }
        });
        video.addEventListener('loadedmetadata', function () {
            video.controls = true;
        });
    });
})();
