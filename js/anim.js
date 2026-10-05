/* ============================================================
   Site animations — subtle and consistent.
   - reveal-on-scroll for sections/cards/images
   - sticky bar header gains a shadow once the page scrolls
   Everything respects prefers-reduced-motion (CSS also guards).
   ============================================================ */
(function () {
  var reduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- reveal on scroll ----------
     NOTE: .gal-block is deliberately NOT revealed — the gallery strips
     must be visible and animating from first paint (reveal gating was
     why the strips appeared frozen until hover). */
  var targets = [
    ".section", ".past-event", ".events-upcoming", ".map-section",
    ".contact-grid", ".event-card", ".rss-card", ".two-col",
    ".pull-quote", ".quote-group", ".map-wrap"
  ].join(",");

  var els = Array.prototype.slice.call(document.querySelectorAll(targets));

  if (reduced || !("IntersectionObserver" in window)) {
    /* no animation — make sure everything is visible */
    return;
  }

  els.forEach(function (el) {
    if (el.dataset.revealDone) return;
    el.dataset.revealDone = "1";
    el.classList.add("reveal");
  });

  /* stagger siblings that share a parent (cards, quotes, etc.) */
  Array.prototype.forEach.call(
    document.querySelectorAll(".event-grid, .rss-stack, .event-stack, .momentum-pair, .gallery-shell"),
    function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        if (child.classList && child.classList.contains("reveal")) {
          child.setAttribute("data-stagger", String(Math.min(i + 1, 5)));
        }
      });
    }
  );

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  els.forEach(function (el) { observer.observe(el); });

  /* robustness: anything already on screen shows immediately, so
     content is never left hidden if the observer is slow/absent */
  var vh = window.innerHeight || document.documentElement.clientHeight;
  els.forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.top < vh * 1.15 && r.bottom > 0) {
      el.classList.add("is-in");
      observer.unobserve(el);
    }
  });

  /* ---------- sticky header shadow ---------- */
  /* Targets both header variants: the bar used on the inner pages, and the
     Home header, which is sticky on mobile (see the max-width:900px block in
     styles.css). On desktop the Home header is an absolute overlay and the
     .is-scrolled rule is scoped to mobile, so no shadow appears there. */
  var bar = document.querySelector(".site-header--bar, .hero-header");
  if (bar) {
    var onScroll = function () {
      if (window.scrollY > 8) bar.classList.add("is-scrolled");
      else bar.classList.remove("is-scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();