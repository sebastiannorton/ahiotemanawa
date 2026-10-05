# IMPLEMENTATION-PROMPT.md — Ahi o te Manawa Website Build

You are a coding agent working inside VS Code. You do not have image or PDF viewing capability. Do not attempt to open, render, or reference any image or PDF file to understand layout or design — everything you need is written out in text below and in the three companion specification files listed in Section 0. Treat those three files, plus this one, as your complete and only source of truth.

---

## 0. Required Reading Before You Start

This project folder contains three companion specification documents. Read all three in full before writing any code:

1. **DESIGN-ANALYSIS.md** — colours, typography, layout/spacing rules, logo/footer treatment, responsive behaviour, accessibility rules.
2. **CONTENT-MAP.md** — the exact, final, corrected text content for every page and section, in the exact order it must appear.
3. **ASSET-MANIFEST.md** — the full list of image assets, their target filenames, where each one is placed, and alt-text drafts.

This file (IMPLEMENTATION-PROMPT.md) tells you how to assemble those three documents into a working site. Do not invent content, colours, copy, or layout choices not described in these four files. If something is genuinely unspecified, leave a clearly marked placeholder and a `TODO:` comment in the code rather than guessing.

---

## 1. Project Summary

Build a 4-page marketing/informational website for "Ahi o te Manawa," a retreat/land site in New Zealand. Pages, in nav order:

1. **Home** (`/` or `index.html`)
2. **Purpose** (`/purpose`)
3. **Events** (`/events`)
4. **Contact** (`/contact`) — shell only for now; see Section 7.

There is **no Gallery page**. Do not create a gallery route, nav item, or footer link.

---

## 2. Tech Assumptions

Unless the existing project scaffold says otherwise, assume:

- Plain static HTML/CSS (or the framework already present in this repository — check for an existing `package.json`, framework config, or component folder before choosing a stack; if one exists, follow its conventions instead of introducing a new one).
- One shared header component (logo + nav) and one shared footer component, included on all four pages.
- Google Font **Poppins** loaded via `<link>` to Google Fonts (or self-hosted if the project already self-hosts fonts), weights 400, 500, 600, 700.
- No JavaScript framework is required for the content in Sections 4–6 below (all content is static); only add interactivity for a mobile nav toggle (hamburger menu) if one is not already provided by the existing project scaffold.

---

## 3. Global Rules (apply to every page)

- Page background: solid white, `#FFFFFF`. Do not add any gradient background.
- Font: Poppins throughout, no secondary typeface. Follow the weight/size table in DESIGN-ANALYSIS.md Section 4.
- Body copy is centre-aligned on every page — do not left-align paragraph text.
- Colours to use, exactly as specified (do not substitute or approximate):
  - Brand Blue: `#7586a8`
  - Brand Green: `#4c7031`
  - White: `#FFFFFF`
  - Near-black: `#1A1A1A`
  - Body text grey: `#2B2B2B`
  - Secondary/testimonial text grey: `#555555`
- Implement headings using real semantic tags (`<h1>`, `<h2>`, `<h3>`) in document order per CONTENT-MAP.md — do not fake headings with styled `<div>`/`<span>` elements.
- All third-party outbound links (WWOOF listing, Substack articles, personal sites) must open in a new tab: `target="_blank" rel="noopener"`.
- Add `alt` text to every image using the drafts provided in ASSET-MANIFEST.md Section 5.

---

## 4. Shared Header

Build one shared header component, included at the top of every page:

- Logo lockup on the left: icon + wordmark "Ahi o te Manawa" + tagline "Connecting hearts to Gaia" underneath, inside a rounded-corner near-black (`#1A1A1A`) box. Use the image asset `logo-ahiotemanawa.png` (see ASSET-MANIFEST.md) if present in the project's asset folder; otherwise render the wordmark and tagline as styled text inside the box as a placeholder until the logo image is supplied.
  - Wordmark colour: white `#FFFFFF`, Poppins Bold, ~22–26px.
  - Tagline colour: Brand Green `#4c7031`, Poppins Medium, ~11–12px.
- Navigation on the right, four plain text links in this exact order and label text: `home` `purpose` `events` `contact`. Poppins SemiBold, ~16–18px. Link targets:
  - `home` → Home page
  - `purpose` → Purpose page
  - `events` → Events page
  - `contact` → Contact page
- On the Home page only, this header sits overlaid on top of the full-width hero image (`home-hero-lake-taupo.jpg`, see Section 5). On the Purpose, Events, and Contact pages, render the same header as a plain bar at the top of the page (no hero image behind it on those three pages).
- Add an "active page" style to whichever nav link matches the current page (e.g. underline it or colour it Brand Green `#4c7031`) — this was not in the original design but is a recommended usability addition per DESIGN-ANALYSIS.md Section 10.
- Below roughly 768px viewport width, collapse the nav links into a hamburger/mobile menu toggle.

---

## 5. Shared Footer

Build one shared footer component, included at the bottom of every page:

```html
<footer>
  <!-- Placeholder footer — update copyright year, add contact details/social links when supplied -->
  <p class="footer-sitename">Ahi o te Manawa</p>
  <nav class="footer-nav">
    <a href="/">home</a>
    <a href="/purpose">purpose</a>
    <a href="/events">events</a>
    <a href="/contact">contact</a>
  </nav>
  <p class="footer-copyright">© 2026 Copyleft CC BY-SA Ahi o te Manawa. All rights reserved.</p>
</footer>
```

Styling:
- Background: near-black `#1A1A1A`, full page width.
- All text centred, white `#FFFFFF`.
- Site name: Poppins SemiBold, 14px.
- Nav links: Poppins Regular, 13px, hover colour Brand Green `#4c7031`.
- Copyright line: Poppins Regular, 12px, ~70% opacity.
- Vertical padding approx. 40px top and bottom.
- Keep the HTML comment in place so the client can find this section to edit later.

---

## 6. Page-by-Page Build Instructions

For every page below, insert the **exact text** from CONTENT-MAP.md — do not paraphrase, shorten, or reformat wording beyond what CONTENT-MAP.md already specifies (e.g. the ordered list conversion noted there). Section numbers below refer to CONTENT-MAP.md sections.

### 6.1 Home Page (CONTENT-MAP.md Section 4)

Build sections in this exact order:

1. Shared header (Section 4, overlaid on hero image)
2. Hero image: use asset `home-hero-lake-taupo.jpg` (ASSET-MANIFEST.md IMAGE_01) as a full-width `object-fit: cover` banner, approx. 400–500px tall on desktop. If the file isn't present yet in the assets folder, render a plain grey placeholder block of the same dimensions with a `TODO:` comment.
3. `<h1>` (styled large, Brand Blue `#7586a8`, Bold, centred): the "Large statement heading" text from CONTENT-MAP.md 4.2.
4. Pull-quote 1 (Brand Green `#4c7031`, centred, larger line-height) — text from CONTENT-MAP.md 4.2.
5. Photo strip: 4 images in an equal-width horizontal row with small gutters and rounded corners, using assets `home-strip-group-01.jpg`, `home-strip-diningtable-02.jpg`, `home-strip-signpost-dog-03.jpg`, `home-strip-threemen-04.jpg` in that exact order (ASSET-MANIFEST.md IMAGE_02–IMAGE_05).
6. `<p>` — the "(About)" intro line.
7. `<h2>location</h2>` + paragraph.
8. `<h2>the spaces</h2>` + paragraph (preserve the internal blank-line paragraph breaks shown in CONTENT-MAP.md as separate `<p>` tags or line breaks).
9. `<h2>the people</h2>` + paragraph.
10. Pull-quote 2 (same styling as pull-quote 1).
11. `<h2>Kaitiaki : Guardians</h2>`
12. Guardian profile block 1: image `guardian-jay-bennett.jpg` on the **left**, text block on the **right** (desktop), name caption "Jay Bennett" directly under the photo.
13. Guardian profile block 2: text block on the **left**, image `guardian-jason-horton.jpg` on the **right** (desktop), name caption "Jason Horton" directly under the photo. (Note the layout deliberately alternates from block 1 — do not make both profiles the same layout.)
14. Shared footer.

Special handling: Jay Bennett's text contains the line `you can find out more about me here: www.jay.........................` — this is an incomplete placeholder URL in the source content, not a real link. Render it as plain text (not a hyperlink) and add a `TODO:` comment noting the real URL is still needed from the client.

### 6.2 Purpose Page (CONTENT-MAP.md Section 5)

Build sections in this exact order:

1. Shared header
2. `<h1>purpose of Ahi o te manawa</h1>`
3. Intro paragraph (CONTENT-MAP.md 5.2)
4. `<h2>Context</h2>` + line "Radical responsibility."
5. `<h2>Landcare</h2>` + paragraph
6. Land Goal line — render as a standalone centred paragraph: `that the land "owns" itself and that a not for profit`. Do not add or invent words to complete this sentence; it is flagged as an open item in CONTENT-MAP.md Section 8.
7. `<h2>Opportunities</h2>`
8. `<h3>Archan Initiators</h3>` + paragraph
9. `<h3>Artists & Writers</h3>` + paragraph
10. `<h3>Small group workshops and retreats.</h3>` + intro line + a real `<ol><li>...</li></ol>` with the three numbered requirements exactly as written in CONTENT-MAP.md 5.2 (do not render them as one inline sentence).
11. `<h3>WWOOFing</h3>` + paragraph + hyperlink to `https://wwoof.nz/profile/?mid=296971&ref=s` (link text: the URL itself, per source; opens in new tab).
12. `<h3>Warmshowers</h3>` + line.
13. Shared footer.

No images exist on this page — do not add any.

### 6.3 Events Page (CONTENT-MAP.md Section 6)

Build sections in this exact order:

1. Shared header
2. `<h1>Past Events</h1>`
3. **Momentum** block:
   - `<h2>Momentum</h2>`
   - Photo row: 4 images in equal-width row — `events-momentum-group-dog-01.jpg`, `events-momentum-trail-umbrella-02.jpg`, `events-momentum-stream-feet-03.jpg`, `events-momentum-gardening-04.jpg` (in that order)
   - Description paragraph
   - Two-column sub-block: left column contains images `events-momentum-whiteboard-welcome.jpg` and `events-momentum-flipchart-writing.jpg` stacked or side-by-side; right column contains the testimonial text ending in "— Martin Salanda"
4. **Gaian Mens Bridge House** block:
   - `<h2>Gaian Mens Bridge House</h2>`
   - Photo row: 5 images in equal-width row — `events-gmbh-group-hats-01.jpg`, `events-gmbh-portrait-mud-02.jpg`, `events-gmbh-garden-build-03.jpg`, `events-gmbh-table-flowers-04.jpg`, `events-gmbh-hike-mountain-05.jpg` (in that order)
   - Description paragraph
   - Testimonial block, ending "— Leonhard Geupel"
   - Testimonial block, ending "— Martin Salanda"
5. **Togethering** block:
   - `<h2>Togethering</h2>`
   - Photo row: 3 images in equal-width row — `events-togethering-deck-group-01.jpg`, `events-togethering-bw-van-02.jpg`, `events-togethering-table-indoor-03.jpg` (in that order)
   - Description paragraph, including the inline hyperlink to `https://jaybennett.substack.com/p/stories-of-the-mens-bridgehouse` (link text: "wrote this article about it")
   - Two-column closing block: **left column** = the Benjamin Pollitt poem (preserve line breaks and stanza breaks exactly as shown in CONTENT-MAP.md, ending "— Benjamin Pollitt"); **right column** = the closing paragraph plus two labelled links: "An archan research centre" → `https://ahiotemanawa.mystrikingly.com/`, and "a Mens 'togethering' bridgehouse" → `https://jaybennett.substack.com/p/stories-of-the-mens-bridgehouse?r=2hmo35`
6. Shared footer.

### 6.4 Contact Page

Content has not been supplied yet. Build only:

1. Shared header
2. `<h1>Contact</h1>` (placeholder heading; update once real content/design is supplied)
3. A short `TODO:` comment: `<!-- TODO: Contact page content and form fields not yet specified — awaiting client content -->`
4. Shared footer

Do not invent a contact form, phone number, email address, or map embed — none of these were supplied in any specification document.

---

## 7. Responsive Build Rules

Implement per DESIGN-ANALYSIS.md Sections 8–9:

- Breakpoint: collapse nav to a hamburger menu below ~768px width.
- On mobile, stack the Home page logo box and hero image so they don't overlap/clip — place the logo lockup above or below the hero image, or use a simplified inline mobile header.
- Photo rows (4-, 5-, and 3-image rows) should become either a horizontally scrollable strip or wrap into a 2-column grid below ~768px, instead of squeezing 4–5 images across a narrow screen.
- Two-column blocks (guardian profiles, Momentum image-pair + testimonial, Togethering poem/paragraph split) stack vertically on mobile — image/photo content above, text below, in the same reading order as desktop.
- The Home page's large statement heading should wrap onto multiple lines rather than shrink below a legible size (do not go below roughly 20px on mobile).
- Footer content stacks vertically (site name, then nav links, then copyright) on narrow screens, staying centred.

---

## 8. Accessibility Checklist

- Every `<img>` has descriptive `alt` text (see ASSET-MANIFEST.md Section 5 for drafts); purely decorative images may use `alt=""`.
- Headings follow a logical, non-skipping order on each page (`h1` → `h2` → `h3`), matching the structure in CONTENT-MAP.md.
- All interactive elements (nav links, footer links, body hyperlinks) are reachable and operable via keyboard (standard `<a>` tags satisfy this; do not implement links as non-focusable `<div>` click handlers).
- Verify Brand Blue (`#7586a8`) and Brand Green (`#4c7031`) text meet WCAG AA contrast against the white background at the font sizes used; if a specific use fails contrast, darken that instance slightly rather than changing the brand hex values site-wide, and note the adjustment in a code comment.

---

## 9. What Not To Do

- Do not create a Gallery page, nav item, or route.
- Do not add colours beyond the palette in Section 3 above.
- Do not add a secondary font — Poppins only.
- Do not invent Contact page content.
- Do not "fix" or reorder the Home vs. Purpose page content relative to what's specified in CONTENT-MAP.md — their current structure is intentional and confirmed by the client.
- Do not complete or guess the wording of the incomplete "Land Goal" sentence or Jay Bennett's placeholder URL — leave both exactly as instructed in Sections 6.1 and 6.2 above, with `TODO:` comments.
- Do not reference, open, or attempt to interpret any image or PDF file to determine layout — this document and its three companions are the complete specification.

---

## 10. Definition of Done

- All four pages exist and are reachable from the shared nav and footer.
- Shared header and footer render identically (aside from the Home-page hero overlay) on all four pages.
- All text on Home, Purpose, and Events matches CONTENT-MAP.md exactly, including the correction log changes.
- All 21 content images plus the logo are referenced at the exact filenames listed in ASSET-MANIFEST.md, in the exact order and positions specified (using placeholder boxes where the real file is not yet present).
- No Gallery references remain anywhere in code, nav, footer, or routing.
- Site passes a basic responsive check at common breakpoints (mobile ~375px, tablet ~768px, desktop ~1200px+) per Section 7.
- Two `TODO:` items remain clearly marked in code: Jay Bennett's real URL, and full Contact page content.
