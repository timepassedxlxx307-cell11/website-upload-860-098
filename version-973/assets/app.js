(function () {
    var currentType = "";

    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function bindMenu() {
        var button = document.querySelector(".js-menu-button");
        var menu = document.querySelector(".js-mobile-menu");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function bindHero() {
        var slider = document.querySelector(".js-hero-slider");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var prev = slider.querySelector(".hero-prev");
        var next = slider.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                play();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var target = parseInt(dot.getAttribute("data-slide"), 10);
                if (!Number.isNaN(target)) {
                    show(target);
                    play();
                }
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", play);
        show(0);
        play();
    }

    function cardText(card) {
        return [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-category")
        ].join(" ").toLowerCase();
    }

    function filterCards() {
        var input = document.querySelector(".js-page-search");
        var query = input ? input.value.trim().toLowerCase() : "";
        var cards = Array.prototype.slice.call(document.querySelectorAll(".js-movie-card"));
        cards.forEach(function (card) {
            var type = card.getAttribute("data-type") || "";
            var matchesType = !currentType || type === currentType;
            var matchesQuery = !query || cardText(card).indexOf(query) !== -1;
            card.classList.toggle("is-hidden", !(matchesType && matchesQuery));
        });
    }

    function bindFilters() {
        var input = document.querySelector(".js-page-search");
        if (input) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q) {
                input.value = q;
            }
            input.addEventListener("input", filterCards);
        }
        Array.prototype.slice.call(document.querySelectorAll(".js-type-filter")).forEach(function (button) {
            button.addEventListener("click", function () {
                currentType = button.getAttribute("data-type") || "";
                Array.prototype.slice.call(document.querySelectorAll(".js-type-filter")).forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                filterCards();
            });
        });
        filterCards();
    }

    function bindPlayers() {
        Array.prototype.slice.call(document.querySelectorAll(".js-player")).forEach(function (player) {
            var video = player.querySelector("video");
            var cover = player.querySelector(".player-cover");
            var src = player.getAttribute("data-src");
            var hls = null;
            var loaded = false;
            if (!video || !src) {
                return;
            }

            function loadVideo() {
                if (loaded) {
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else {
                    video.src = src;
                }
            }

            function start() {
                loadVideo();
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
                }
            }

            if (cover) {
                cover.addEventListener("click", start);
            }
            video.addEventListener("click", function () {
                if (!loaded || video.paused) {
                    start();
                }
            });
            video.addEventListener("play", function () {
                if (cover) {
                    cover.classList.add("is-hidden");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        bindMenu();
        bindHero();
        bindFilters();
        bindPlayers();
    });
})();
