/* ============================================================
   Events system — loads a publicly published Google Sheet CSV.

   Sheet columns (header row, exact names):
     active, title, start_date, start_time, end_date, end_time,
     is_recurring, recurrence_note, location, type, description,
     image_url, register_url, organiser, notes_internal

   Rules implemented here (see README.md for the client workflow):
     - only rows with active = yes/true/1 are shown
     - three time groups: "Upcoming Spaces" (start today/future),
       "In Progress" (start elapsed, end today/future — this is where
       recurring spaces with no end date live), "Past Spaces"
       (start and end both elapsed; last 3 shown)
     - recurring spaces show a badge; when formatting dates they show
       times only (the recurrence note carries day/frequency)

   Config: SITE_CONFIG.EVENTS_CSV_URL (js/config.js).
   ============================================================ */
(function () {
  if (!document.getElementById("event-grid")) return;

  var cfg = (typeof SITE_CONFIG !== "undefined") ? SITE_CONFIG : null;
  var CSV_URL = (cfg && cfg.EVENTS_CSV_URL) || "";
  var MAX_PAST = 3;

  var COLUMNS = [
    "active", "title", "start_date", "start_time", "end_date", "end_time",
    "is_recurring", "recurrence_note", "location", "type", "description",
    "image_url", "register_url", "organiser", "notes_internal"
  ];

  function truthy(v) {
    v = String(v || "").trim().toLowerCase();
    return v === "true" || v === "yes" || v === "1";
  }

  /* ---------- CSV parsing (handles commas inside quotes) ---------- */
  function parseCSV(text) {
    var rows = [];
    var row = [];
    var field = "";
    var inQuotes = false;
    var i = 0;
    var s = String(text || "");
    while (i < s.length) {
      var ch = s[i];
      if (inQuotes) {
        if (ch === '"') {
          if (i + 1 < s.length && s[i + 1] === '"') {
            field += '"';
            i += 2;
            continue;
          }
          inQuotes = false;
          i++;
          continue;
        }
        field += ch;
        i++;
        continue;
      }
      if (ch === '"') {
        inQuotes = true;
        i++;
        continue;
      }
      if (ch === ",") {
        row.push(field);
        field = "";
        i++;
        continue;
      }
      if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && i + 1 < s.length && s[i + 1] === "\n") i++;
        row.push(field);
        field = "";
        if (row.length) rows.push(row);
        row = [];
        i++;
        continue;
      }
      field += ch;
      i++;
    }
    row.push(field);
    if (row.length) rows.push(row);
    return rows;
  }

  /* ---------- row -> event object ---------- */
  function toEvents(rows) {
    if (!rows.length) return [];
    var header = rows[0].map(function (h) { return String(h).trim().toLowerCase(); });
    var idx = {};
    COLUMNS.forEach(function (col) { idx[col] = header.indexOf(col.toLowerCase()); });

    var events = [];
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r];
      if (row.length === 1 && String(row[0]).trim() === "") continue;
      var cell = function (col) {
        var i = idx[col];
        return i !== undefined && i >= 0 && i < row.length ? String(row[i]).trim() : "";
      };

      if (!truthy(cell("active"))) continue; /* rule 14 */

      events.push({
        title: cell("title"),
        startDate: cell("start_date"),
        startTime: cell("start_time"),
        endDate: cell("end_date"),
        endTime: cell("end_time"),
        recurring: truthy(cell("is_recurring")) || cell("recurrence_note") !== "",
        recurrenceNote: cell("recurrence_note"),
        location: cell("location"),
        type: cell("type"),
        description: cell("description"),
        imageUrl: cell("image_url"),
        registerUrl: cell("register_url"),
        organiser: cell("organiser")
      });
    }
    return events;
  }

  /* ---------- dates ---------- */
  function parseDate(s) {
    s = String(s || "").trim();
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
    if (m) return new Date(+m[1], m[2] - 1, +m[3]);
    /* NZ style DD/MM/YYYY (also tolerates MM/DD ambiguity as DD/MM) */
    m = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/.exec(s);
    if (m) {
      var y = +m[3];
      if (y < 100) y += 2000;
      return new Date(y, m[2] - 1, +m[1]);
    }
    var d = new Date(s);
    if (isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function endOf(e) {
    return parseDate(e.endDate) || parseDate(e.startDate);
  }

  /* recurring spaces: only an explicit end_date can move them on */

  function sortChronologically(events) {
    return events.slice().sort(function (a, b) {
      var da = parseDate(a.startDate), db = parseDate(b.startDate);
      if (!da) return 1;
      if (!db) return -1;
      return da.getTime() - db.getTime();
    });
  }

  /* ---------- three time groups ----------
     Upcoming: start_date is today or in the future.
     In Progress: start elapsed but end_date is today/future
       (recurring with no end date lives here — ongoing).
     Past: start and end both elapsed. */
  function partition(events) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var todayMs = today.getTime();

    var upcoming = [];
    var inProgress = [];
    var past = [];
    events.forEach(function (e) {
      var start = parseDate(e.startDate);
      var end = parseDate(e.endDate);

      if (start && start.getTime() >= todayMs) { upcoming.push(e); return; }
      if (e.recurring && !end) { inProgress.push(e); return; } /* ongoing */
      var effectiveEnd = end || start;
      if (effectiveEnd && effectiveEnd.getTime() >= todayMs) { inProgress.push(e); return; }
      past.push(e);
    });
    return { upcoming: upcoming, inProgress: inProgress, past: past };
  }

  /* ---------- image resolution (rule 11) ----------
     Full URLs are preferred; a bare filename resolves against
     public/images/. Empty -> designed fallback treatment. */
  function resolveImage(u) {
    u = String(u || "").trim();
    if (!u) return "";
    if (/^https?:\/\//i.test(u)) return u;
    if (/^public\//i.test(u)) return u;
    if (/^\//.test(u)) return u.slice(1);
    return "public/images/" + u;
  }

  function fallbackContent() {
    var wrap = document.createElement("div");
    wrap.style.cssText =
      "display:flex;align-items:center;justify-content:center;" +
      "flex-direction:column;gap:.5rem;height:100%;background:#ece9de";
    var leaf = document.createElement("span");
    leaf.setAttribute("aria-hidden", "true");
    leaf.style.cssText = "color:var(--brand-green);font-size:1.6rem";
    leaf.textContent = "\u2618"; /* shamrock — Aotearoa leaf motif */
    var label = document.createElement("span");
    label.style.cssText = "color:var(--secondary)";
    label.textContent = "Ahi o te Manawa";
    wrap.appendChild(leaf);
    wrap.appendChild(label);
    return wrap;
  }

  function fmtWhen(e) {
    var opts = { weekday: "short", day: "numeric", month: "short", year: "numeric" };
    var start = parseDate(e.startDate);
    var end = parseDate(e.endDate);

    /* recurring: times only — the note carries day/frequency */
    if (e.recurring) {
      var times = [];
      if (e.startTime) times.push(e.startTime);
      if (e.endTime) times.push(e.endTime);
      return times.length ? times.join(" to ") : "";
    }

    var dateStr = start
      ? start.toLocaleDateString("en-NZ", opts)
      : String(e.startDate || "");

    /* single day: "Thu, 15 Oct 2026 · 12:00 to 17:30" */
    var sameDay = !end || (start && end.getTime() === start.getTime());
    var out = dateStr;
    if (e.startTime) out += " \u00b7 " + e.startTime;

    /* multiday: "Sat, 15 Aug 2026 · 12:00 to Thu, 8 Oct 2026 · 17:30" */
    var tail = [];
    if (!sameDay && end) tail.push(end.toLocaleDateString("en-NZ", opts));
    if (e.endTime) tail.push(e.endTime);
    if (tail.length) out += " to " + tail.join(" \u00b7 ");

    return out;
  }

  /* ---------- reusable EventCard (rule 7) ---------- */
  function EventCard(e, isPrevious) {
    var card = document.createElement("article");
    card.className = "event-card";

    var cell = document.createElement("div");
    cell.className = "asset";
    cell.setAttribute("data-fixed-ratio", "card");
    card.appendChild(cell);

    var url = resolveImage(e.imageUrl);
    if (url) {
      var img = document.createElement("img");
      img.alt = (e.title || "Event") + " at Ahi o te Manawa";
      img.decoding = "async";
      /* remote images: don't send a referrer (imgur & friends are
         referer-sensitive) and never lazy-load the card hero */
      if (/^https?:\/\//i.test(url)) {
        img.referrerPolicy = "no-referrer";
      } else {
        img.loading = "lazy";
      }
      img.addEventListener("error", function () {
        cell.innerHTML = "";
        cell.appendChild(fallbackContent());
      });
      img.src = url;
      cell.appendChild(img);
    } else {
      cell.appendChild(fallbackContent());
    }

    var body = document.createElement("div");
    body.className = "event-body";

    if (e.recurring) {
      var badge = document.createElement("span");
      badge.className = "event-badge";
      badge.textContent = "\u21bb recurring";
      body.appendChild(badge);
    }

    if (e.type) {
      var cat = document.createElement("p");
      cat.className = "event-cat";
      cat.textContent = e.type;
      body.appendChild(cat);
    }

    var title = document.createElement("h3");
    title.className = "event-title";
    title.textContent = e.title || "Untitled";
    body.appendChild(title);

    var whenTxt = fmtWhen(e);
    if (whenTxt) {
      var when = document.createElement("p");
      when.className = "event-date";
      when.textContent = whenTxt;
      body.appendChild(when);
    }

    if (e.recurring && e.recurrenceNote) {
      var rec = document.createElement("p");
      rec.className = "event-recurrence";
      rec.textContent = e.recurrenceNote;
      body.appendChild(rec);
    }

    if (e.description) {
      var desc = document.createElement("p");
      desc.className = "event-desc";
      desc.textContent = e.description;
      body.appendChild(desc);
    }

    if (e.location) {
      var loc = document.createElement("p");
      loc.className = "event-location";
      loc.textContent = e.location;
      body.appendChild(loc);
    }

    if (e.organiser) {
      var org = document.createElement("p");
      org.className = "event-organiser";
      org.textContent = "held by " + e.organiser;
      body.appendChild(org);
    }

    /* rule 10: button only when register_url is present */
    if (e.registerUrl) {
      var a = document.createElement("a");
      a.className = "btn event-booking";
      a.href = e.registerUrl;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = isPrevious ? "see this space" : "register your interest";
      body.appendChild(a);
    }

    card.appendChild(body);
    return card;
  }

  /* ---------- rendering (rules 8, 9, 13) ---------- */
  function renderGrid(gridId, events, isPast) {
    var grid = document.getElementById(gridId);
    if (!grid) return;
    var frag = document.createDocumentFragment();
    events.forEach(function (e) {
      frag.appendChild(EventCard(e, isPast));
    });
    grid.appendChild(frag);
  }

  function render(groups) {
    var grid = document.getElementById("event-grid");
    if (!groups.upcoming.length) {
      var empty = document.createElement("p");
      empty.className = "event-state";
      empty.textContent =
        "There are no upcoming spaces open just now \u2014 check back soon.";
      grid.appendChild(empty);
    } else {
      renderGrid("event-grid", groups.upcoming, false);
    }

    /* In Progress */
    var ipSec = document.getElementById("events-inprogress");
    var ipGrid = document.getElementById("inprogress-event-grid");
    var showIP = groups.inProgress.length && ipSec && ipGrid;
    if (ipSec) ipSec.hidden = !showIP;
    if (showIP) renderGrid("inprogress-event-grid", groups.inProgress, false);

    /* Past Spaces: last 3, most recently ended first */
    var pastSec = document.getElementById("events-past");
    var pastGrid = document.getElementById("past-event-grid");
    var showPast = groups.past.length && pastSec && pastGrid;
    if (pastSec) pastSec.hidden = !showPast;
    if (showPast) {
      var pastDesc = groups.past.slice().sort(function (a, b) {
        var ea = endOf(a), eb = endOf(b);
        return (eb ? eb.getTime() : 0) - (ea ? ea.getTime() : 0);
      }).slice(0, MAX_PAST);
      renderGrid("past-event-grid", pastDesc, true);
    }
  }

  function showError() {
    var grid = document.getElementById("event-grid");
    var p = document.createElement("p");
    p.className = "event-state";
    p.setAttribute("role", "alert");
    p.textContent =
      "The event list could not be loaded right now. Please try again soon, or contact us directly.";
    grid.appendChild(p);
  }

  /* ---------- main ---------- */
  function load() {
    if (!CSV_URL || CSV_URL.indexOf("example.com") !== -1 || CSV_URL.indexOf("PLACEHOLDER") !== -1) {
      showError();
      return;
    }
    fetch(CSV_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (csv) {
        var groups = partition(toEvents(parseCSV(csv)));
        render({
          upcoming: sortChronologically(groups.upcoming),
          inProgress: sortChronologically(groups.inProgress),
          past: groups.past
        });
      })
      .catch(function () {
        showError();
      });
  }

  load();
})();