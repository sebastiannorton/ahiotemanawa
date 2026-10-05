/* ============================================================
   Lightbox — true full-screen overlay carousel.

   openLightbox(items, startIndex, title)
   items = [{ src, alt }]. Arrows, ← → keys, Esc, swipe, focus trap.
   ============================================================ */
(function () {
  var overlay, imgEl, captionEl, counterEl, lastFocus;
  var items = [], index = 0, title = "";

  function build() {
    overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Photo gallery");
    /* critical overlay styles inline so the pop-up is always fixed,
       on-top and hidden-by-default even if a stylesheet fails to load */
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:1000;display:none;" +
      "align-items:center;justify-content:center;padding:1rem;" +
      "background:rgba(10,10,10,.95)";

    function btn(cls, label, html) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "lb-btn " + cls;
      b.setAttribute("aria-label", label);
      b.innerHTML = html;
      overlay.appendChild(b);
      return b;
    }
    btn("lb-close", "Close gallery", "&times;").addEventListener("click", close);
    btn("lb-prev", "Previous photo", "&#8249;").addEventListener("click", function () { step(-1); });
    btn("lb-next", "Next photo", "&#8250;").addEventListener("click", function () { step(1); });

    var stage = document.createElement("div");
    stage.className = "lb-stage";
    imgEl = document.createElement("img");
    imgEl.className = "lb-img";
    imgEl.alt = "";
    stage.appendChild(imgEl);
    captionEl = document.createElement("p");
    captionEl.className = "lb-caption";
    stage.appendChild(captionEl);
    counterEl = document.createElement("p");
    counterEl.className = "lb-counter";
    stage.appendChild(counterEl);
    overlay.appendChild(stage);

    overlay.addEventListener("click", function (ev) {
      if (ev.target === overlay) close();
    });
    overlay.addEventListener("keydown", onKey);

    var startX = null;
    overlay.addEventListener("touchstart", function (ev) {
      startX = ev.touches[0].clientX;
    }, { passive: true });
    overlay.addEventListener("touchend", function (ev) {
      if (startX === null) return;
      var dx = ev.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1);
      startX = null;
    }, { passive: true });

    document.body.appendChild(overlay);
  }

  function focusables() {
    return overlay.querySelectorAll(".lb-btn");
  }

  function onKey(ev) {
    if (ev.key === "Escape") { close(); return; }
    if (ev.key === "ArrowLeft") { step(-1); return; }
    if (ev.key === "ArrowRight") { step(1); return; }
    if (ev.key === "Tab") {
      var f = focusables();
      var list = Array.prototype.slice.call(f);
      var i = list.indexOf(document.activeElement);
      if (ev.shiftKey && (i <= 0)) { ev.preventDefault(); list[list.length - 1].focus(); }
      else if (!ev.shiftKey && (i === list.length - 1 || i === -1)) { ev.preventDefault(); list[0].focus(); }
    }
  }

  function show() {
    var item = items[index];
    if (!item) return;
    imgEl.classList.remove("lb-in");
    imgEl.src = item.src;
    imgEl.alt = item.alt || "";
    captionEl.textContent = item.alt || "";
    counterEl.textContent = title
      ? title + " — " + (index + 1) + " / " + items.length
      : (index + 1) + " / " + items.length;
    void imgEl.offsetWidth;
    imgEl.classList.add("lb-in");
  }

  function step(delta) {
    if (!items.length) return;
    index = (index + delta + items.length) % items.length;
    show();
  }

  function open(newItems, startIndex, newTitle) {
    items = newItems || [];
    index = Math.max(0, Math.min(startIndex || 0, items.length - 1));
    title = newTitle || "";
    if (!overlay) build();
    lastFocus = document.activeElement;
    overlay.classList.add("open");
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
    show();
    overlay.querySelector(".lb-close").focus();
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove("open");
    overlay.style.display = "none";
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  window.openLightbox = open;
})();