# DESIGN-ANALYSIS.md — Ahi o te Manawa Website

This document describes the visual design system for the site: colour, typography, layout, spacing, logo/icon treatment, responsive behaviour, and accessibility guidance. It is self-contained and does not require viewing any image or PDF file.

---

## 1. Site Structure Covered By This Design System

The site has **four pages**, all sharing the same header (logo + navigation) and the same footer:

1. **Home**
2. **Purpose** (previously referred to as "About" — renamed per client instruction)
3. **Events**
4. **Contact** (content not yet supplied; use the same shared header/footer and general typographic rules below once content arrives)

The **Gallery** page/nav item has been removed entirely and must not appear anywhere in navigation, footer, sitemap, or routing.

---

## 2. Global Background

- Page background colour: **plain white**, `#FFFFFF`, on every page.
- Do not implement any gradient background — earlier design exports showed a grey diagonal gradient; this was a Canva artifact only and must not be built.

---

## 3. Confirmed Colour Palette

Two brand colours have been confirmed by the client:

| Name | Hex | Primary use |
|---|---|---|
| Brand Blue | `#7586a8` | Large statement heading on Home ("Connection Evolution Abundance Healing Love"); can also be used for link-hover states and minor accents |
| Brand Green | `#4c7031` | Tagline text ("Connecting hearts to Gaia"); pull-quote text; footer link hover state; small accent uses |

The following supporting neutral colours are **assumed** (not brand-confirmed) and should be treated as sensible defaults, adjustable later:

| Name | Hex | Use |
|---|---|---|
| White | `#FFFFFF` | Page background |
| Near-black | `#1A1A1A` | Logo lockup background box; footer background |
| Body text dark grey | `#2B2B2B` | Standard paragraph text |
| Secondary text grey | `#555555` | Testimonial/attribution text, captions |
| White (on dark) | `#FFFFFF` | Text sitting on the near-black logo box and footer |

Do not introduce any other accent colours (e.g. the teal/cyan guessed in earlier drafts) — the palette above is now final for build purposes unless the client supplies more colours later.

---

## 4. Typography

Single typeface: **Poppins** (Google Font), loaded in at least these weights: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold).

| Role | Weight | Approx. size (desktop) | Colour | Alignment |
|---|---|---|---|---|
| Nav items | SemiBold (600) | 16–18px | Near-black `#1A1A1A` (or white if nav sits on a dark bar) | left/right as laid out in header |
| Logo wordmark ("Ahi o te Manawa") | Bold (700) | 22–26px | White `#FFFFFF` (sits on near-black logo box) | left |
| Logo tagline ("Connecting hearts to Gaia") | Medium (500) | 11–12px | Brand Green `#4c7031` | left, under wordmark |
| Page H1 (e.g. "purpose of Ahi o te manawa", "Past Events") | Medium (500) | 22–26px | Near-black `#1A1A1A` | centre |
| Home's large statement row ("Connection Evolution Abundance Healing Love") | Bold (700) | 30–36px | Brand Blue `#7586a8` | centre |
| H2 section headings ("location", "the spaces", "Momentum", etc.) | Medium (500) | 18–20px | Near-black `#1A1A1A` | centre |
| H3 sub-item headings ("WWOOFing", "Archan Initiators") | Bold (700) | 16–18px | Near-black `#1A1A1A` | centre |
| Body paragraph text | Regular (400) | 14–16px | `#2B2B2B` | centre |
| Pull-quotes | Regular (400), larger line-height | 18–22px | Brand Green `#4c7031` | centre |
| Testimonial/attribution body text | Regular (400) | 13–14px | `#555555`, name line slightly bolder (Medium 500) | centre |
| Photo name captions ("Jay Bennett", "Jason Horton") | SemiBold (600) | 14–16px | `#2B2B2B` | centre, directly under photo |
| Footer text | Regular (400) | 13px | White `#FFFFFF` on near-black background | centre |

All body copy across every page is **centre-aligned** — this is a consistent, deliberate pattern and must be preserved site-wide, including in the footer.

---

## 5. Logo and Icon

- **Primary logo lockup**: a small icon (a spiral/koru line-art mark) placed to the left of the wordmark "Ahi o te Manawa", with the tagline "Connecting hearts to Gaia" beneath the wordmark in a smaller size. The whole lockup sits inside a rounded-corner, near-black (`#1A1A1A`) container box.
- On the Home page, this logo box floats over the top-left corner of the full-width hero photo.
- On Purpose, Events, and Contact pages (which reuse the shared header), place the same logo lockup at the top-left of the header in the same style, even though it will not sit over a hero photo on those pages (there is no hero photo on those three pages).
- No other icons or decorative graphic elements exist in the design. Do not add icon sets, dividers, or ornamental shapes beyond what's described in this document.
- No favicon was supplied. Use a simplified single-colour version of the koru icon as a placeholder favicon, in Brand Green `#4c7031` on transparent or white background.

---

## 6. Layout and Spacing

- **Content column:** single-column, centred layout. Max content width approx. 1100–1200px on desktop; content stays centred with equal side margins beyond that width.
- **Section spacing:** sections are separated purely by vertical whitespace (generous top/bottom padding, e.g. 60–100px between major sections) — no border lines, background colour blocks, or boxed containers around sections.
- **Photo rows:** where multiple images appear in a row (see ASSET-MANIFEST.md for exact counts per section), lay them out as equal-width thumbnails in a single horizontal row with small consistent gutters (e.g. 12–16px) and slightly rounded corners (e.g. 6–8px border-radius). Crop all images in a row to the same aspect ratio for visual consistency.
- **Two-column blocks:** the following are two-column layouts on desktop, image/content roughly 40–50% width each side:
  - Home → Kaitiaki guardian profiles: Jay Bennett is photo-left/text-right; Jason Horton is text-left/photo-right (an intentionally alternating layout — preserve this alternation, don't make both the same).
  - Events → Momentum section's secondary image pair (whiteboard photo + flip-chart photo) sits to the left of its testimonial text block.
  - Events → Togethering's closing block: poem on the left column, paragraph-plus-links on the right column.
- **Numbered list:** the "Small group workshops and retreats." requirements list should be implemented as a real ordered list (`<ol><li>...</li></ol>`), not as one run-on sentence with inline numerals as it appeared in the source draft.

---

## 7. Footer (New — Placeholder, To Be Updated Later)

No footer existed in the original design exports. Add a simple, minimal, easily-editable footer that appears on **every page** (Home, Purpose, Events, Contact):

**Structure (top to bottom or left to right, centred):**
1. Site name, small: "Ahi o te Manawa" (Poppins SemiBold, 14px, white)
2. Repeated nav links, centred, separated by a vertical bar or spacing: `home  purpose  events  contact` (Poppins Regular, 13px, white, hover colour Brand Green `#4c7031`)
3. Copyright line: `© 2026 Ahi o te Manawa. All rights reserved.` (Poppins Regular, 12px, white, slightly reduced opacity e.g. 70%)

**Styling:**
- Background: near-black `#1A1A1A` (matches the logo lockup box for visual consistency)
- Text: white `#FFFFFF`, centre-aligned, generous vertical padding (e.g. 40px top/bottom)
- Full page width

**Implementation note:** Mark this footer clearly in code comments as placeholder content, e.g. `<!-- Placeholder footer — update copyright year, add contact details/social links when supplied -->`, so it is easy for the client to find and edit later.

---

## 8. Desktop Responsive Behaviour

- Header (logo + nav) is fixed at the top; on the Home page it overlays the full-width hero photo, with the logo box pinned top-left and nav links top-right.
- As viewport width increases beyond the max content width, the centred content column stays fixed-width with equal white margins on each side; the hero photo and any full-bleed photo rows scale to fill the available width proportionally.
- Two-column blocks (guardian profiles, Togethering poem/paragraph split, Momentum image-pair + testimonial) stay side-by-side above the tablet breakpoint (see below).

---

## 9. Mobile / Responsive Recommendations

No mobile-specific design was supplied, so the following are standard responsive-design recommendations rather than transcribed specification:

- Below roughly 768px width, collapse the nav into a hamburger/mobile menu.
- On the Home page, avoid the logo box overlapping/clipping the hero image on narrow screens — stack the logo lockup above or below the hero image, or shrink it into a simplified inline mobile header.
- Photo rows (4-, 5-, and 3-image rows) should become either a horizontally scrollable strip or wrap into a 2-column grid on mobile, rather than compressing 4–5 images across a narrow screen.
- Two-column blocks should stack vertically (image above text, in source reading order) below the tablet breakpoint.
- The large Home statement row ("Connection Evolution Abundance Healing Love") should wrap onto multiple lines at a legible size rather than shrink to fit one line.
- Footer content should remain centred and stack vertically (site name, then nav links, then copyright) on narrow screens.

---

## 10. Navigation and Interactive Elements

- Nav bar contains four plain text links (after removing Gallery): **home, purpose, events, contact**. No icons, dropdowns, or buttons in the nav.
- No visible "active page" indicator existed in the source design. Recommend adding one (e.g. underline or Brand Green colour on the current page's nav item) for usability.
- No call-to-action buttons exist anywhere on Home, Purpose, or Events. All links throughout the site body are plain inline text hyperlinks pointing to third-party URLs (see CONTENT-MAP.md for the exact list). These should open in a new browser tab (`target="_blank" rel="noopener"`).
- No social icons exist in the supplied design.
- The Contact page will likely need a form, but no design has been supplied for it yet — do not invent form fields; wait for content/design before implementing anything beyond the shared header/footer shell.

---

## 11. Accessibility Considerations

- **Alt text:** author descriptive alt text for every image using the "Description" field provided in ASSET-MANIFEST.md as a starting point. The two photos with visible name captions (Jay Bennett, Jason Horton) should use that name in their alt text, e.g. `alt="Jay Bennett, guardian of Ahi o te Manawa"`.
- **Colour contrast:** Brand Green `#4c7031` and Brand Blue `#7586a8` are both used as text-on-white. Check both against WCAG AA contrast requirements (4.5:1 for body-size text, 3:1 for large/bold text ≥24px) once font sizes are finalised — Brand Blue on white in particular should be verified since medium-blue tones can sit close to the AA threshold at smaller sizes.
- **Heading order:** implement the hierarchy in this document (and in CONTENT-MAP.md) using real semantic `<h1>`–`<h3>` tags in document order, not styled `<div>`/`<span>` elements, so screen readers can navigate the page structure correctly.
- **Link text:** avoid bare "click here" — the source content already mostly uses full URLs or short descriptive lead-in phrases (e.g. "the listing is:", "More about Jason"); wrap these in descriptive anchor text during implementation rather than leaving raw URLs unstyled where practical.
- **Decorative images:** the Home hero photo and most Events photo-row images are illustrative rather than informational. Where an image conveys no unique information beyond decoration, it's acceptable to use `alt=""` — but where an image contains legible text (e.g. the "WELCOME MOMENTUM" whiteboard photo) or specific identifiable content relevant to the surrounding text (e.g. the "AHI O TE MANAWA" sign-and-dog photo), give it a real descriptive alt text instead.

---

## 12. Open Items Not Covered By This Analysis

- Exact Contact page layout/content — not yet supplied.
- Final favicon file — placeholder suggested in Section 5 above; awaiting a client-approved version.
- Any secondary/tertiary brand colours beyond the two confirmed here — none currently exist; do not add any.
