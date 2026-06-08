import { H as Hls } from './hls-dru42stk.js';

function attachPlayer(video) {
  var source = video.getAttribute('data-src');
  var shell = video.closest('.player-card');
  var overlay = shell ? shell.querySelector('.play-overlay') : null;
  var hlsInstance = null;
  var hasLoaded = false;

  function load() {
    if (hasLoaded || !source) {
      return;
    }
    hasLoaded = true;
    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.play().catch(function () {});
    }
  }

  function play() {
    load();
    if (shell) {
      shell.classList.add('is-playing');
    }
    video.play().catch(function () {});
  }

  if (overlay) {
    overlay.addEventListener('click', play);
  }
  video.addEventListener('play', function () {
    if (shell) {
      shell.classList.add('is-playing');
    }
  });
  video.addEventListener('click', function () {
    if (!hasLoaded) {
      play();
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.querySelectorAll('.js-hls-player').forEach(attachPlayer);
