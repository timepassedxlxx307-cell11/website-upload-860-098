(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;
    var timer = null;

    function showHero(index) {
        if (!slides.length) {
            return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === activeIndex);
        });
    }

    function startHeroTimer() {
        if (slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            showHero(activeIndex + 1);
        }, 5500);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var index = Number(dot.getAttribute('data-hero-dot')) || 0;
            showHero(index);
            if (timer) {
                window.clearInterval(timer);
            }
            startHeroTimer();
        });
    });
    startHeroTimer();

    function applyFilter(query, scope) {
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var emptyState = document.querySelector('[data-empty-state]');
        var normalized = (query || '').trim().toLowerCase();
        var visibleCount = 0;
        cards.forEach(function (card) {
            var haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
            var matched = !normalized || haystack.indexOf(normalized) !== -1;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visibleCount += 1;
            }
        });
        if (emptyState) {
            emptyState.classList.toggle('show', visibleCount === 0);
        }
    }

    var searchInput = document.querySelector('[data-search-input]');
    var scope = document.querySelector('[data-card-scope]') || document;
    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var preset = params.get('q');
        if (preset) {
            searchInput.value = preset;
            applyFilter(preset, scope);
        }
        searchInput.addEventListener('input', function () {
            applyFilter(searchInput.value, scope);
        });
    }

    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            filterButtons.forEach(function (item) {
                item.classList.remove('active');
            });
            button.classList.add('active');
            var value = button.getAttribute('data-filter-value') || '';
            if (searchInput) {
                searchInput.value = value;
            }
            applyFilter(value, scope);
        });
    });
}());
