/* ============================================================
   Structured page-content loader.

   Each page retains human-readable HTML as a no-JavaScript fallback.
   This script replaces only elements deliberately marked with data-content
   attributes using the corresponding data/<page>.json file. Those files
   are edited through Decap CMS as friendly fields, not raw HTML.
   ============================================================ */
(function () {
  "use strict";

  var page = document.body.getAttribute("data-content-page");
  if (!page) return;

  function valueAt(object, path) {
    return path.split(".").reduce(function (value, key) {
      return value && Object.prototype.hasOwnProperty.call(value, key) ? value[key] : undefined;
    }, object);
  }

  function text(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function appendTextWithLineBreaks(element, value) {
    value.split(/\r?\n/).forEach(function (line, index) {
      if (index) element.appendChild(document.createElement("br"));
      element.appendChild(document.createTextNode(line));
    });
  }

  function replaceText(content) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-content]"), function (element) {
      var value = text(valueAt(content, element.getAttribute("data-content")));
      if (value) element.textContent = value;
    });
  }

  function replaceLines(content) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-content-lines]"), function (element) {
      var value = text(valueAt(content, element.getAttribute("data-content-lines")));
      if (!value) return;
      element.textContent = "";
      value.split(/\r?\n/).forEach(function (line, index) {
        if (index) element.appendChild(document.createElement("br"));
        element.appendChild(document.createTextNode(line));
      });
    });
  }

  function replaceParagraphLists(content) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-content-paragraphs]"), function (element) {
      var values = valueAt(content, element.getAttribute("data-content-paragraphs"));
      if (!Array.isArray(values) || !values.length) return;
      var className = element.getAttribute("data-paragraph-class") || "";
      element.textContent = "";
      values.forEach(function (value) {
        value = text(value);
        if (!value) return;
        var paragraph = document.createElement("p");
        if (className) paragraph.className = className;
        appendTextWithLineBreaks(paragraph, value);
        element.appendChild(paragraph);
      });
    });
  }

  function replaceLinks(content) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-content-link]"), function (element) {
      var link = valueAt(content, element.getAttribute("data-content-link"));
      if (!link || !text(link.url)) return;
      element.href = link.url;
      element.textContent = text(link.label) || link.url;
      var prefix = element.parentElement && element.parentElement.querySelector("[data-content-link-prefix]");
      if (prefix && text(link.prefix)) prefix.textContent = text(link.prefix);
    });
  }

  function renderPrinciples(content) {
    var values = valueAt(content, "principles");
    if (!Array.isArray(values) || !values.length) return;
    var words = values.map(text).filter(Boolean).join("  ");
    var screenReader = document.querySelector("[data-content-principles-reader]");
    var tracks = document.querySelectorAll("[data-content-principles-track]");
    if (screenReader) screenReader.textContent = words;
    Array.prototype.forEach.call(tracks, function (track) { track.textContent = words + "  "; });
  }

  function renderPurposeOpportunities(content) {
    var root = document.querySelector("[data-purpose-opportunities]");
    var opportunities = valueAt(content, "opportunities");
    if (!root || !Array.isArray(opportunities) || !opportunities.length) return;
    root.textContent = "";
    opportunities.forEach(function (item) {
      if (!item || !text(item.heading)) return;
      var heading = document.createElement("h3");
      heading.textContent = text(item.heading);
      root.appendChild(heading);
      (item.paragraphs || []).forEach(function (copy) {
        var paragraph = document.createElement("p");
        paragraph.textContent = text(copy);
        root.appendChild(paragraph);
      });
      if (Array.isArray(item.bullets) && item.bullets.length) {
        var list = document.createElement("ol");
        item.bullets.forEach(function (copy) {
          var listItem = document.createElement("li");
          listItem.textContent = text(copy);
          list.appendChild(listItem);
        });
        root.appendChild(list);
      }
      if (item.link && text(item.link.url)) {
        var linkParagraph = document.createElement("p");
        if (text(item.link.prefix)) linkParagraph.appendChild(document.createTextNode(text(item.link.prefix) + " "));
        var link = document.createElement("a");
        link.href = item.link.url;
        link.target = "_blank";
        link.rel = "noopener";
        link.textContent = text(item.link.label) || item.link.url;
        linkParagraph.appendChild(link);
        root.appendChild(linkParagraph);
      }
    });
  }

  function renderPastEvents(content) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-past-event]"), function (root) {
      var event = valueAt(content, "pastEvents." + root.getAttribute("data-past-event"));
      if (!event) return;
      var title = root.querySelector("[data-past-event-title]");
      if (title && text(event.title)) title.textContent = text(event.title);
      Array.prototype.forEach.call(root.querySelectorAll("[data-past-event-paragraphs]"), function (element) {
        var key = element.getAttribute("data-past-event-paragraphs");
        var values = event[key];
        if (!Array.isArray(values) || !values.length) return;
        element.textContent = "";
        values.forEach(function (copy, index) {
          copy = text(copy);
          if (!copy) return;
          var paragraph = document.createElement("p");
          var className = element.getAttribute("data-paragraph-class") || "";
          paragraph.className = /^—/.test(copy) ? "testimonial-name" : className;
          appendTextWithLineBreaks(paragraph, copy);
          element.appendChild(paragraph);
        });
      });
    });
  }

  fetch("data/" + page + ".json", { cache: "no-cache" })
    .then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    })
    .then(function (content) {
      replaceText(content);
      replaceLines(content);
      replaceParagraphLists(content);
      replaceLinks(content);
      renderPrinciples(content);
      renderPurposeOpportunities(content);
      renderPastEvents(content);
    })
    .catch(function (error) {
      console.warn("page content: could not load " + page + ".json — " + error.message);
    });
})();