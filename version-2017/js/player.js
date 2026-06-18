(function () {
  window.initMoviePlayer = function (source) {
    var video = document.getElementById('movie-video');
    var cover = document.querySelector('[data-player-cover]');
    var playButton = document.querySelector('[data-play-button]');
    var hls = null;
    var ready = false;
    if (!video || !source) {
      return;
    }
    var prepare = function () {
      if (ready) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      ready = true;
    };
    var start = function () {
      prepare();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.controls = true;
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          video.controls = true;
        });
      }
    };
    if (cover) {
      cover.addEventListener('click', start);
    }
    if (playButton) {
      playButton.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (!ready) {
        start();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
}());
