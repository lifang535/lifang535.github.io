/* Progressive enhancements. All content and language links also work without JS. */
(() => {
  "use strict";

  const dialog = document.querySelector("#image-dialog");
  const dialogImage = document.querySelector("#dialog-image");
  const dialogCaption = document.querySelector("#dialog-caption");
  const dialogSource = document.querySelector("#dialog-source");
  let imageTrigger = null;

  if (dialog && typeof dialog.showModal === "function") {
    document.querySelectorAll("[data-image]").forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        imageTrigger = anchor;
        dialogImage.src = anchor.href;
        dialogImage.alt = anchor.dataset.caption;
        dialogCaption.textContent = anchor.dataset.caption;
        dialogSource.href = anchor.dataset.source;
        dialog.showModal();
        document.body.classList.add("dialog-open");
      });
    });
    dialog.querySelector(".close-dialog").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener("close", () => {
      document.body.classList.remove("dialog-open");
      if (imageTrigger) imageTrigger.focus({ preventScroll: true });
    });
  }

  async function writeClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch (_) { /* Use the selection fallback when clipboard access is unavailable. */ }
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.setAttribute("aria-label", "Citation");
    document.body.append(textarea);
    textarea.select();
    let copied = false;
    try { copied = document.execCommand("copy"); }
    finally { textarea.remove(); }
    if (!copied) throw new Error("Copy was unavailable");
  }

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.hidden = false;
    button.addEventListener("click", async () => {
      const box = button.closest(".citation-box");
      const status = box.querySelector(".copy-status");
      try {
        await writeClipboard(box.querySelector("code").textContent);
        status.textContent = document.body.dataset.copiedLabel;
      } catch (_) {
        status.textContent = document.body.dataset.copyFailed;
      }
      button.focus({ preventScroll: true });
    });
  });

  // Keep the current section when changing languages.
  const updateLanguageLinks = () => {
    document.querySelectorAll("[data-language]").forEach((anchor) => {
      const href = new URL(anchor.getAttribute("href"), window.location.href);
      href.hash = window.location.hash;
      anchor.href = href.href;
    });
  };
  updateLanguageLinks();
  window.addEventListener("hashchange", updateLanguageLinks);

  const nav = [...document.querySelectorAll("[data-nav]")];
  const sections = nav.map((anchor) => document.querySelector(anchor.getAttribute("href"))).filter(Boolean);
  let scheduled = false;
  const updateNav = () => {
    scheduled = false;
    const top = document.querySelector(".masthead").getBoundingClientRect().height + 65;
    let active = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= top) active = section;
    }
    if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) active = sections[sections.length - 1];
    nav.forEach((anchor) => {
      if (anchor.hash === `#${active.id}`) anchor.setAttribute("aria-current", "location");
      else anchor.removeAttribute("aria-current");
    });
  };
  window.addEventListener("scroll", () => {
    if (!scheduled) { scheduled = true; window.requestAnimationFrame(updateNav); }
  }, { passive: true });
  window.addEventListener("resize", updateNav, { passive: true });
  updateNav();
})();
