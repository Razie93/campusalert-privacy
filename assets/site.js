/* CampusAlert — progressive enhancement only.
   Every page works without this file: navigation is native links, the contact
   address is a plain mailto link, and printing is a browser feature. */

(function () {
  "use strict";

  /* Footer year ------------------------------------------------------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* Print ------------------------------------------------------------- */
  document.querySelectorAll("[data-print-page]").forEach(function (button) {
    button.addEventListener("click", function () {
      window.print();
    });
  });

  /* Copy the contact address ------------------------------------------ */
  function statusFor(button) {
    var scope = button.closest("[data-copy-controls]") || document;
    return scope.querySelector("[data-copy-status]");
  }

  function selectSource(button) {
    var id = button.getAttribute("data-copy-source");
    if (!id) return false;
    var source = document.getElementById(id.replace(/^#/, ""));
    if (!source) return false;
    source.setAttribute("tabindex", "-1");
    source.focus({ preventScroll: true });
    var range = document.createRange();
    range.selectNodeContents(source);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  }

  function legacyCopy(text) {
    var field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.top = "0";
    field.style.left = "0";
    field.style.width = "1px";
    field.style.height = "1px";
    field.style.padding = "0";
    field.style.border = "0";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    var copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }
    document.body.removeChild(field);
    return copied;
  }

  function copyWithClipboard(text) {
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
      return Promise.resolve(false);
    }
    return navigator.clipboard.writeText(text).then(
      function () {
        return true;
      },
      function () {
        return false;
      }
    );
  }

  document.querySelectorAll("[data-copy-email]").forEach(function (button) {
    button.addEventListener("click", function () {
      var address = button.getAttribute("data-copy-email");
      var status = statusFor(button);

      function report(state, message) {
        if (!status) return;
        status.setAttribute("data-state", state);
        status.textContent = message;
      }

      copyWithClipboard(address).then(function (ok) {
        if (ok) {
          report("ok", "Address copied to the clipboard.");
          return;
        }
        if (legacyCopy(address)) {
          report("ok", "Address copied to the clipboard.");
          return;
        }
        var selected = selectSource(button);
        report(
          "error",
          selected
            ? "The browser blocked copying. The address is selected — press Ctrl+C, or Cmd+C on Mac, to copy it."
            : "The browser blocked copying. Please select the address and copy it manually."
        );
      });
    });
  });

  /* Section index: mark the section being read ------------------------ */
  var index = document.querySelector(".policy__index");
  if (index && "IntersectionObserver" in window) {
    var links = Array.prototype.slice.call(index.querySelectorAll('a[href^="#"]'));
    var sections = links
      .map(function (link) {
        return document.querySelector(link.getAttribute("href"));
      })
      .filter(Boolean);

    if (sections.length) {
      var visible = new Map();

      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              visible.set(entry.target.id, entry.intersectionRatio);
            } else {
              visible.delete(entry.target.id);
            }
          });

          var best = null;
          var bestRatio = -1;
          visible.forEach(function (ratio, id) {
            if (ratio > bestRatio) {
              bestRatio = ratio;
              best = id;
            }
          });

          if (!best) return;
          links.forEach(function (link) {
            if (link.getAttribute("href") === "#" + best) {
              link.setAttribute("aria-current", "location");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        },
        {
          rootMargin: "-15% 0px -70% 0px",
          threshold: [0, 0.15, 0.5, 1]
        }
      );

      sections.forEach(function (section) {
        observer.observe(section);
      });
    }
  }
})();
