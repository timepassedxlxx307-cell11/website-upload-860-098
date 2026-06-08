import { H as Hls } from "./hls-vendor-dru42stk.js";

const ready = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

const setupMobileNav = () => {
  const button = document.querySelector("[data-mobile-toggle]");
  const nav = document.querySelector("[data-main-nav]");
  if (!button || !nav) {
    return;
  }
  button.addEventListener("click", () => {
    nav.classList.toggle("is-open");
  });
};

const setupHero = () => {
  const hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }
  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  if (slides.length <= 1) {
    return;
  }
  let activeIndex = 0;
  let timer = null;
  const activate = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === activeIndex);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === activeIndex);
    });
  };
  const start = () => {
    stop();
    timer = window.setInterval(() => activate(activeIndex + 1), 5200);
  };
  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      activate(Number(dot.dataset.heroDot || 0));
      start();
    });
  });
  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  start();
};

const loadSource = (video, source, localSource) => {
  if (!video || video.dataset.playerReady === "true") {
    return;
  }
  const selectedSource = source || localSource;
  if (!selectedSource) {
    return;
  }
  video.dataset.playerReady = "true";
  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = selectedSource;
    return;
  }
  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 60
    });
    hls.loadSource(selectedSource);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, (eventName, data) => {
      if (data && data.fatal && localSource && selectedSource !== localSource) {
        hls.destroy();
        video.dataset.playerReady = "false";
        loadSource(video, localSource, localSource);
      }
    });
    video.dataset.hlsAttached = "true";
    return;
  }
  video.src = localSource || selectedSource;
};

const setupPlayers = () => {
  const shells = Array.from(document.querySelectorAll("[data-player-shell]"));
  shells.forEach((shell) => {
    const video = shell.querySelector("video[data-src]");
    const button = shell.querySelector("[data-play-button]");
    if (!video || !button) {
      return;
    }
    const play = () => {
      loadSource(video, video.dataset.src, video.dataset.local);
      button.classList.add("is-hidden");
      const promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {
          button.classList.remove("is-hidden");
        });
      }
    };
    button.addEventListener("click", play);
    shell.addEventListener("click", (event) => {
      if (event.target.closest("button") || event.target.closest("video")) {
        return;
      }
      play();
    });
    video.addEventListener("play", () => button.classList.add("is-hidden"));
  });
};

const cardTemplate = (movie) => {
  const tags = movie.tags.slice(0, 4).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  return `
    <article class="movie-card">
      <a class="poster-link" href="${movie.url}" aria-label="${escapeHtml(movie.title)}">
        <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy" onerror="this.style.opacity='0'">
        <span class="poster-badge">${escapeHtml(String(movie.year || "热播"))}</span>
      </a>
      <div class="movie-card-body">
        <div class="movie-meta">${escapeHtml(movie.meta)}</div>
        <h3><a href="${movie.url}">${escapeHtml(movie.title)}</a></h3>
        <p>${escapeHtml(movie.oneLine)}</p>
        <div class="tag-row">${tags}</div>
        <a class="card-action" href="${movie.url}">立即观看</a>
      </div>
    </article>
  `;
};

const escapeHtml = (value) => {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const setupSearch = () => {
  const results = document.querySelector("[data-search-results]");
  const summary = document.querySelector("[data-search-summary]");
  const input = document.querySelector("[data-search-input]");
  if (!results || !summary || !window.MOVIE_SEARCH_INDEX) {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const query = (params.get("q") || "").trim();
  if (input) {
    input.value = query;
  }
  if (!query) {
    results.innerHTML = "";
    return;
  }
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = window.MOVIE_SEARCH_INDEX.filter((movie) => {
    const haystack = movie.searchText.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  }).slice(0, 120);
  summary.textContent = matches.length ? `为你找到相关影片：${query}` : `未找到相关影片：${query}`;
  results.innerHTML = matches.map(cardTemplate).join("");
};

ready(() => {
  setupMobileNav();
  setupHero();
  setupPlayers();
  setupSearch();
});
