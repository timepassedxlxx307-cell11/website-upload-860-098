(function () {
    window.startMoviePlayer = function (videoUrl) {
        var video = document.getElementById('movieVideo');
        var overlay = document.getElementById('playerOverlay');
        var hls = null;
        var attached = false;

        if (!video || !overlay || !videoUrl) {
            return;
        }

        var attach = function () {
            if (attached) {
                return;
            }
            attached = true;

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(videoUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoUrl;
            } else {
                video.src = videoUrl;
            }
        };

        var play = function () {
            attach();
            overlay.classList.add('is-hidden');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        };

        overlay.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (!attached || video.paused) {
                play();
            }
        }, { once: true });
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
        video.addEventListener('ended', function () {
            overlay.classList.remove('is-hidden');
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
