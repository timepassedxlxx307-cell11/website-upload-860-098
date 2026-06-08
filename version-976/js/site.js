(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        var showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));

    forms.forEach(function (form) {
        var root = form.closest('main') || document;
        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-filter-card]'));
        var empty = root.querySelector('[data-empty]');
        var fields = Array.prototype.slice.call(form.querySelectorAll('input, select'));

        var normalize = function (value) {
            return String(value || '').trim().toLowerCase();
        };

        var apply = function () {
            var q = normalize(form.querySelector('[name="q"]') && form.querySelector('[name="q"]').value);
            var type = normalize(form.querySelector('[name="type"]') && form.querySelector('[name="type"]').value);
            var region = normalize(form.querySelector('[name="region"]') && form.querySelector('[name="region"]').value);
            var year = normalize(form.querySelector('[name="year"]') && form.querySelector('[name="year"]').value);
            var genre = normalize(form.querySelector('[name="genre"]') && form.querySelector('[name="genre"]').value);
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.textContent
                ].join(' '));
                var ok = true;

                if (q && text.indexOf(q) === -1) {
                    ok = false;
                }
                if (type && normalize(card.getAttribute('data-type')).indexOf(type) === -1) {
                    ok = false;
                }
                if (region && normalize(card.getAttribute('data-region')).indexOf(region) === -1) {
                    ok = false;
                }
                if (year && normalize(card.getAttribute('data-year')).indexOf(year) === -1) {
                    ok = false;
                }
                if (genre && normalize(card.getAttribute('data-genre')).indexOf(genre) === -1 && normalize(card.getAttribute('data-tags')).indexOf(genre) === -1) {
                    ok = false;
                }

                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        };

        fields.forEach(function (field) {
            field.addEventListener('input', apply);
            field.addEventListener('change', apply);
        });
    });
})();
