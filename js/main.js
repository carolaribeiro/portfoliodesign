(function () {
  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  var heroImg = document.querySelector(".hero-photo-img");
  var heroFig = document.getElementById("hero-photo");
  if (heroImg && heroFig) {
    heroImg.addEventListener("error", function () {
      heroFig.classList.add("is-fallback");
      heroImg.setAttribute("alt", "");
      heroImg.setAttribute("role", "presentation");
      heroFig.setAttribute("aria-label", "Caroline Ribeiro");
    });
  }

  var toggle = document.querySelector(".nav-toggle");
  var headerInner = document.querySelector(".header-inner");
  var list = document.getElementById("menu-principal");
  var nav = document.getElementById("nav-principal");
  var mqMobile = window.matchMedia("(max-width: 899px)");

  function syncMenuA11y() {
    if (!nav || !headerInner || !toggle) return;
    var mobile = mqMobile.matches;
    var open = headerInner.classList.contains("is-open");
    if (!mobile) {
      nav.removeAttribute("aria-hidden");
      if ("inert" in nav) nav.inert = false;
      return;
    }
    nav.setAttribute("aria-hidden", open ? "false" : "true");
    if ("inert" in nav) nav.inert = !open;
  }

  if (toggle && headerInner && list) {
    toggle.addEventListener("click", function () {
      var open = headerInner.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      syncMenuA11y();
    });

    list.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        headerInner.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        syncMenuA11y();
      });
    });

    mqMobile.addEventListener("change", syncMenuA11y);
    syncMenuA11y();
  }

  var carousel = document.getElementById("carousel-projetos");
  var btnPrev = document.querySelector(".carousel-btn-prev");
  var btnNext = document.querySelector(".carousel-btn-next");
  var dotsWrap = document.getElementById("carousel-dots");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cards = carousel ? Array.prototype.slice.call(carousel.querySelectorAll(".project-card")) : [];
  var dots = [];
  var isDragging = false;
  var dragStartX = 0;
  var dragStartScrollLeft = 0;
  var dragMoved = false;

  function getScrollAmount() {
    if (!carousel) return 0;
    var card = carousel.querySelector(".project-card");
    if (!card) return 0;
    var track = carousel.querySelector(".projects-track");
    var gap = 16;
    if (track && typeof getComputedStyle !== "undefined") {
      var g = getComputedStyle(track).gap || getComputedStyle(track).columnGap;
      if (g && g.endsWith("px")) gap = parseFloat(g) || gap;
    }
    return card.offsetWidth + gap;
  }

  function updateCarouselButtons() {
    if (!carousel || !btnPrev || !btnNext) return;
    var max = carousel.scrollWidth - carousel.clientWidth - 2;
    var left = carousel.scrollLeft;
    btnPrev.disabled = left <= 2;
    btnNext.disabled = left >= max - 2;
  }

  function getActiveCardIndex() {
    if (!carousel || !cards.length) return 0;
    var viewportCenter = carousel.scrollLeft + carousel.clientWidth / 2;
    var nearest = 0;
    var nearestDistance = Number.POSITIVE_INFINITY;

    cards.forEach(function (card, idx) {
      var cardCenter = card.offsetLeft + card.offsetWidth / 2;
      var distance = Math.abs(cardCenter - viewportCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = idx;
      }
    });

    return nearest;
  }

  function updateDotsState() {
    if (!dots.length) return;
    var activeIndex = Math.min(getActiveCardIndex(), dots.length - 1);
    dots.forEach(function (dot, idx) {
      var isActive = idx === activeIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  }

  function scrollToCard(index) {
    if (!carousel || !cards[index]) return;
    carousel.scrollTo({
      left: cards[index].offsetLeft,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  function buildCarouselDots() {
    if (!dotsWrap || !cards.length) return;
    dotsWrap.innerHTML = "";
    var dotsCount = Math.max(cards.length - 1, 1);
    dots = Array.from({ length: dotsCount }, function (_, idx) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot";
      dot.setAttribute("aria-label", "Ir para projeto " + String(idx + 1));
      dot.setAttribute("aria-selected", "false");
      dot.addEventListener("click", function () {
        scrollToCard(idx);
      });
      dotsWrap.appendChild(dot);
      return dot;
    });
    updateDotsState();
  }

  if (carousel && btnPrev && btnNext) {
    carousel.addEventListener(
      "scroll",
      function () {
        updateCarouselButtons();
        updateDotsState();
      },
      { passive: true }
    );

    btnPrev.addEventListener("click", function () {
      carousel.scrollBy({
        left: -getScrollAmount(),
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });

    btnNext.addEventListener("click", function () {
      carousel.scrollBy({
        left: getScrollAmount(),
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });

    carousel.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        carousel.scrollBy({ left: -getScrollAmount(), behavior: reduceMotion ? "auto" : "smooth" });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        carousel.scrollBy({ left: getScrollAmount(), behavior: reduceMotion ? "auto" : "smooth" });
      }
    });

    function startCarouselDrag(clientX) {
      isDragging = true;
      dragMoved = false;
      dragStartX = clientX;
      dragStartScrollLeft = carousel.scrollLeft;
      carousel.classList.add("is-dragging");
    }

    function moveCarouselDrag(clientX, ev) {
      if (!isDragging) return;
      var deltaX = clientX - dragStartX;
      if (Math.abs(deltaX) > 3) dragMoved = true;
      carousel.scrollLeft = dragStartScrollLeft - deltaX * 0.72;
      if (dragMoved && ev && ev.cancelable) ev.preventDefault();
    }

    function endCarouselDrag() {
      if (!isDragging) return;
      isDragging = false;
      carousel.classList.remove("is-dragging");
    }

    carousel.addEventListener("mousedown", function (e) {
      if (e.button !== 0) return;
      startCarouselDrag(e.pageX);
    });

    window.addEventListener("mousemove", function (e) {
      moveCarouselDrag(e.pageX, e);
    });

    window.addEventListener("mouseup", function () {
      endCarouselDrag();
    });

    carousel.addEventListener("mouseleave", function () {
      endCarouselDrag();
    });

    carousel.addEventListener(
      "touchstart",
      function (e) {
        if (e.touches.length !== 1) return;
        startCarouselDrag(e.touches[0].pageX);
      },
      { passive: true }
    );

    window.addEventListener(
      "touchmove",
      function (e) {
        if (!isDragging || !e.touches || e.touches.length !== 1) return;
        moveCarouselDrag(e.touches[0].pageX, e);
      },
      { passive: false }
    );

    window.addEventListener("touchend", function () {
      endCarouselDrag();
    });

    window.addEventListener("touchcancel", function () {
      endCarouselDrag();
    });

    carousel.addEventListener(
      "click",
      function (e) {
        if (dragMoved) {
          e.preventDefault();
          e.stopPropagation();
          dragMoved = false;
        }
      },
      true
    );

    window.addEventListener(
      "resize",
      function () {
        updateCarouselButtons();
        updateDotsState();
      },
      { passive: true }
    );
    buildCarouselDots();
    updateCarouselButtons();
    updateDotsState();
  }
})();
