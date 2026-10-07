# Ahi o te Manawa — Website

A four-page static site built from the specification documents in this folder
(`DESIGN-ANALYSIS.md`, `CONTENT-MAP.md`, `ASSET-MANIFEST.md`,
`IMPLEMENTATION-PROMPT.md`). It has **no build step** — open any `.html` page
directly or serve the folder with a simple static server.

**Pages (nav order):** `home` · `purpose` · `events` · `contact`

```
index.html        – Home (hero, statement, photo strip, gallery, Kaitiaki guardians, Notes from the Land)
purpose.html      – Purpose (regenerative culture, opportunities, WWOOFing)
events.html       – Events (Upcoming Spaces + Past Events)
contact.html      – Contact (email, address, map, form)
admin/            – ★ browser Content Manager (Decap CMS) — see section 8
data/*.json        – ★ client-editable site and page content (edit via /admin)
css/styles.css    – shared design system (colours/type/layout)
js/config.js      – tiny loader that reads data/config.json into SITE_CONFIG
js/*.js           – behaviour (menu, images, gallery, rss, events, contact)
public/images/    – photo files (see "Photos" below)
netlify.toml      – Netlify deploy settings (publish dir, /admin redirect)
```

---

## 1) Upcoming Spaces — the Google Sheet events system

The "Upcoming Spaces at Ahi o te Manawa" cards are loaded automatically from a
**public Google Sheet** published as a CSV.

### One-time setup (one minute)

1. Open your Google Sheet with the columns below.
2. **File → Share → Publish to web →** choose the sheet → **Whole sheet** →
   **Comma-separated values (.csv)** → **Publish**.
3. Copy the published URL (ends in `/export?format=csv&id=...`).
4. Paste it into `EVENTS_CSV_URL` in `data/config.json` — easiest via the CMS
   (`/admin` → **Site settings → Events Google Sheet CSV URL**):

   ```json
   "EVENTS_CSV_URL": "https://docs.google.com/spreadsheets/d/e/.../pub?...&output=csv"
   ```

### The columns

| Column | What it means |
|---|---|
| `active` | `yes` (or `true` / `1`) shows the event. Anything else hides it. |
| `title` | Event name. |
| `start_date` | Start date, e.g. `2026-03-14` or `14/03/2026`. |
| `start_time` | Optional time / time range. |
| `end_date` | End date. **Recurring events stay visible until this date has passed** (or `active` = no). |
| `end_time` | Optional end time. |
| `is_recurring` | `yes` = the space carries a "recurring" badge, shows times only, and stays under "In Progress" even after its start date (until `active` = no or `end_date` elapses). |
| `recurrence_note` | Optional note shown on the card, e.g. `every full moon at the outdoor fire`. |
| `location` | Where it happens. |
| `type` | Optional small label shown on the card. |
| `description` | A short description (plain text; commas are fine inside quotes). |
| `image_url` | Optional. A full `https://` URL is preferred; a bare filename resolves against `public/images/`. Empty → a designed fallback panel. |
| `register_url` | Optional link. If present a "register your interest" button appears; if empty, no button. |
| `organiser` | Optional — shown as "held by …". |
| `notes_internal` | Internal only — never displayed on the site. |

### How the page behaves

Events are divided into three time groups on the page:

- **Upcoming Spaces** — `start_date` is today or in the future, sorted by start date.
- **In Progress** — `start_date` has passed but `end_date` is today or in the future. **Recurring spaces with no end date live here permanently** (they only move on when `active` = no, or an `end_date` is added and passes).
- **Past Spaces** — start and end have both elapsed. Only the **last 3** (most recently ended) are shown.

Other behaviour:

- **Recurring spaces** carry a small `↻ recurring` badge on the card.
- **Date display:** single-day spaces show `Thu, 15 Oct 2026 · 12:00 to 17:30`; multiday spaces show `Sat, 15 Aug 2026 · 12:00 to Thu, 8 Oct 2026 · 17:30`; recurring spaces show **times only** (`12:00 to 17:30`) — the sheet's `recurrence_note` tells users the day and frequency.
- **Empty:** if nothing is upcoming, a centred friendly message shows.
- **Error:** if the sheet can't be loaded, a clear error message shows.

### How to add / edit / publish / hide an event

- **Add:** insert a new row below the header row and fill in the columns.
- **Edit:** change the row's cells; the site reflects it on the next page load.
- **Publish:** set `active` to `yes`. Until you do, the event stays hidden.
- **Hide / retire:** set `active` to `no` (or empty). For a recurring event you can also let its `end_date` pass.
- **Past Spaces:** once start and end dates have both passed, the space moves to "Past Spaces" (last 3 shown). Recurring spaces with no end date instead stay under "In Progress".

> **Anything can break the card loading:** rows edited by hand, a missing sheet
> permission, or a changed column name. Keep the header row exactly as above.

---

## 2) Galleries (Home page) — Whare / Whenua / Tangata

Three clickable galleries sit before the "Kaitiaki : Guardians" section.
Thumbnails are a uniform square grid; clicking any photo opens a **full-size
pop-up carousel** for that section (on-screen arrows or ← → keys to move,
Esc to close).

- **Photo files** live in `public/images/gallery/whare/`, `…/whenua/` and
  `…/tangata/`.
- **Which photos appear, and in what order,** is listed in `js/config.js`
  under `GALLERY_SECTIONS` — each section has `title`, `subtitle`, `folder`
  and an `images` array of exact filenames:

  ```js
  GALLERY_SECTIONS: [
    {
      key: "whare", title: "whare", subtitle: "the house",
      folder: "whare",
      altPrefix: "Whare — inside the house at Ahi o te Manawa",
      images: [ "IMG_0959.jpeg", "bedroom1.JPG" /* … */ ]
    }
    /* … whenua, tangata … */
  ]
  ```

- **Add a photo:** drop the file into the matching folder, then add its exact
  filename to that section's `images` list.
- **Reorder or hide photos:** reorder or remove entries in the `images` list.
- Filenames with spaces are fine — they must match exactly, including case.

### Web-sized copies (important)

The original photos are very large (100–500+ MB total), so the site loads
**optimised WebP copies** generated by a helper script:

```bash
bash scripts/optimize-images.sh
```

This creates `public/images/gallery-web/<folder>/thumbs/` (max 640px, used in
the scrolling strips) and `…/full/` (max 2000px, used in the full-screen
overlay) as **`.webp`** (JPG copies are kept beside them as a fallback), adds a
`.webp` companion for every hero / home-strip / guardian / events image, and
regenerates `js/gallery-manifest.js` (which now lists `.webp` filenames).

The script needs `cwebp` from the WebP tools (`brew install webp` on macOS;
macOS `sips` can read but not write WebP). If `public/images/gallery/<folder>/`
is absent it falls back to re-encoding the existing `gallery-web` copies.

**Whenever you add photos to `public/images/gallery/<folder>/`, run the script
again** — new photos then appear in the strips automatically. Your originals
are never modified.

---

## 3) Notes from the Land — RSS card stack

Cards beneath the Kaitiaki/Guardians section preview recent posts from the
**Substack RSS feed** (up to 3).

- When the new Ahi o te Manawa Substack exists, paste its feed URL (usually
  `https://YOURNAME.substack.com/feed`) into `RSS_FEED_URL` — easiest in the
  CMS (`/admin` → **Site settings**) or directly in `data/config.json`.
- The preview cards shown in the meantime are placeholders. Browsers may block
  the cross-site feed (CORS); if cards don't populate, the feed origin must
  allow CORS or be served through a small proxy (note left in `js/rss.js`).
---

## 4) Contact page — email, address, map, form

Everything is set from `data/config.json` — edit it in the CMS
(`/admin` → **Site settings**) rather than by hand:

- `contactEmail` — the address shown and emailed (currently
  `hello@ahiotemanawa.nz`).
- `addressLines` — the physical address shown.
- `mapsEmbedSrc` — the **Google Maps embed URL** for the location. Get it on
  Google Maps: **Share → Embed a map → copy the
  `src="https://www.google.com/maps/embed?pb=..."` URL** and paste it here.
- `FORM_ENDPOINT` — where the form posts. For a simple no-backend option:
  1. Create a free form at **formspree.io**.
  2. Copy the endpoint (e.g. `https://formspree.io/f/abcxyz`) and paste it in
     the CMS (**Site settings → Contact form endpoint**).

**EmailJS:** the plan is to move the contact form to EmailJS. When the EmailJS
service keys are available, `js/contact.js` will be updated to send through
EmailJS instead of posting to `FORM_ENDPOINT`. Until then the Formspree-style
endpoint above is used.

Until each value is real, the page shows a friendly placeholder with a
`TODO:` marker.

---

## 5) Photos — what is showing now?

The design calls for **21 content images** (see `ASSET-MANIFEST.md`). Until the
real photo files are placed in `public/images/` at their exact manifest
filenames, the site automatically shows a **plain grey placeholder box** at the
correct size. Drop the files in with the right names (e.g.
`home-hero-lake-taupo.jpg`, `guardian-jay-bennett.jpg`) and they appear.
Everything else is untouched.

Placeholder `TODO:` notes remain in code for: the real logo
(`logo-ahiotemanawa.png`), Jay Bennett's personal URL, and the incomplete
"Land Goal" sentence (flagged in `CONTENT-MAP.md`).

---

## 6) Edit text / style

- **Text content:** edit in the CMS (`/admin` → **Pages**, pick a page and
  edit its HTML in place) or directly in the matching `.html` file. Content
  mirrors `CONTENT-MAP.md` exactly.
- **Colours, fonts, spacing:** `css/styles.css`, at the top ("Design tokens").
  Only the confirmed palette is used; do not add new accent colours without
  the client's sign-off.
- **Nav / footer links:** repeated on each page. The active page's nav item is
  underlined in the Brand Green.

---

## 7) Run locally

No install needed:

```bash
# from the project folder
python3 -m http.server 8000
```

Then open http://localhost:8000 . (The Google Sheet CSV and RSS/map embeds
fetch over the internet, so open via the server rather than a `file://` URL
when testing those.)

The admin UI also loads at http://localhost:8000/admin/ , but logging in needs
either the production Netlify Identity backend or the local proxy — see the
"Local development" notes in section 8.

---

## 8) Content Manager — Decap CMS (`/admin`)

The client edits the site through a browser UI at **`/admin`** (e.g.
`https://YOUR-SITE.netlify.app/admin/`). It runs
[Decap CMS](https://decapcms.org) (formerly Netlify CMS) straight from a CDN —
there is still **no build step**. The CMS is configured in `admin/config.yml`.

### What you can edit

| Collection | Edits | Notes |
|---|---|---|
| **Site settings** | `data/config.json` | Site name, tagline, contact email, address lines, Google Maps embed URL, contact form endpoint, events sheet URL, RSS feed URL, gallery sections. |
| **Pages** | `data/home.json`, `data/purpose.json`, `data/events.json`, `data/contact.json` | Friendly fields for the text shown on each page. The underlying layouts are protected. |
| **Media** | `public/images/` | Images uploaded through the CMS land here. |

The site remains plain static HTML with no build step. Each page has a matching
content file in `data/`; a small browser script places those field values into
the existing layout after the page loads. The original HTML copy remains as a
fallback if JavaScript is unavailable, while the layout, scripts, and image
paths are kept out of the CMS so routine edits cannot accidentally break them.

### Day-to-day editing

1. Open `/admin` and log in (email + password from the Netlify Identity
   invite).
2. Pick a collection:
   - **Site settings → Site configuration** — plain fields. Change a value,
     then press **Publish** (top right).
    - **Pages** — pick the page and fill in the labelled fields. Paragraph lists
      have an **Add** button for another paragraph and drag handles to reorder
      them. On the Purpose page, opportunities can include optional numbered
      requirements and a link. On the Events page, the *Past-event stories*
      section changes only the written stories; live upcoming events continue to
      come from the Google Sheet described in section 1. Press **Publish**.
3. **Every save is a Git commit** to `main` (e.g. "Update Pages · contact"),
   and the commit triggers a Netlify deploy. The live site updates once the
   deploy finishes — usually under a minute. Just refresh the page.

**Images:** use the media library (or an image field) to upload; files are
stored in `public/images/` and referenced as `/public/images/<filename>`.
Existing photo filenames are governed by `ASSET-MANIFEST.md` — never rename
them. New *gallery* photos additionally need `bash scripts/optimize-images.sh`
run locally (section 2) to create their `.webp` copies and refresh the gallery
manifest.

**Page photos and layout:** the CMS intentionally does not offer image or
layout controls on the Pages entries. Many existing photos use paired WebP and
original files, so replacing one safely needs a developer; this also protects
the site’s design from accidental structural changes.

### Logging in (Netlify Identity — one-time setup)

1. In Netlify: **Site configuration → Identity → Enable Identity**, with
   registration set to **Invite only**.
2. Still under Identity: **Git gateway → Enable Git Gateway** (this generates
   the access token the CMS uses to commit to GitHub).
3. **Identity → Invite users** → invite the client's email address. On the
   free Netlify plan, Identity email templates cannot be customised, so use
   the Identity dashboard's user-management flow or Google sign-in to finish
   account setup if an invite link only returns to the homepage.
4. The client then logs in at `/admin` — with email + password, or the
   **Google** button if enabled under Identity → External providers.

The Netlify Identity widget script is included in the `<head>` of
`admin/index.html`; it provides the login / set-password screens on `/admin`.
On paid Netlify plans, the optional custom email-template route is to point
invite links at `/admin/#invite_token={{ token }}`.

> If you later serve `/admin` from a domain other than the Netlify site URL,
> add `base_url: https://YOUR-SITE.netlify.app` under `backend:` in
> `admin/config.yml`.

### Local development

`admin/config.yml` normally talks to the production backend. To try the CMS
locally: uncomment `local_backend: true` at the bottom of `admin/config.yml`,
run `npx decap-server` alongside `python3 -m http.server 8000`, and open
`http://localhost:8000/admin/` — saves then write to the local files. Keep
`local_backend` commented out on production.

---

## 9) Deploying — GitHub → Netlify

The repo is plain static files, so Netlify needs no build command
(`netlify.toml` sets **publish directory = `.`** and a `/admin` redirect).

### One-time setup

1. **Create the GitHub repo** — github.com → *New repository* → **Public**,
   name e.g. `ahi-o-te-manawa` → **do not** tick "Add a README", .gitignore or
   licence.
2. **Connect and push** from this project folder:

   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/ahi-o-te-manawa.git
   git push -u origin main
   ```

3. **Import into Netlify** — app.netlify.com → *Add new site* → *Import an
   existing project* → GitHub → pick the repo → keep the auto-detected
   settings (build command: none; publish directory `.` comes from
   `netlify.toml`) → **Deploy**.
4. **Enable Identity + Git Gateway** (section 8 above) so `/admin` can log in.
5. (Optional) add your real domain under *Domain management* and update the
   canonical/og URLs in the HTML, `robots.txt` and `sitemap.xml` (the
   `www.ahiotemanawa.example` placeholders).

### Day to day

- **Client edits:** log in at `/admin`, change content, press **Publish** —
  that is a Git commit; Netlify redeploys automatically.
- **Developer edits:** edit locally, then `git pull --rebase` (to pick up any
  CMS edits), `git add … && git commit && git push` — Netlify redeploys.