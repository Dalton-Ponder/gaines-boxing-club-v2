/**
 * Gaines Boxing Club — Reusable Modal
 *
 * API:
 *   GBCModal.open({ title, subtitle, body, footer, size })
 *   GBCModal.close()
 *
 * Parameters:
 *   title    (string)          — Modal title text
 *   subtitle (string|optional) — Small orange label above the title
 *   body     (string|Element)  — HTML string or DOM element for the modal body
 *   footer   (string|Element|optional) — HTML string or DOM element for the footer
 *   size     ('sm'|'lg'|optional)      — Size variant (default is standard 560px)
 */

const GBCModal = (() => {
  let overlay = null;
  let modalEl = null;

  function ensureDOM() {
    if (overlay) return;

    overlay = document.createElement("div");
    overlay.className = "gbc-modal-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");

    overlay.innerHTML = `
            <div class="gbc-modal">
                <button class="gbc-modal-close" aria-label="Close modal">
                    <span class="material-symbols-outlined" style="font-size:20px;">close</span>
                </button>
                <div class="gbc-modal-header"></div>
                <div class="gbc-modal-body"></div>
                <div class="gbc-modal-footer"></div>
            </div>
        `;

    document.body.appendChild(overlay);
    modalEl = overlay.querySelector(".gbc-modal");

    // Close on backdrop click
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });

    // Close button
    overlay.querySelector(".gbc-modal-close").addEventListener("click", close);

    // Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("active")) {
        close();
      }
    });
  }

  function setContent(container, content) {
    if (!content) {
      container.style.display = "none";
      container.innerHTML = "";
      return;
    }
    container.style.display = "";
    if (typeof content === "string") {
      container.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      container.innerHTML = "";
      container.appendChild(content);
    }
  }

  function open({
    title = "",
    subtitle = "",
    body = "",
    footer = "",
    size = "",
  } = {}) {
    ensureDOM();

    // Size variant
    modalEl.classList.remove("modal-sm", "modal-lg");
    if (size === "sm") modalEl.classList.add("modal-sm");
    if (size === "lg") modalEl.classList.add("modal-lg");

    // Header
    const header = modalEl.querySelector(".gbc-modal-header");
    let headerHTML = "";
    if (subtitle)
      headerHTML += `<span class="modal-subtitle">${subtitle}</span>`;
    if (title) headerHTML += `<h2>${title}</h2>`;
    if (headerHTML) {
      header.style.display = "";
      header.innerHTML = headerHTML;
    } else {
      header.style.display = "none";
    }

    // Body
    setContent(modalEl.querySelector(".gbc-modal-body"), body);

    // Footer
    setContent(modalEl.querySelector(".gbc-modal-footer"), footer);

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    // Show
    requestAnimationFrame(() => {
      overlay.classList.add("active");
    });
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  return { open, close };
})();
