(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function text(value) {
    return String(value || "");
  }

  function escapeHtml(value) {
    return text(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalize(value) {
    return text(value).trim().toLowerCase();
  }

  window.initMoviePlayer = function (videoId, source, overlayId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var hlsInstance = null;
    var loaded = false;

    function start() {
      if (!video || !source) {
        return;
      }

      if (!loaded) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && Hls.isSupported()) {
          hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
        loaded = true;
      }

      if (overlay) {
        overlay.classList.add("hidden");
      }

      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          if (overlay) {
            overlay.classList.remove("hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("hidden");
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        if (query) {
          window.location.href = "./search.html?q=" + encodeURIComponent(query);
        } else {
          window.location.href = "./search.html";
        }
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var index = 0;
      var timer = null;

      function show(next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      }

      function restart() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          restart();
        });
      });

      show(0);
      restart();
    }

    var filterWrap = document.querySelector("[data-catalog-filter]");
    if (filterWrap) {
      var input = filterWrap.querySelector("[data-filter-keyword]");
      var typeSelect = filterWrap.querySelector("[data-filter-type]");
      var yearSelect = filterWrap.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
      var empty = document.querySelector("[data-empty-state]");

      function applyFilter() {
        var keyword = normalize(input ? input.value : "");
        var type = normalize(typeSelect ? typeSelect.value : "");
        var year = normalize(yearSelect ? yearSelect.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchType = !type || normalize(card.getAttribute("data-type")) === type;
          var matchYear = !year || normalize(card.getAttribute("data-year")) === year;
          var ok = matchKeyword && matchType && matchYear;
          card.classList.toggle("hide-card", !ok);
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.style.display = visible ? "none" : "block";
        }
      }

      [input, typeSelect, yearSelect].forEach(function (el) {
        if (el) {
          el.addEventListener("input", applyFilter);
          el.addEventListener("change", applyFilter);
        }
      });

      applyFilter();
    }

    var searchResults = document.getElementById("searchResults");
    var searchInput = document.getElementById("searchPageInput");
    var searchForm = document.getElementById("searchPageForm");

    if (searchResults && typeof SEARCH_ITEMS !== "undefined") {
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";
      if (searchInput) {
        searchInput.value = initialQuery;
      }

      function cardMarkup(item) {
        return [
          "<a class=\"movie-card\" href=\"" + escapeHtml(item.url) + "\" data-movie-card data-title=\"" + escapeHtml(item.title) + "\" data-region=\"" + escapeHtml(item.region) + "\" data-type=\"" + escapeHtml(item.type) + "\" data-year=\"" + escapeHtml(item.year) + "\" data-genre=\"" + escapeHtml(item.genre) + "\" data-tags=\"" + escapeHtml(item.tags) + "\">",
          "  <div class=\"poster\">",
          "    <img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
          "    <span class=\"card-badge\">" + escapeHtml(item.type) + "</span>",
          "  </div>",
          "  <div class=\"card-body\">",
          "    <h3 class=\"card-title\">" + escapeHtml(item.title) + "</h3>",
          "    <div class=\"card-meta\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span></div>",
          "  </div>",
          "</a>"
        ].join("");
      }

      function render(query) {
        var q = normalize(query);
        var results = SEARCH_ITEMS.filter(function (item) {
          var haystack = normalize([item.title, item.region, item.type, item.year, item.genre, item.tags, item.category].join(" "));
          return !q || haystack.indexOf(q) !== -1;
        }).slice(0, 240);

        if (!results.length) {
          searchResults.innerHTML = "<div class=\"empty-state\">没有匹配结果</div>";
          return;
        }

        searchResults.innerHTML = results.map(cardMarkup).join("");
      }

      if (searchForm) {
        searchForm.addEventListener("submit", function (event) {
          event.preventDefault();
          var value = searchInput ? searchInput.value.trim() : "";
          var url = value ? "./search.html?q=" + encodeURIComponent(value) : "./search.html";
          history.replaceState(null, "", url);
          render(value);
        });
      }

      render(initialQuery);
    }
  });
})();
