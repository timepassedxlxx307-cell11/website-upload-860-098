(function() {
    var video = document.getElementById('movie-player');
    var overlay = document.querySelector('.player-overlay');

    if (!video || !overlay) {
        return;
    }

    var stream = video.getAttribute('data-stream');
    var started = false;
    var hls = null;

    function begin() {
        if (!stream) {
            return;
        }

        overlay.classList.add('hidden');

        if (started) {
            video.play().catch(function() {});
            return;
        }

        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            video.play().catch(function() {});
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
                video.play().catch(function() {});
            });
            hls.on(window.Hls.Events.ERROR, function(eventName, data) {
                if (!data || !data.fatal || !hls) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                }
            });
        }
    }

    overlay.addEventListener('click', begin);
    video.addEventListener('click', function() {
        if (!started) {
            begin();
        }
    });
}());
