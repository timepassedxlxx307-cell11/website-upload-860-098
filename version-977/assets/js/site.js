(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function markMissingImages() {
    document.querySelectorAll('img').forEach(function (image) {
      if (image.complete && image.naturalWidth === 0) {
        image.classList.add('is-missing');
      }
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
      });
    });
  }

  function setupMobileMenu() {
    var button = document.getElementById('mobileMenuButton');
    var nav = document.getElementById('mobileNav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', isOpen);
      button.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function setupHeroSlider() {
    var slider = document.getElementById('heroSlider');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-slide-target]'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide-target')) || 0);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function setupLocalFilters() {
    var scope = document.querySelector('[data-filter-scope]');
    var list = document.querySelector('[data-card-list]');
    if (!scope || !list) {
      return;
    }
    var input = scope.querySelector('[data-filter-input]');
    var selects = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-select]'));
    var reset = scope.querySelector('[data-filter-reset]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('.card-item'));
    var empty = document.querySelector('[data-filter-empty]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var query = normalize(input ? input.value : '');
      var activeFilters = {};
      selects.forEach(function (select) {
        activeFilters[select.getAttribute('data-filter-select')] = normalize(select.value);
      });
      var visibleCount = 0;
      cards.forEach(function (card) {
        var text = normalize(card.textContent + ' ' + Object.values(card.dataset).join(' '));
        var matched = !query || text.indexOf(query) !== -1;
        Object.keys(activeFilters).forEach(function (key) {
          var value = activeFilters[key];
          if (value && normalize(card.dataset[key]) !== value) {
            matched = false;
          }
        });
        card.hidden = !matched;
        if (matched) {
          visibleCount += 1;
        }
      });
      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', applyFilter);
    });
    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        selects.forEach(function (select) {
          select.value = '';
        });
        applyFilter();
      });
    }
  }

  function setupGlobalSearch() {
    var input = document.getElementById('globalSearchInput');
    var button = document.getElementById('globalSearchButton');
    var results = document.getElementById('searchPageResults');
    var data = window.MOVIE_SEARCH_INDEX || [];
    if (!input || !results || !data.length) {
      return;
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function card(movie) {
      return [
        '<article class="movie-card card-item">',
        '  <a href="video/' + movie.code + '.html" aria-label="观看 ' + escapeHtml(movie.title) + '">',
        '    <div class="poster-box">',
        '      <img src="' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '      <span class="poster-fallback">' + escapeHtml(movie.title) + '</span>',
        '      <span class="card-badge">' + escapeHtml(movie.type) + '</span>',
        '      <span class="silk-overlay card-glow"></span>',
        '    </div>',
        '    <div class="card-content">',
        '      <h3>' + escapeHtml(movie.title) + '</h3>',
        '      <p>' + escapeHtml(movie.oneLine) + '</p>',
        '      <div class="card-meta">',
        '        <span>' + escapeHtml(movie.year) + '</span>',
        '        <span>' + escapeHtml(movie.region) + '</span>',
        '        <span>' + escapeHtml(movie.genre) + '</span>',
        '      </div>',
        '      <div class="tag-list"><span>' + escapeHtml(movie.category) + '</span></div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join('\n');
    }

    function getQueryFromUrl() {
      var params = new URLSearchParams(window.location.search);
      return params.get('q') || '';
    }

    function render() {
      var query = String(input.value || '').trim().toLowerCase();
      var matched = data.filter(function (movie) {
        if (!query) {
          return true;
        }
        return movie.searchText.indexOf(query) !== -1;
      }).slice(0, 160);
      if (!matched.length) {
        results.innerHTML = '<p class="filter-empty">没有找到匹配影片，请更换关键词。</p>';
      } else {
        results.innerHTML = matched.map(card).join('\n');
        markMissingImages();
      }
    }

    var initialQuery = getQueryFromUrl();
    if (initialQuery) {
      input.value = initialQuery;
    }
    input.addEventListener('input', render);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        render();
      }
    });
    if (button) {
      button.addEventListener('click', render);
    }
    render();
  }

  ready(function () {
    markMissingImages();
    setupMobileMenu();
    setupHeroSlider();
    setupLocalFilters();
    setupGlobalSearch();
  });
}());
