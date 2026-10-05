/* ============================================================
   Image loader.
   - <img class="site-image" data-src="path" data-alt="..."> loads
     the exact file at `data-src` (no path guessing). An optional
     `data-src-webp` is preferred for modern browsers, with the
     `data-src` JPG used automatically as a fallback.
   - Inside a photo row (.photo-row / .home-strip / .momentum-pair)
     the cell gets a flex-grow proportional to the photo's shape, so
     justified rows show landscape and portrait shots at equal height.
   - Standalone cells get their real aspect ratio.
   - If a file is genuinely missing, the grey placeholder inside the
     same cell is revealed (and a 4:3 box size applied).
   - Direct-src images (including the <picture> WebP/JPG pairs in the
     HTML) are made lazy + async off the hero, so they never block
     the first paint.
   ============================================================ */
(function () {
  var ROW_SELECTOR = ".photo-row, .home-strip";

  function revealPlaceholder(cell) {
    if (!cell) return;
    cell.classList.add("is-missing");
    var ph = cell.querySelector(".placeholder");
    if (ph) ph.removeAttribute("hidden");
    var inRow = cell.closest(ROW_SELECTOR);
    if (!inRow && !cell.style.aspectRatio) {
      cell.style.aspectRatio = "4 / 3";
    }
  }

  function process(img) {
    var src = img.getAttribute("data-src") || "";
    var webp = img.getAttribute("data-src-webp") || "";
    var altAttr = img.getAttribute("data-alt");
    var cell = img.parentElement;
    /* only override the alt when an explicit data-alt was supplied —
       never wipe the alt text written directly in the HTML */
    if (altAttr !== null) img.alt = altAttr;

    /* lazy-load + async-decode everything except the hero */
    if (!img.closest(".hero-asset") && !img.hasAttribute("loading")) {
      img.loading = "lazy";
    }
    if (!img.hasAttribute("decoding")) img.decoding = "async";

    /* images written with a direct src (no data-src) manage themselves —
       never touch their geometry */
    if (!src) return;

    img.addEventListener("load", function () {
      if (!cell || !img.naturalWidth || !img.naturalHeight) return;
      cell.classList.add("has-image");
      if (cell.getAttribute("data-fixed-ratio")) return;
      var ratio = img.naturalWidth / img.naturalHeight;
      if (cell.closest(ROW_SELECTOR)) {
        cell.style.aspectRatio = "";        /* row height controls size */
        cell.style.flexGrow = ratio.toFixed(4);
      } else {
        cell.style.aspectRatio = ratio.toFixed(4);
      }
    });

    img.addEventListener("error", function () {
      /* a WebP failure falls back to the JPG once, then gives up */
      if (webp && img.getAttribute("data-webp-failed") !== "1") {
        img.setAttribute("data-webp-failed", "1");
        img.src = src;
        return;
      }
      revealPlaceholder(cell);
    });

    img.src = webp || src;
  }

  function renderSiteImages() {
    Array.prototype.forEach.call(
      document.querySelectorAll("img.site-image"),
      process
    );
  }

  window.renderSiteImages = renderSiteImages;
  renderSiteImages();
})();