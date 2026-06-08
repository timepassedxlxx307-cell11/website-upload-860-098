document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");

    if (toggle && menu) {
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === activeIndex);
        });
    }

    function startHeroTimer() {
        if (timer || slides.length < 2) {
            return;
        }

        timer = window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    function resetHeroTimer() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
        startHeroTimer();
    }

    if (prev) {
        prev.addEventListener("click", function () {
            showSlide(activeIndex - 1);
            resetHeroTimer();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showSlide(activeIndex + 1);
            resetHeroTimer();
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
            resetHeroTimer();
        });
    });

    startHeroTimer();

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-section]")).forEach(function (section) {
        var input = section.querySelector("[data-filter-input]");
        var chips = Array.prototype.slice.call(section.querySelectorAll("[data-filter]"));
        var cards = Array.prototype.slice.call(section.parentElement.querySelectorAll("[data-title]"));
        var activeFilter = "all";

        function applyFilter() {
            var query = input ? input.value.trim().toLowerCase() : "";

            cards.forEach(function (card) {
                var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
                var group = card.getAttribute("data-group") || "";
                var matchedText = !query || text.indexOf(query) !== -1;
                var matchedGroup = activeFilter === "all" || group === activeFilter || text.indexOf(activeFilter.toLowerCase()) !== -1;
                card.hidden = !(matchedText && matchedGroup);
            });
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                activeFilter = chip.getAttribute("data-filter") || "all";
                chips.forEach(function (item) {
                    item.classList.toggle("is-active", item === chip);
                });
                applyFilter();
            });
        });
    });
});
