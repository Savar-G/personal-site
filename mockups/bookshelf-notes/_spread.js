/* Shared two-page "spread" reader (the book-metaphor reader from variation E).
 * Exposes window.openSpread(slug, tab?). Styles live in _base.css (.spread*). */

(function () {
  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  let sb, lastFocus;

  function ensure() {
    if (sb) return;
    sb = document.createElement("div");
    sb.className = "spread-backdrop";
    sb.setAttribute("data-open", "false");
    sb.innerHTML = '<div class="spread" role="dialog" aria-modal="true" tabindex="-1"></div>';
    document.body.appendChild(sb);
    sb.addEventListener("mousedown", (e) => { if (e.target === sb) close(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sb.getAttribute("data-open") === "true") close();
    });
  }

  function close() {
    sb.setAttribute("data-open", "false");
    document.body.style.overflow = "";
    setTimeout(() => (sb.style.display = "none"), 240);
    if (lastFocus) lastFocus.focus();
  }

  function open(slug, tab) {
    ensure();
    const b = window.BOOKS.find((x) => x.slug === slug);
    if (!b) return;
    lastFocus = document.activeElement;
    const sp = sb.querySelector(".spread");
    sp.style.setProperty("--accent", b.spineColor);

    const meta = b.status === "reading" ? "Currently reading" : b.date ? `Read · ${b.date}` : "Read";
    const hasT = b.takeaways.length, hasQ = b.quotes.length, hasN = b.notes.length;
    const first =
      (tab && { takeaway: "takeaways", quote: "quotes", note: "notes" }[tab]) ||
      (hasT ? "takeaways" : hasQ ? "quotes" : hasN ? "notes" : "takeaways");

    const tHTML = hasT
      ? b.takeaways.map((t) => `<p class="sp-tk">${esc(t)}</p>`).join("")
      : '<p class="sp-faint">No takeaways yet.</p>';
    const qHTML = hasQ
      ? b.quotes
          .map((x) => `<blockquote class="sp-q">“${esc(x.text)}”${x.source ? `<cite>— ${esc(x.source)}</cite>` : ""}</blockquote>`)
          .join("")
      : '<p class="sp-faint">No quotes saved.</p>';
    const nHTML = hasN
      ? b.notes
          .map((n) => {
            const body = n.list
              ? `<ul>${n.list.map((li) => `<li>${esc(li)}</li>`).join("")}</ul>`
              : `<p>${esc(n.p)}</p>`;
            return `<div class="sp-note">${n.h ? `<h4>${esc(n.h)}</h4>` : ""}${body}</div>`;
          })
          .join("")
      : `<p class="sp-faint">${b.status === "reading" ? "Currently reading — notes to come." : "No long-form notes yet."}</p>`;

    sp.innerHTML = `
      <button class="sp-close" aria-label="Close"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
      <div class="page page-left">
        <img src="${b.cover}" alt="Cover of ${esc(b.title)}">
        <p class="pl-eyebrow">${esc(b.category)}</p>
        <h2 class="pl-title">${esc(b.title)}</h2>
        <p class="pl-by">${esc(b.author)}</p>
        <p class="pl-meta">${
          b.rating
            ? `<span class="pl-rating">${Array.from({ length: 5 }, (_, i) => `<i data-on="${i < b.rating}"></i>`).join("")}</span><span>·</span>`
            : ""
        }<span>${meta}</span></p>
        <p class="pl-summary">${esc(b.summary)}</p>
      </div>
      <div class="page page-right">
        <div class="sp-tabs" role="tablist">
          <button class="sp-tab" data-tab="takeaways" role="tab" aria-selected="${first === "takeaways"}">Takeaways<span class="c">${hasT}</span></button>
          <button class="sp-tab" data-tab="quotes" role="tab" aria-selected="${first === "quotes"}">Quotes<span class="c">${hasQ}</span></button>
          <button class="sp-tab" data-tab="notes" role="tab" aria-selected="${first === "notes"}">Notes<span class="c">${hasN}</span></button>
        </div>
        <div class="sp-panel" data-panel="takeaways" ${first === "takeaways" ? "" : "hidden"}>${tHTML}</div>
        <div class="sp-panel" data-panel="quotes" ${first === "quotes" ? "" : "hidden"}>${qHTML}</div>
        <div class="sp-panel" data-panel="notes" ${first === "notes" ? "" : "hidden"}>${nHTML}</div>
      </div>`;

    sp.querySelector(".sp-close").onclick = close;
    sp.querySelectorAll(".sp-tab").forEach((t) =>
      (t.onclick = () => {
        sp.querySelectorAll(".sp-tab").forEach((x) => x.setAttribute("aria-selected", String(x === t)));
        sp.querySelectorAll(".sp-panel").forEach((p) => (p.hidden = p.dataset.panel !== t.dataset.tab));
      }),
    );

    sb.style.display = "flex";
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        sb.setAttribute("data-open", "true");
        sp.focus();
      }),
    );
  }

  window.openSpread = open;
})();
