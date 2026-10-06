/* ============================================================
   Shared site configuration loader.

   The client-changeable values now live in data/config.json so
   they can be edited from the browser admin UI (/admin → "Site
   settings"). This file is a small synchronous loader: it is the
   first script on every page, and it must block until the JSON
   has been read so SITE_CONFIG is ready for every script below.
   See README.md for instructions.
   ============================================================ */
"use strict";

const SITE_CONFIG = (function () {
  try {
    /* Synchronous request — classic scripts run in order, so blocking
       here guarantees SITE_CONFIG exists before the next script. */
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "data/config.json", false); /* false = synchronous */
    xhr.send(null);
    if (xhr.status === 200 || (xhr.status === 0 && xhr.responseText)) {
      return JSON.parse(xhr.responseText);
    }
    throw new Error("HTTP " + xhr.status);
  } catch (err) {
    console.error("config: could not load data/config.json — " + err.message);
    return {};
  }
})();

/* Export for use in other scripts. */
if (typeof module !== "undefined" && module.exports) {
  module.exports = SITE_CONFIG;
}