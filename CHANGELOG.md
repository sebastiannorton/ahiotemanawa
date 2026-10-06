# CHANGELOG — Ahi o te Manawa

**Purpose:** a compacted working context for future tasks on this project.
Read this first, then consult the four spec documents for design/content detail.

**Source-of-truth order (unchanged):** `DESIGN-ANALYSIS.md` →
`CONTENT-MAP.md` → `ASSET-MANIFEST.md` → `IMPLEMENTATION-PROMPT.md` →
existing project conventions. If this file disagrees with the specs,
**the specs win**.

**Last updated:** 6 October 2026

---

## 0. Session — 6 October 2026: SEO + performance pass

Baseline: `seo/lighthouse20261006.json` (mobile, home) — Perf 86, LCP 4.1 s,
6.9 MB payload, 110 image requests. Two approved batches applied:

**Non-intrusive (all four pages).**
- `<head>`: self-referencing canonical, Open Graph + Twitter cards, JSON-LD
  (`Organization`/`LocalBusiness` NAP + `WebSite`), `robots` meta.
- Hero preload with `fetchpriority="high"` (index).
- **Poppins self-hosted** — `public/fonts/` woff2, weights 300/400/500/600/
  700/800, latin + latin-ext, `@font-face` + `font-display: swap` + preload
  in each head; Google Fonts `<link>`s removed from all pages.
- `css/styles.min.css` + `js/*.min.js` generated (sources kept; pages
  reference the minified files at `?v=23`).
- Home-strip WebPs re-encoded ≤1000 px; **gallery thumbs re-encoded to
  480 px** (102 files ≈ 3.2 MB total, was 640 px).
- A11y: logo accessible-name fixed; `<main>` landmark on every page.
- `sitemap.xml` + `robots.txt` created — **both contain a TODO placeholder
  domain (`www.ahiotemanawa.example`) that must be swapped for the real
  domain at deployment.**

**Intrusive (approved: I1, I2, I4, I5, I7).**
- I1: `galleries.js` builds each strip lazily via IntersectionObserver
  (400 px rootMargin; builds immediately under `prefers-reduced-motion`
  or when IO is unavailable).
- I2: `PREVIEW_LIMIT = 12` previews per strip; lightbox still shows the
  full set.
- I4: home `<h1>` is now the visible green kicker line under the hero
  ("Ahi o te Manawa / retreat & regenerative land / Mt Kakaramea, Lake
  Taupō"); the Bright Principles marquee was demoted to
  `<p class="statement">`, styled identically.
- I5: font self-hosting (above).
- I7: unreferenced gallery-web strays + `.DS_Store` pruned.

**⚠ Critical caveats for future sessions**
1. **27 gallery WebPs are rotated 90° CW on top of the upright JPGs**
   (tangata ×11, whare ×12, whenua ×4 — earlier sessions). **Do NOT
   re-run `scripts/optimize-images.sh`** — it rebuilds WebPs from the
   JPGs and flips them sideways. If it ever runs, re-apply the rotation
   round-trip (`dwebp` → `sips -r 90` → `cwebp`, q82 thumbs / q78 full).
2. `galleries.js` carries `IMG_VER = "2"` cache-bust on thumb/full URLs —
   bump it whenever gallery WebPs change on disk.

---

## 1. Stack & structure
## 1. Stack & structure

Static HTML + CSS + vanilla JS. **No build step, no framework, no npm.**

```
index.html      Home          purpose.html   Purpose
events.html     Events        contact.html   Contact
css/styles.css  Single stylesheet (all pages)
js/             config, images, galleries, lightbox, events, contact, rss, anim, menu
scripts/        optimize-images.sh, build-gallery-manifest.js
public/images/  logo, favicon, home/, events/, gallery/, gallery-web/
shots/          Headless-Chrome screenshots used for visual review
```

Serve locally with any static server (e.g. `python3 -m http.server`). The
events feed is fetched from Google Sheets at runtime and **works over CORS**
(verified in Chrome), so it works on Live Server and static hosting.

| File | Role |
|---|---|
| `config.js` | All client-editable values, single source of truth |
| `images.js` | Image paths, natural proportions, lazy loading, placeholders |
| `galleries.js` | Builds the three gallery filmstrips |
| `gallery-manifest.js` | **Generated** — do not hand-edit |
| `lightbox.js` | Full-screen gallery overlay |
| `events.js` | Google Sheet CSV → EventCard system |
| `contact.js` | Contact form validation + submit |
| `rss.js` | "Notes from the Land" card stack |
| `anim.js` | Reveal-on-scroll + shared animation behaviours |
| `menu.js` | Legacy; hamburger removed, now a harmless no-op |

---

## 2. Design system

**Palette** (from `DESIGN-ANALYSIS.md`): `--near-black #1a1a1a`,
`--body #2b2b2b`, `--secondary #555`, `--brand-blue #7586a8`,
`--brand-green #4c7031`, white. `--max: 1160px`, `--radius: 12px`.

**Typography:** Poppins (Google Fonts), centre-aligned body. Deliberately thin
hierarchy: body 300 (Light), `h2` 400, `h1`/`h3` 500, nav 600, logo wordmark
800. Body kept ≥15px for legibility since 300-weight sits near the contrast
floor at small sizes.

**Spacing:** sections ~3.5rem padding, adjacent-section gap ~1.6rem,
paragraphs ~1.35rem, prose capped at 68ch, centred.

**Images:** natural proportions (no forced cropping) except hero and event
cards; rounded 12px corners with a light 1px frame + soft shadow; hero is
full-bleed and square-edged.

**Motion:** reveal-on-scroll (fade + rise), sticky-header shadow, nav underline
growth, card hover lift. **All disabled under `prefers-reduced-motion`**; the
Bright Principles marquee degrades to a static wrapped line.

---

## 3. Page/component state

**Shared header.** Desktop: logo left, 4 nav links right. **The hamburger was
removed** — below 901px the header becomes a column: logo centred on its own
row, all 4 nav links in a full-width row beneath.

Two header variants exist:
- `.site-header--bar` (purpose / events / contact) — white, sticky, hairline
  bottom border, gains a shadow on scroll via `.is-scrolled`.
- `.hero-header` (Home) — **desktop** is a transparent absolute overlay on the
  hero photo (white text, dark drop-shadow glow on the koru). **Mobile
  (≤900px) it is made identical to the bar header**: white background, sticky,
  hairline border, dark text, matching lockup sizes and padding. Its
  `.is-scrolled` shadow rule is scoped inside the mobile media query so the
  desktop overlay never gains one.

**Home header logo uses `footer-logo.png`** (the other pages use
`logo-ahiotemanawa.svg`). That file is **pure white artwork** (verified: 300×300
RGBA, every opaque pixel luminance 255), so on the white mobile bar header it
would be invisible — hence `filter: brightness(0); opacity: .92` inside the
mobile block. Desktop leaves it white over the photo with the dark glow.

**Logo lockup sizing** (deliberately different per page type):
- Home hero (desktop): koru icon `clamp(74px, 11.3vw, 144.1px)`, wordmark ~52px,
  tagline ~25px; vertically centred over the hero band.
- Mobile (all pages) and inner pages: icon `clamp(44px, 6.8vw, 87px)`, wordmark
  ~48.8px, tagline ~23.4px (inner-page text 20% smaller than the base).
- `logo-ahiotemanawa.svg` is a **koru-only** SVG — the wordmark and tagline
  are separate HTML spans, not part of the image.
- `logo-background.svg` is the cropped koru used for the watermark.
- `footer-logo.png` is the white koru used in the footer (66px) and, since this
  change, in the Home header too.

**`js/anim.js` scroll shadow** targets `.site-header--bar, .hero-header` so both
sticky headers raise on scroll.

**Shared footer.** Near-black, centred rows: white koru → site name → nav →
copyright. `body p` gives paragraphs a 68ch measure, so footer rows **must**
override with `max-width: none` + auto margins + `text-align: center`, or their
boxes anchor left and the footer looks uncentred. This has been an on/off
regression — re-check it after any footer edit.

**Home.** Full-bleed hero (Lake Taupō), Bright Principles marquee, photo strip,
about/location/spaces/people, three galleries, Kaitiaki : Guardians, Notes from
the Land (RSS).

- **Hero:** `clamp(240px, 42vh, 430px)`, square edges, ~188px on mobile.
- **Galleries:** three filmstrips (whare / whenua / tangata) in one container,
  alternating directions, click to open the full-screen overlay. Scroll speed is
  set in `js/galleries.js` via `SCROLL_BASE = 120` and
  `SCROLL_PER_ITEM = 14`, so each strip's duration is
  `max(120, imageCount × 14)` seconds (these are "half speed" values — they were
  halved from 60/7). Pause on hover/focus. Originals total ~350MB, so
  `scripts/optimize-images.sh` generates web-sized copies in
  `public/images/gallery-web/` — the page loads those, not the originals.
- **Koru watermark:** `logo-background.svg` at 10% opacity, `object-fit:
  contain`, `width: 100vw`, `top: 100%` of `.statement-wrap`. It starts below
  Bright Principles, spans edge-to-edge, and scrolls away with the page. It is
  **not** `fixed` and **not** cropped.

**Purpose.** Content verbatim from `CONTENT-MAP.md` §5, grouped into one flowing
section rather than many stacked ones, with a `.purpose-section` class for its
slightly roomier rhythm.

**Events.** Static Past Events blocks (Momentum / Gaian / Togethering) below the
live sheet-driven area. Testimonials and the Benjamin Pollitt poem are
`<blockquote>` groups with a modern quote treatment. Under Momentum the two
portrait images stack in a left column; the quote column is wider and
vertically centred.

**Contact.** Large satellite map embed, then a two-column block: details left,
form right. Name and Email sit side by side and together span exactly the same
width as the Message box.

---

## 4. Events system (Google Sheet CSV)

`EVENTS_CSV_URL` lives **only** in `js/config.js` — never hard-coded elsewhere.
**Columns:** `active, title, start_date, start_time, end_date, end_time,
is_recurring, recurrence_note, location, type, description, image_url,
register_url, organiser, notes_internal`. Rows are mapped by header name, so
extra columns (e.g. `id`) are ignored and blank rows skipped.

**Only `active = yes/true/1` renders.** Remaining rows are partitioned by date:

| Group | Rule |
|---|---|
| **Upcoming Spaces** | `start_date` is today or later |
| **In Progress** | start elapsed but `end_date` is today or later |
| **Past Spaces** | start and end both elapsed — **only the last 3** |

**Recurring spaces** (`is_recurring` / `recurrence_note`) stay in **In Progress**
indefinitely when they have no end date — they only leave when `active` is set
to `no`, or an `end_date` is added and passes. They never enter Past Spaces.

**Date display:** single day → `Thu, 15 Oct 2026 · 12:00 to 17:30`; multiday →
`Sat, 15 Aug 2026 · 12:00 to Thu, 8 Oct 2026 · 17:30`; recurring → times only
(`12:00 to 17:30`), with frequency detail in the recurrence note.

`SHOW_PAST_EVENTS` was **removed** — the three-group model replaced it.

Cards are wide and horizontal (image left ~38%, text right), stacking below
640px. `register_url` is optional (no button when empty). `image_url` accepts a
full URL (preferred; loaded with `referrerPolicy="no-referrer"`, no lazy-load)
or a bare filename resolved against `public/images/`; empty/broken falls back to
the designed shamrock panel. All sheet text renders via `textContent`. Empty and
error states both exist; the error state uses `role="alert"`.

---

## 5. Client-configurable values

Everything the client changes lives in **`js/config.js`**:

| Key | State |
|---|---|
| `EVENTS_CSV_URL` | ✅ live sheet |
| `RSS_FEED_URL` | ⚠️ placeholder — still the Jay Bennett feed; needs the Ahi o te Manawa Substack URL |
| `contactEmail` | ⚠️ placeholder `hello@ahiotemanawa.example` |
| `FORM_ENDPOINT` | ⚠️ placeholder `https://formspree.io/f/PLACEHOLDER_REPLACE_ME` |
| `mapsEmbedSrc` | ✅ live satellite embed (`!5e1` satellite, `!5e0` road map) |
| `addressLines` | ✅ 789 State Highway 41 / RD1 / Tokaanu 3381 / New Zealand |
| `GALLERY_SECTIONS` | generated by `scripts/build-gallery-manifest.js` |

**Adding photos:** drop them into the folder, then run
`bash scripts/optimize-images.sh` — it creates the web-sized copies and
regenerates the gallery manifest. No manual list editing needed.

---

## 6. Outstanding items for the client

- [ ] Real contact email address
- [ ] Formspree (or other) form endpoint
- [ ] Ahi o te Manawa Substack URL for the RSS feed
- [ ] Test rows (`test2`, `test`, `test recurring`, `bridgehouse`) are still
      live in the sheet — set `active=no` or delete before going public
- [ ] Confirm the map renders as satellite in a normal browser session
- [ ] Guardian/contact links on Purpose still point at placeholder URLs
      (flagged `TODO:` in the markup)

---

## 7. Foot-guns — read before editing CSS

**A corrupt stylesheet is the biggest historical risk on this project, and it
has happened twice, both times from a dropped or extra brace:**

1. An **unclosed `@media` block** silently swallows every rule after it. The
   whole site then renders unstyled (huge SVG logo, default-blue links, plain
   buttons, galleries spilling everywhere). Chrome reported only 26 of ~180
   rules parsed.
2. A stray `}` at the end of the file can **balance a brace count while still
   corrupting the structure** — so counting braces is not sufficient.

Because of this, **do not trust a brace count alone.** Validate both ways:

```bash
python3 -c "
import re; css=open('css/styles.css').read()
print('raw', css.count('{'), css.count('}'))
s=re.sub(r'/\*.*?\*/','',css,flags=re.S)
print('clean', s.count('{'), s.count('}'))"
```

and, more importantly, **render it**: run headless Chrome and confirm the
stylesheet actually parsed plus the computed styles of a few key elements.
Every significant change in this project has been verified that way — after
static checks passed on broken CSS.

Two traps when doing that verification:
- **Always pass `--headless=new` when screenshotting.** Plain `--headless`
  ignores `--window-size` and silently writes a default-sized image, so pixel
  checks sample the wrong region and report nonsense.
- **Scope the rule count to our sheet.** `document.styleSheets[0]` is the
  cross-origin Google Fonts stylesheet and throws on `.cssRules`; loop for the
  sheet whose `href` contains `styles.css` instead.

**Also:**
- **Cache-bust after every CSS/JS change.** Pages load `css/styles.css?v=N`;
  bump `N` on all four pages or browsers serve a stale sheet. `js/events.js`
  carries its own `?v=`.
- **Keep `.hidden` working** — `[hidden] { display: none !important }` is
  deliberate; a display rule that outranks it resurrects grey placeholders under
  images that loaded fine.
- **Watermark stacking:** the watermark lives inside `.statement-wrap`, so the
  following sections are *siblings of the band*, not of the image. The lift rule
  targets `.statement-wrap ~ .section`. If the koru paints over the text, check
  that selector.
- **Direct `src` vs `data-src`:** content images use direct `src` and are left
  alone by `images.js`; only `data-src` images get a natural aspect ratio.

---

## 8. How to append

Add a new section at the top for substantive work, and update §5/§6 when
client-supplied values or outstanding items change. Keep this a **summary of
current state**, not a line-by-line history — compress or drop detail that no
longer affects future tasks.