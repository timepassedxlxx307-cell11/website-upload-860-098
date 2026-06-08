(function () {
  function initialize(container) {
    var video = container.querySelector('video');
    var overlay = container.querySelector('.play-overlay');
    var message = container.querySelector('.player-message');
    var stream = container.getAttribute('data-stream');
    var hls = null;
    var loaded = false;

    if (!video || !stream) {
      return;
    }

    function setMessage(text) {
      if (!message) {
        return;
      }

      message.textContent = text;
      message.classList.toggle('is-visible', Boolean(text));
    }

    function loadStream() {
      if (loaded) {
        return;
      }

      loaded = true;
      setMessage('');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('播放加载失败，请稍后再试');
          }
        });
      } else {
        video.src = stream;
      }
    }

    function play() {
      loadStream();
      var request = video.play();

      if (request && typeof request.catch === 'function') {
        request.catch(function () {
          setMessage('点击视频区域即可继续播放');
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', function () {
        play();
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      setMessage('');
    });

    video.addEventListener('pause', function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove('is-hidden');
      }
    });

    video.addEventListener('ended', function () {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    });

    video.addEventListener('error', function () {
      setMessage('播放加载失败，请稍后再试');
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.video-player')).forEach(initialize);
})();
