/* ============================================================
   "Notes from the Land" — RSS card stack.

   Loads recent posts from SITE_CONFIG.RSS_FEED_URL (a Substack
   RSS feed, see js/config.js) and renders them as elegant preview
   cards that link through to each article.

   NOTE: browsers block cross-origin RSS (CORS). Until a CORS-enabled
   endpoint / proxy is configured, or the client-hosted feed allows
   CORS, we render graceful preview cards that still deep-link the
   site. See TODO below and README.md.
   ============================================================ */
(function () {
  var stack = document.getElementById("rss-stack");
  var state = document.getElementById("rss-state");
  if (!stack) return;

  var cfg = (typeof SITE_CONFIG !== "undefined") ? SITE_CONFIG : null;
  var feedUrl = (cfg && cfg.RSS_FEED_URL) || "";
  var MAX_CARDS = 3;

  /* Placeholder previews shown while the real Substack is being
     created / until a CORS-friendly feed is available (TODO). */
  var PREVIEW_CARDS = [
    {
      issue: "letter from the land",
      title: "seasons turning on the volcanic rim",
      text: "regeneration, planting and the slow stories of the land as spring arrives at Ahi o te Manawa.",
      href: feedUrl
    },
    {
      issue: "letter from the land",
      title: "gathering at the fire circle",
      text: "reflections on circle, community and the practice of slowing down enough to hear the heart.",
      href: feedUrl
    },
    {
      issue: "letter from the land",
      title: "the spaces we keep",
      text: "a walk through the cabin, the workshop and the things that hold this place together.",
      href: feedUrl
    }
  ];

  function makeCard(item) {
    var card = document.createElement("article");
    card.className = "rss-card";

    var issue = document.createElement("p");
    issue.className = "rss-issue";
    issue.textContent = item.issue || "Ahi o te Manawa";
    card.appendChild(issue);

    var title = document.createElement("h4");
    title.textContent = item.title || "untitled";
    card.appendChild(title);

    var text = document.createElement("p");
    text.textContent = item.text || "";
    card.appendChild(text);

    var link = document.createElement("a");
    link.className = "btn";   /* filled button (site-wide solid button style) */
    link.href = item.href || feedUrl;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = (item.href && item.href !== feedUrl) ? "read more" : "read notes";
    card.appendChild(link);

    return card;
  }

  function setState(message) {
    if (state) state.textContent = message;
  }

  function renderPreviews() {
    stack.textContent = "";
    PREVIEW_CARDS.slice(0, MAX_CARDS).forEach(function (p) {
      stack.appendChild(makeCard(p));
    });
    setState("");
  }

  function parseFeed(dom) {
    /* Try RSS 2.0 channel/item then Atom feed/entry. */
    var items = [];
    var entries = dom.querySelectorAll("channel > item, feed > entry");
    for (var i = 0; i < entries.length && items.length < MAX_CARDS; i++) {
      var e = entries[i];
      var get = function (sel) {
        var n = e.querySelector(sel);
        return n ? (n.textContent || "").trim() : "";
      };
      items.push({
        issue: (get("category") || get("link")).slice(0, 48),
        title: get("title"),
        text: stripHtml(get("description") || get("summary")).slice(0, 200),
        href: get("link")
      });
    }
    return items;
  }

  function stripHtml(s) {
    if (!s) return "";
    return String(s)
      .replace(/<[^>]*>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function renderItems(items) {
    stack.textContent = "";
    items.slice(0, MAX_CARDS).forEach(function (it) {
      stack.appendChild(
        makeCard({
          issue: it.issue || "notes from the land",
          title: it.title,
          text: it.text,
          href: it.href
        })
      );
    });
    setState("");
  }

  function onError(message) {
    setState(message);
    renderPreviews();

    /* TODO: the real Substack feed is not yet created, and/or this
       origin must allow CORS (or route through a small proxy). Point
       SITE_CONFIG.RSS_FEED_URL at the new feed and enable CORS to
       populate these cards automatically. */
  }

  if (!feedUrl) {
    onError("");
    return;
  }

  setState("loading the latest notes…");

  fetch(feedUrl, { headers: { Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*" } })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    })
    .then(function (xml) {
      var dom = new DOMParser().parseFromString(xml, "text/xml");
      if (dom.querySelector("parsererror")) throw new Error("bad xml");
      var items = parseFeed(dom);
      if (!items.length) throw new Error("empty feed");
      renderItems(items);
    })
    .catch(function () {
      onError("the latest letters are taking a moment to arrive — enjoy these notes meantime.");
    });
})();