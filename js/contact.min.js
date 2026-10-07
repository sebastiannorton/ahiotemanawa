/* ============================================================
   Contact page — details, map and EmailJS contact form.

   All editable values come from SITE_CONFIG, loaded from data/config.json
   (edit via the CMS admin: /admin → Site settings).
   TODO items show where real client data is still needed.
   ============================================================ */
(function () {
  var cfg = (typeof SITE_CONFIG !== "undefined") ? SITE_CONFIG : null;
  var PLACEHOLDER = "PLACEHOLDER_REPLACE_ME";

  /* ---------- email ---------- */
  var emailEl = document.getElementById("contact-email");
  var email = cfg ? String(cfg.contactEmail || "") : "";
  if (emailEl) {
    if (email && email.indexOf(PLACEHOLDER) === -1) {
      emailEl.textContent = email;
      emailEl.href = "mailto:" + email;
    } else {
      emailEl.textContent = "hello@ahiotemanawa.nz";
      emailEl.href = "mailto:hello@ahiotemanawa.nz";
      emailEl.title = "Contact email — set in data/config.json (admin: Site settings)";
    }
  }

  /* ---------- physical address ---------- */
  var addrEl = document.getElementById("contact-address");
  if (addrEl) {
    var lines = (cfg && cfg.addressLines) || [];
    if (lines.length) {
      /* render each line on its own row (trusted config data) */
      addrEl.textContent = "";
      lines.forEach(function (line, i) {
        if (i > 0) addrEl.appendChild(document.createElement("br"));
        addrEl.appendChild(document.createTextNode(line));
      });
    } else {
      addrEl.textContent = "address to be confirmed";
      addrEl.title = "TODO: add the real address in js/config.js (SITE_CONFIG.addressLines)";
    }
  }

  /* ---------- embedded Google map ---------- */
  var frame = document.getElementById("map-frame");
  var todo = document.getElementById("map-todo");
  var embed = cfg ? String(cfg.mapsEmbedSrc || "") : "";
  if (frame) {
    if (embed && embed.indexOf(PLACEHOLDER) === -1 && /^https:\/\//.test(embed)) {
      frame.src = embed;
      if (todo) todo.hidden = true;
    } else if (todo) {
      todo.removeAttribute("hidden");
      /* TODO: insert a public Google Maps embed URL for the real
         location in js/config.js (SITE_CONFIG.mapsEmbedSrc). */
    }
  }

  /* ---------- contact form ---------- */
  var form = document.getElementById("contact-form");
  var msg = document.getElementById("form-msg");
  if (form && msg) {
    var EMAILJS_SERVICE_ID = "service_xuxuvk9";
    var EMAILJS_TEMPLATE_ID = "template_d6s7t59";
    var EMAILJS_PUBLIC_KEY = "87t0UmWpwho8XwMZ6";
    var formReady = true;

    function showMessage(kind, text) {
      msg.setAttribute("data-type", kind);
      msg.textContent = text;
      msg.removeAttribute("hidden");
      msg.setAttribute("role", "status");
      msg.setAttribute("aria-live", "polite");
    }

    if (window.emailjs && typeof window.emailjs.init === "function") {
      window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var name = form.querySelector("#cf-name").value.trim();
      var emailAddr = form.querySelector("#cf-email").value.trim();
      var message = form.querySelector("#cf-message").value.trim();

      if (!name || !emailAddr || !message) {
        showMessage("error", "Please fill in your name, email and message.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddr)) {
        showMessage("error", "Please enter a valid email address.");
        return;
      }
      if (!window.emailjs || typeof window.emailjs.send !== "function") {
        showMessage(
          "error",
          "The contact form could not load. Please try again, or email us directly at the address above."
        );
        return;
      }
      if (!formReady) return;

      formReady = false; /* prevent double submit */
      window.emailjs
        .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          name: name,
          email: emailAddr,
          message: message
        })
        .then(function () {
          showMessage(
            "success",
            "Thank you — your message has been sent. We'll be in touch soon."
          );
          form.reset();
          formReady = true;
        })
        .catch(function () {
          showMessage(
            "error",
            "Your message could not be sent just now. Please try again, or email us directly at the address above."
          );
          formReady = true;
        });
    });
  }
})();