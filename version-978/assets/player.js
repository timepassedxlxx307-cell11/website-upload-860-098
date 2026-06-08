document.addEventListener("DOMContentLoaded", function () {
    var video = document.getElementById("moviePlayer");
    var overlay = document.getElementById("playOverlay");
    var configElement = document.getElementById("player-config");

    if (!video || !overlay || !configElement) {
        return;
    }

    var config = JSON.parse(configElement.textContent || "{}");
    var stream = config.stream;
    var hls = null;
    var ready = false;

    function attachStream() {
        if (ready || !stream) {
            return;
        }

        ready = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            return;
        }

        video.src = stream;
    }

    function playVideo() {
        attachStream();
        overlay.classList.add("is-hidden");
        video.controls = true;
        var playTask = video.play();

        if (playTask && typeof playTask.catch === "function") {
            playTask.catch(function () {
                overlay.classList.remove("is-hidden");
            });
        }
    }

    overlay.addEventListener("click", function () {
        playVideo();
    });

    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
});
