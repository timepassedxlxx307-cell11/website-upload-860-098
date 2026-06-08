(function() {
    var navButton = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (navButton && mobileNav) {
        navButton.addEventListener('click', function() {
            mobileNav.classList.toggle('open');
            document.body.classList.toggle('nav-open');
        });
    }

    var sliders = document.querySelectorAll('[data-hero-slider]');
    sliders.forEach(function(slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            if (slides.length < 2) {
                return;
            }
            timer = window.setInterval(function() {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                stop();
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    var panels = document.querySelectorAll('[data-filter-panel]');
    panels.forEach(function(panel) {
        var targetSelector = panel.getAttribute('data-filter-panel');
        var target = document.querySelector(targetSelector);
        var textInput = panel.querySelector('[data-filter-text]');
        var genreSelect = panel.querySelector('[data-filter-genre]');
        var yearSelect = panel.querySelector('[data-filter-year]');

        if (!target) {
            return;
        }

        var cards = Array.prototype.slice.call(target.querySelectorAll('[data-search-target]'));

        function normalize(value) {
            return (value || '').toString().trim().toLowerCase();
        }

        function applyFilter() {
            var text = normalize(textInput && textInput.value);
            var genre = normalize(genreSelect && genreSelect.value);
            var year = normalize(yearSelect && yearSelect.value);

            cards.forEach(function(card) {
                var haystack = normalize(card.getAttribute('data-title'));
                var cardGenre = normalize(card.getAttribute('data-genre'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var okText = !text || haystack.indexOf(text) !== -1;
                var okGenre = !genre || cardGenre.indexOf(genre) !== -1;
                var okYear = !year || cardYear === year;
                card.style.display = okText && okGenre && okYear ? '' : 'none';
            });
        }

        [textInput, genreSelect, yearSelect].forEach(function(control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    });

    var homeSearch = document.querySelector('.home-search');
    if (homeSearch) {
        homeSearch.addEventListener('submit', function(event) {
            var input = homeSearch.querySelector('input[name="q"]');
            if (input && input.value.trim()) {
                event.preventDefault();
                window.location.href = './movies.html?q=' + encodeURIComponent(input.value.trim());
            }
        });
    }

    var query = new URLSearchParams(window.location.search).get('q');
    if (query) {
        var firstFilter = document.querySelector('[data-filter-text]');
        if (firstFilter) {
            firstFilter.value = query;
            firstFilter.dispatchEvent(new Event('input'));
            firstFilter.focus();
        }
    }
}());
