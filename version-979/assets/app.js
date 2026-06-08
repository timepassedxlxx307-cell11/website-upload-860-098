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
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        startTimer();
      });
    }

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    show(0);
    startTimer();
  }

  var searchForms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));

  searchForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[type="search"]');

      if (!form.hasAttribute('data-local-search')) {
        event.preventDefault();
        var value = input ? input.value.trim() : '';
        var target = form.getAttribute('action') || './search.html';
        window.location.href = target + (value ? '?q=' + encodeURIComponent(value) : '');
      }
    });
  });

  var library = document.querySelector('[data-library]');

  if (library) {
    var cards = Array.prototype.slice.call(library.querySelectorAll('[data-card]'));
    var queryInput = document.querySelector('[data-filter-query]');
    var categorySelect = document.querySelector('[data-filter-category]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var resetButton = document.querySelector('[data-filter-reset]');
    var emptyState = document.querySelector('[data-empty-state]');
    var urlQuery = new URLSearchParams(window.location.search).get('q');

    if (queryInput && urlQuery) {
      queryInput.value = urlQuery;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function filterCards() {
      var query = normalize(queryInput ? queryInput.value : '');
      var category = categorySelect ? categorySelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type')
        ].join(' '));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchCategory = !category || card.getAttribute('data-category') === category;
        var matchType = !type || card.getAttribute('data-type').indexOf(type) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var isVisible = matchQuery && matchCategory && matchType && matchYear;

        card.style.display = isVisible ? '' : 'none';

        if (isVisible) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    [queryInput, categorySelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (queryInput) {
          queryInput.value = '';
        }
        if (categorySelect) {
          categorySelect.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        filterCards();
      });
    }

    filterCards();
  }
})();
