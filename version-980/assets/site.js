(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = selectAll('.hero-slide', root);
    var dots = selectAll('[data-hero-dot]', root);
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
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
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initCardFilters() {
    selectAll('[data-filter-scope]').forEach(function (scope) {
      var list = scope.parentElement.querySelector('[data-card-list]');
      var cards = list ? selectAll('[data-movie-card]', list) : [];
      var search = scope.querySelector('[data-card-search]');
      var buttons = selectAll('.filter-btn', scope);
      var activeType = 'all';
      var activeYear = '';

      function applyFilters() {
        var query = search ? search.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
          var title = (card.getAttribute('data-title') || '').toLowerCase();
          var region = (card.getAttribute('data-region') || '').toLowerCase();
          var type = card.getAttribute('data-type') || '';
          var year = card.getAttribute('data-year') || '';
          var genre = (card.getAttribute('data-genre') || '').toLowerCase();
          var textMatched = !query || title.indexOf(query) > -1 || region.indexOf(query) > -1 || type.toLowerCase().indexOf(query) > -1 || year.indexOf(query) > -1 || genre.indexOf(query) > -1;
          var typeMatched = activeType === 'all' || type.indexOf(activeType) > -1 || genre.indexOf(activeType.toLowerCase()) > -1;
          var yearMatched = !activeYear || year === activeYear;
          card.classList.toggle('is-hidden', !(textMatched && typeMatched && yearMatched));
        });
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          var typeValue = button.getAttribute('data-filter-type');
          var yearValue = button.getAttribute('data-filter-year');
          if (typeValue !== null) {
            activeType = typeValue;
            buttons.forEach(function (item) {
              if (item.getAttribute('data-filter-type') !== null) {
                item.classList.toggle('is-active', item === button);
              }
            });
          }
          if (yearValue !== null) {
            activeYear = activeYear === yearValue ? '' : yearValue;
            button.classList.toggle('is-active', activeYear === yearValue);
          }
          applyFilters();
        });
      });

      if (search) {
        search.addEventListener('input', applyFilters);
      }
    });
  }

  function createCard(movie) {
    var article = document.createElement('article');
    article.className = 'movie-card';
    article.innerHTML = '' +
      '<a class="poster" href="' + movie.url + '">' +
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-mask"><span class="poster-play">▶</span></span>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<a class="movie-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="movie-meta"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
      '<div class="tag-row"><a href="' + movie.categoryUrl + '">' + escapeHtml(movie.categoryName) + '</a></div>' +
      '</div>';
    return article;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }

  function initGlobalSearch() {
    var form = document.querySelector('[data-global-search]');
    var results = document.querySelector('[data-search-results]');
    if (!form || !results || !window.SEARCH_MOVIES) {
      return;
    }
    var input = form.querySelector('input[name="q"]');

    function render(query) {
      var keyword = (query || '').trim().toLowerCase();
      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        if (!keyword) {
          return true;
        }
        return movie.title.toLowerCase().indexOf(keyword) > -1 ||
          movie.region.toLowerCase().indexOf(keyword) > -1 ||
          movie.type.toLowerCase().indexOf(keyword) > -1 ||
          movie.year.toLowerCase().indexOf(keyword) > -1 ||
          movie.genre.toLowerCase().indexOf(keyword) > -1 ||
          movie.tags.toLowerCase().indexOf(keyword) > -1 ||
          movie.oneLine.toLowerCase().indexOf(keyword) > -1;
      }).slice(0, 120);
      results.innerHTML = '';
      if (!matched.length) {
        var empty = document.createElement('div');
        empty.className = 'search-empty';
        empty.textContent = '未找到相关影片';
        results.appendChild(empty);
        return;
      }
      matched.forEach(function (movie) {
        results.appendChild(createCard(movie));
      });
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }
    render(initial);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = input ? input.value : '';
      var nextUrl = window.location.pathname + (value ? '?q=' + encodeURIComponent(value) : '');
      window.history.replaceState(null, '', nextUrl);
      render(value);
    });

    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
  }

  window.setupPlayer = function (playerId, streamUrl) {
    var video = document.getElementById(playerId);
    if (!video || !streamUrl) {
      return;
    }
    var frame = video.closest('.player-frame');
    var cover = frame ? frame.querySelector('.player-cover') : null;
    var loaded = false;
    var hls = null;

    function attachStream() {
      if (loaded) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      loaded = true;
    }

    function play() {
      attachStream();
      video.controls = true;
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (!loaded) {
        play();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initHero();
    initCardFilters();
    initGlobalSearch();
  });
})();
