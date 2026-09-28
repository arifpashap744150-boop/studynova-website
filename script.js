/* =========================================================
   Study Nova — static website behaviour
   Vanilla JS only. No dependencies, no build step.
   ========================================================= */

(function () {
  "use strict";

  /* =======================================================
     1. SITE SETTINGS  —  edit these values, nothing else.
     ======================================================= */

  var SITE = {
    // TODO: Replace "#" with the real Windows installer URL
    // (for example: "https://github.com/user/studynova/releases/download/v1.0.0/StudyNovaSetup.exe")
    DOWNLOAD_URL: "#",

    // TODO: Replace with the real support email address
    SUPPORT_EMAIL: "support@example.com",

    // Version shown in the "What's New" section and hero note
    VERSION: "v1.0.0"
  };

  /* =======================================================
     2. UPDATES  —  add, remove, or edit entries here.
        Every card in the "What's New" section comes from
        this array. Newest entries should be placed first.
     ======================================================= */

  var UPDATES = [
    {
      version: "v1.0.0",
      tag: "New",
      date: "Example date",
      title: "Study Nova for Windows is here",
      text: "The first public release of Study Nova for Windows, with Course Maker, My Courses, Study From Photo, Labs, Quizzes, and Mind Maps."
    },
    {
      version: "v1.1.0",
      tag: "Improved",
      date: "Example date",
      title: "Faster photo analysis",
      text: "Study From Photo now returns clearer explanations and handles multi-page uploads more smoothly."
    },
    {
      version: "v1.2.0",
      tag: "Improved",
      date: "Example date",
      title: "Quizzes and mind maps get an upgrade",
      text: "Quizzes now show which topics need another pass, and mind maps are easier to edit and rearrange."
    }
  ];

  /* =======================================================
     3. Helpers
     ======================================================= */

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  var isPlaceholderUrl =
    !SITE.DOWNLOAD_URL || SITE.DOWNLOAD_URL === "#" || SITE.DOWNLOAD_URL.indexOf("REPLACE") !== -1;

  /* =======================================================
     4. Mobile navigation
     ======================================================= */

  function initNav() {
    var toggle = $(".nav-toggle");
    var nav = $("#primary-nav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
      nav.classList.toggle("is-open", open);
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) setOpen(false);
    });
  }

  /* =======================================================
     5. Active section highlighting
     ======================================================= */

  function initActiveSection() {
    var sections = $all("main section[id]");
    var links = $all(".nav-link");
    if (!sections.length || !links.length || !("IntersectionObserver" in window)) return;

    var visible = {};

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          visible[entry.target.id] = entry.isIntersecting;
        });

        var currentId = "home";
        sections.some(function (section) {
          if (visible[section.id]) {
            currentId = section.id;
            return true;
          }
          return false;
        });

        links.forEach(function (link) {
          var isActive = link.getAttribute("href") === "#" + currentId;
          link.classList.toggle("is-active", isActive);
          if (isActive) {
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* =======================================================
     6. Scroll reveal animation
     ======================================================= */

  function initReveal() {
    var targets = $all(
      ".section-head, .feature-card, .update-card, .about-card, .download-panel, .support-panel"
    );
    if (!targets.length) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    targets.forEach(function (element) {
      // Anything already on screen stays visible, so content is never hidden
      // if the observer does not fire.
      if (element.getBoundingClientRect().top < window.innerHeight) {
        return;
      }
      element.classList.add("reveal");
      observer.observe(element);
    });
  }

  /* =======================================================
     7. Download buttons + support email + toast
     ======================================================= */

  var toastTimer = null;

  function showToast(message) {
    var toast = $("#toast");
    if (!toast) return;

    toast.textContent = message;
    toast.hidden = false;

    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.hidden = true;
    }, 4500);
  }

  function initDownload() {
    var buttons = $all("[data-download-link]");

    buttons.forEach(function (button) {
      if (isPlaceholderUrl) {
        var pointsToSection = button.getAttribute("href") === "#download";
        if (!pointsToSection) button.setAttribute("href", "#download");

        button.addEventListener("click", function (event) {
          if (pointsToSection) {
            // Let the anchor scroll to the download section, then explain.
            window.setTimeout(function () {
              showToast(
                "The Windows installer link is not set yet. Add the installer URL to DOWNLOAD_URL in script.js to enable downloads."
              );
            }, 250);
            return;
          }
          event.preventDefault();
          showToast(
            "The Windows installer link is not set yet. Add the installer URL to DOWNLOAD_URL in script.js to enable downloads."
          );
        });
      } else {
        button.setAttribute("href", SITE.DOWNLOAD_URL);
        button.setAttribute("download", "");
      }
    });

    $all("[data-support-email]").forEach(function (link) {
      if (SITE.SUPPORT_EMAIL && SITE.SUPPORT_EMAIL.indexOf("example.com") === -1) {
        link.setAttribute("href", "mailto:" + SITE.SUPPORT_EMAIL);
        link.textContent = SITE.SUPPORT_EMAIL;
      }
    });
  }

  /* =======================================================
     8. Render the "What's New" cards
     ======================================================= */

  function renderUpdates() {
    var container = $("#updates-list");
    if (!container) return;

    if (!UPDATES.length) {
      container.innerHTML = '<p class="empty-note">No updates posted yet — check back soon.</p>';
      return;
    }

    container.innerHTML = UPDATES.map(function (update) {
      var meta = [];
      if (update.version) meta.push('<span class="update-tag">' + escapeHtml(update.version) + "</span>");
      if (update.tag) meta.push("<span>" + escapeHtml(update.tag) + "</span>");
      if (update.date) meta.push('<span class="update-date">' + escapeHtml(update.date) + "</span>");

      return (
        '<article class="card update-card">' +
        (meta.length ? '<div class="update-meta">' + meta.join("") + "</div>" : "") +
        '<h3 class="card-title">' + escapeHtml(update.title) + "</h3>" +
        '<p class="card-text">' + escapeHtml(update.text) + "</p>" +
        "</article>"
      );
    }).join("");
  }

  /* =======================================================
     9. Init
     ======================================================= */

  function initYear() {
    var year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function init() {
    initNav();
    renderUpdates();
    initDownload();
    initYear();
    initActiveSection();
    initReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
