/* ============================================================
   Home galleries — three auto-scrolling filmstrip rows
   (whare / whenua / tangata), HALF SPEED.

   Each folder is one horizontally scrolling strip (duplicated set
   for a seamless loop). Hover/focus pauses a strip. Clicking any
   photo opens the full-screen overlay album (js/lightbox.js).

   Speed: duration was doubled (max(120, n*14)s) = half the previous
   scroll speed. Tweak SCROLL_BASE/SCROLL_PER_ITEM to adjust.

   Filenames from js/gallery-manifest.js (scripts/optimize-images.sh)
   with SITE_CONFIG.GALLERY_SECTIONS (js/config.js) as fallback.
   Thumbs: public/images/gallery-web/<folder>/thumbs/<file>
   Full:   public/images/gallery-web/<folder>/full/<file>
   ============================================================ */
(function () {
  var root = document.getElementById("galleries-root");
  if (!root) return;

  var cfg = (typeof SITE_CONFIG !== "undefined") ? SITE_CONFIG : {};
  var manifest = window.GALLERY_MANIFEST || null;
  var SCROLL_BASE = 120;      /* seconds — half the earlier 60s */
  var SCROLL_PER_ITEM = 14;   /* seconds — half the earlier 7s  */

  var sections = (cfg.GALLERY_SECTIONS || [])
    .map(function (s) {
      var files = (manifest && manifest[s.folder]) ? manifest[s.folder] : (s.images || []);
      return {
        title: s.title || s.key,
        subtitle: s.subtitle || "",
        folder: s.folder || s.key,
        altPrefix: s.altPrefix || "Ahi o te Manawa photograph",
        images: files
      };
    })
    .filter(function (s) { return s.images && s.images.length; });

  function thumbUrl(sec, file) {
    return "public/images/gallery-web/" + sec.folder + "/thumbs/" + file;
  }
  function fullUrl(sec, file) {
    return "public/images/gallery-web/" + sec.folder + "/full/" + file;
  }

  function buildItem(sec, file, i, isDup) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gal-item" + (isDup ? " dup" : "");
    btn.setAttribute("aria-label",
      "View photo " + (i + 1) + " of " + sec.images.length + " — " + sec.title);

    var img = document.createElement("img");
    img.src = thumbUrl(sec, file);
    img.alt = sec.altPrefix + " (" + (i + 1) + ")";
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", function () { btn.remove(); });
    btn.appendChild(img);

    btn.addEventListener("click", function () {
      var items = sec.images.map(function (f, j) {
        return { src: fullUrl(sec, f), alt: sec.altPrefix + " (" + (j + 1) + ")" };
      });
      if (typeof window.openLightbox === "function") {
        window.openLightbox(items, i, sec.title);
      }
    });
    return btn;
  }

  sections.forEach(function (sec) {
    var block = document.createElement("div");
    block.className = "gal-block";

    var head = document.createElement("div");
    head.className = "gal-row-head";
    var h = document.createElement("h3");
    h.className = "gal-title";
    h.textContent = sec.title;
    head.appendChild(h);
    if (sec.subtitle) {
      var sub = document.createElement("span");
      sub.className = "gal-sub";
      sub.textContent = sec.subtitle;
      head.appendChild(sub);
    }
    block.appendChild(head);

    var strip = document.createElement("div");
    strip.className = "gal-strip";

    var track = document.createElement("div");
    track.className = "gal-track";
    /* half speed: doubled durations */
    track.style.setProperty("--dur", Math.max(SCROLL_BASE, sec.images.length * SCROLL_PER_ITEM) + "s");

    sec.images.forEach(function (file, i) {
      track.appendChild(buildItem(sec, file, i, false));
    });
    sec.images.forEach(function (file, i) {
      track.appendChild(buildItem(sec, file, i, true));
    });

    strip.appendChild(track);
    block.appendChild(strip);
    root.appendChild(block);
  });

  /* make sure every strip is animating immediately from page load
     (no hover needed) — force one reflow then confirm play state */
  requestAnimationFrame(function () {
    Array.prototype.forEach.call(
      document.querySelectorAll(".gal-track"),
      function (t) {
        void t.offsetWidth; /* reflow to kick the animation */
        t.style.animationPlayState = "running";
      }
    );
  });
})();