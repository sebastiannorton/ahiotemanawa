/* ============================================================
   Mobile menu toggle — hamburger nav below 768px.
   ============================================================ */
(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  /* Close the menu if a nav link is chosen (mobile UX). */
  Array.prototype.forEach.call(nav.querySelectorAll("a"), function (a) {
    a.addEventListener("click", function () {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
})();