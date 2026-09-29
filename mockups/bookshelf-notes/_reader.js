/* Shared per-book reader modal: cover + tabbed notes (Summary / Takeaways /
 * Quotes / Notes). Used by the Feed, Tabs, and Library mockups. */

(function () {
  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  let backdrop, lastFocus;

  function ensureRoot() {
    if (backdrop) return;
    backdrop = document.createElement("div");
    backdrop.className = "reader-backdrop";
    backdrop.setAttribute("data-open", "false");
    backdrop.innerHTML = '<div class="reader-spread" role="dialog" aria-modal="true" tabindex="-1"></div>';
    document.body.appendChild(backdrop);

    backdrop.addEventListener("mousedown", (e) => {
      if (e.target === backdrop) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && backdrop.getAttribute("data-open") === "true") close();
    });
  }

  function close() {
    backdrop.setAttribute("data-open", "false");
    document.body.style.overflow = "";
    setTimeout(() => { backdrop.style.display = "none"; }, 240);
    if (lastFocus) lastFocus.focus();
  }

  function tabBtn(id, label, count, selected) {
    return `<button class="reader-tab" role="tab" id="tab-${id}" aria-controls="panel-${id}"
      aria-selected="${selected}" data-tab="${id}">${label}${
      count != null ? `<span class="t-count">${count}</span>` : ""
    }</button>`;
  }

  function open(slug) {
    ensureRoot();
    const b = window.BOOKS.find((x) => x.slug === slug);
    if (!b) return;
    lastFocus = document.activeElement;

    const spread = backdrop.querySelector(".reader-spread");
    spread.style.setProperty("--spine", b.spineColor);

    const meta =
      b.status === "reading"
        ? "Currently reading"
        : b.date
        ? `Read · ${b.date}`
        : "Read";

    const hasT = b.takeaways.length, hasQ = b.quotes.length, hasN = b.notes.length;
    const firstTab = hasT ? "takeaways" : hasQ ? "quotes" : hasN ? "notes" : "summary";

    const takeawaysHTML = hasT
      ? b.takeaways.map((t) => `<p class="r-takeaway">${esc(t)}</p>`).join("")
      : '<p class="reader-empty">No takeaways yet.</p>';

    const quotesHTML = hasQ
      ? b.quotes
          .map(
            (q) =>
              `<blockquote class="r-quote">“${esc(q.text)}”${
                q.source ? `<cite>— ${esc(q.source)}</cite>` : ""
              }</blockquote>`,
          )
          .join("")
      : '<p class="reader-empty">No quotes saved.</p>';

    const notesHTML = hasN
      ? b.notes
          .map((n) => {
            const body = n.list
              ? `<ul>${n.list.map((li) => `<li>${esc(li)}</li>`).join("")}</ul>`
              : `<p>${esc(n.p)}</p>`;
            return `<div class="r-note">${n.h ? `<h4>${esc(n.h)}</h4>` : ""}${body}</div>`;
          })
          .join("")
      : '<p class="reader-empty">No long-form notes yet.</p>';

    spread.innerHTML = `
      <button class="reader-close" aria-label="Close">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
      <div class="reader-cover-pane">
        <img class="reader-cover" src="${b.cover}" alt="Cover of ${esc(b.title)} by ${esc(b.author)}">
      </div>
      <div class="reader-notes">
        <p class="reader-eyebrow">${esc(b.category)}</p>
        <h2 class="reader-title">${esc(b.title)}</h2>
        <p class="reader-byline">${esc(b.author)}</p>
        <p class="reader-meta">${
          b.rating
            ? `<span class="reader-rating" aria-label="Rated ${b.rating} of 5">${Array.from(
                { length: 5 },
                (_, i) => `<span class="reader-dot" data-on="${i < b.rating}"></span>`,
              ).join("")}</span><span aria-hidden="true">·</span>`
            : ""
        }<span>${meta}</span></p>

        <div class="reader-tabs" role="tablist">
          ${tabBtn("summary", "Summary", null, firstTab === "summary")}
          ${tabBtn("takeaways", "Takeaways", hasT, firstTab === "takeaways")}
          ${tabBtn("quotes", "Quotes", hasQ, firstTab === "quotes")}
          ${tabBtn("notes", "Notes", hasN, firstTab === "notes")}
        </div>

        <div class="reader-panel" id="panel-summary" role="tabpanel" aria-labelledby="tab-summary" ${firstTab === "summary" ? "" : "hidden"}>
          <p class="reader-summary">${esc(b.summary)}</p>
        </div>
        <div class="reader-panel" id="panel-takeaways" role="tabpanel" aria-labelledby="tab-takeaways" ${firstTab === "takeaways" ? "" : "hidden"}>${takeawaysHTML}</div>
        <div class="reader-panel" id="panel-quotes" role="tabpanel" aria-labelledby="tab-quotes" ${firstTab === "quotes" ? "" : "hidden"}>${quotesHTML}</div>
        <div class="reader-panel" id="panel-notes" role="tabpanel" aria-labelledby="tab-notes" ${firstTab === "notes" ? "" : "hidden"}>${notesHTML}</div>
      </div>`;

    spread.querySelector(".reader-close").addEventListener("click", close);
    spread.querySelectorAll(".reader-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const id = tab.dataset.tab;
        spread.querySelectorAll(".reader-tab").forEach((t) =>
          t.setAttribute("aria-selected", String(t === tab)),
        );
        spread.querySelectorAll(".reader-panel").forEach((p) => {
          p.hidden = p.id !== `panel-${id}`;
        });
      });
    });

    backdrop.style.display = "flex";
    document.body.style.overflow = "hidden";
    // next frame -> animate in
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        backdrop.setAttribute("data-open", "true");
        spread.focus();
      }),
    );
  }

  window.openReader = open;
})();
