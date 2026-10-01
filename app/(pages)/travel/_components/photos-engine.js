// Photos engine for /travel, ported from the prototype
// (https://claude.ai/artifact/TXG579EpV7pfoortwtEsBf). It drives the phone that
// photos-phone.tsx renders: the navigation stack (Collections > Albums > album),
// the photo grid, the zoom from a thumbnail into the viewer, swipes, and the Maui
// vlog that turns the phone to landscape. Like the desk engine it stays plain,
// imperative DOM code, close to the prototype. Differences from the prototype:
// - React renders the first screen (Albums), so the desk polaroids can fly into
//   their album covers (<ViewTransition> in photos-phone.tsx). This engine adopts
//   that screen and builds every other screen itself.
// - The phone scales to the stage, not to the window.
// - Every listener and timer stops when the page unmounts.

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const pd = (s) => { const [y, m, d] = s.split('-').map(Number); return { y, m: m - 1, d }; };
const fmtShort = (s) => { const a = pd(s); return `${MON[a.m]} ${a.d}, ${a.y}`; };
export const fmtLong = (s) => { const a = pd(s); return `${MONL[a.m]} ${a.d}, ${a.y}`; };
export function fmtRange(s, e) {
  const a = pd(s), b = pd(e);
  if (s === e) return fmtShort(s);
  if (a.y !== b.y) return `${fmtShort(s)} – ${fmtShort(e)}`;
  if (a.m === b.m) return `${MON[a.m]} ${a.d} – ${b.d}, ${a.y}`;
  return `${MON[a.m]} ${a.d} – ${MON[b.m]} ${b.d}, ${a.y}`;
}
const icon = (id, cls = '') => `<svg class="i ${cls}"><use href="#ph-${id}"/></svg>`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const store = {
  get(k, d) { try { return localStorage.getItem('travel.' + k) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('travel.' + k, v); } catch { /* storage off */ } },
};
const DEVICE_W = 471, DEVICE_H = 987, BARE_QUERY = '(max-width: 600px)';

/**
 * @param {HTMLElement} root the .photos-stage element
 * @param {import('@/lib/travel').TravelAlbum[]} albumData
 * @returns {() => void} cleanup
 */
export function mountPhotos(root, albumData) {
  const ac = new AbortController();
  const on = (target, type, fn, opts = {}) => target.addEventListener(type, fn, { ...opts, signal: ac.signal });
  const timers = new Set();
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
  const $ = (s, r = root) => r.querySelector(s), $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bareMQ = matchMedia(BARE_QUERY);
  const device = $('.device'), screenEl = $('.screen'), viewsEl = $('.views'), tabbar = $('.tabbar'), toastEl = $('.toast');

  // ---------- data ----------
  const ALBUMS = albumData.map((a) => {
    const album = { id: a.id, title: a.title, photos: [] };
    album.photos = a.items.map((p, i) => ({ ...p, album, i, code: `${a.id}/${i}`, poster: p.thumb }));
    album.coverPhoto = album.photos[a.cover] || album.photos[0];
    album.coverSrc = a.coverImage || album.coverPhoto.thumb;
    return album;
  });
  const ALL = ALBUMS.flatMap((a) => a.photos).sort((x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : 0));
  const VID = ALL.find((p) => p.type === 'video');

  // ---------- status bar clock: Savar's local time ----------
  const clock = $('.status .time');
  const tick = () => {
    try { clock.textContent = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Vancouver' }).format(new Date()).replace(/\s?[AP]M$/, ''); } catch { /* keep 9:41 */ }
  };
  tick();
  const clockId = setInterval(tick, 15000);

  // ---------- fit the phone to the stage ----------
  let landscape = false;
  function scaleFor(land) {
    const w = land ? DEVICE_H : DEVICE_W, h = land ? DEVICE_W : DEVICE_H;
    return Math.min(1, (root.clientWidth - 32) / w, (root.clientHeight - 32) / h);
  }
  function fit() {
    if (bareMQ.matches) { device.style.removeProperty('transform'); return; }
    const s = scaleFor(landscape);
    device.style.setProperty('--s', String(s));
    device.style.transform = `translate(-50%,-50%) rotate(${landscape ? -90 : 0}deg) scale(${s})`;
  }
  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(root);
  on(bareMQ, 'change', fit);
  const S = () => {
    if (bareMQ.matches) return 1;
    const r = screenEl.getBoundingClientRect();
    return (landscape ? r.height : r.width) / screenEl.offsetWidth;
  };
  // A client rect, in the drawn phone's points, relative to `base` (the screen or the viewer).
  const toLocal = (rect, base = screenEl) => {
    const br = base.getBoundingClientRect(), s = S();
    return { x: (rect.left - br.left) / s, y: (rect.top - br.top) / s, w: rect.width / s, h: rect.height / s };
  };
  const SW = () => screenEl.clientWidth;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toast.t);
    toast.t = later(() => toastEl.classList.remove('show'), 1400);
  }
  const notHere = (what) => toast(`${what} is not on this phone`);

  // ---------- navigation stack ----------
  let stack = []; // { el, kind, data }
  function mkView() {
    const v = document.createElement('section');
    v.className = 'view';
    v.innerHTML = '<div class="scroll"></div><div class="edge"></div><div class="dim"></div>';
    return v;
  }
  function onScrollEdge(v) {
    const sc = $('.scroll', v);
    on(sc, 'scroll', () => v.classList.toggle('scrolled', sc.scrollTop > 4), { passive: true });
  }
  function anim(el, kf, o) {
    if (REDUCED) { Object.assign(el.style, kf[kf.length - 1]); return Promise.resolve(); }
    const a = el.animate(kf, { easing: 'cubic-bezier(.32,.72,0,1)', duration: 540, fill: 'forwards', ...o });
    return a.finished.then(() => { try { a.commitStyles(); } catch { /* detached */ } a.cancel(); }, () => {});
  }
  function push(kind, data) {
    const v = build(kind, data);
    viewsEl.appendChild(v);
    const prev = stack[stack.length - 1];
    stack.push({ el: v, kind, data });
    updateTabs();
    if (!prev) return;
    prev.el.classList.add('under');
    anim(v, [{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }]);
    anim($('.dim', prev.el), [{ opacity: 0 }, { opacity: 0.08 }]);
    anim(prev.el, [{ transform: 'translateX(0)' }, { transform: 'translateX(-30%)' }]).then(() => {
      prev.el.hidden = true;
      prev.el.style.transform = '';
      $('.dim', prev.el).style.opacity = 0;
    });
  }
  function pop() {
    if (stack.length < 2) return;
    const cur = stack.pop(), prev = stack[stack.length - 1];
    prev.el.hidden = false;
    prev.el.classList.remove('under');
    updateTabs();
    anim(prev.el, [{ transform: 'translateX(-30%)' }, { transform: 'translateX(0)' }]);
    anim(cur.el, [{ transform: 'translateX(0)' }, { transform: 'translateX(100%)' }]).then(() => drop(cur.el));
  }
  function popToRoot() {
    while (stack.length > 1) drop(stack.pop().el);
    const r = stack[0].el;
    r.hidden = false;
    r.classList.remove('under');
    r.style.transform = '';
    updateTabs();
  }
  function updateTabs() {
    const top = stack[stack.length - 1];
    const lib = !!top && top.kind === 'library';
    $('[data-tab="library"]').setAttribute('aria-selected', String(lib));
    $('[data-tab="collections"]').setAttribute('aria-selected', String(!lib));
  }

  // Edge swipe back (the left 24 pt of the screen).
  on(viewsEl, 'pointerdown', (e) => {
    if (stack.length < 2) return;
    if (toLocal({ left: e.clientX, top: e.clientY, width: 0, height: 0 }).x > 24) return;
    const cur = stack[stack.length - 1].el, prev = stack[stack.length - 2].el;
    const x0 = e.clientX, t0 = performance.now();
    let dx = 0;
    prev.hidden = false;
    const drag = new AbortController();
    window.addEventListener('pointermove', (ev) => {
      dx = Math.max(0, (ev.clientX - x0) / S());
      cur.style.transform = `translateX(${dx}px)`;
      prev.style.transform = `translateX(${-0.3 * SW() + 0.3 * dx}px)`;
    }, { signal: drag.signal });
    window.addEventListener('pointerup', () => {
      drag.abort();
      const v = dx / (performance.now() - t0);
      if (dx > SW() * 0.4 || v > 0.6) { cur.style.transform = ''; prev.style.transform = ''; pop(); return; }
      anim(cur, [{ transform: `translateX(${dx}px)` }, { transform: 'translateX(0)' }], { duration: 300 });
      anim(prev, [{ transform: `translateX(${-0.3 * SW() + 0.3 * dx}px)` }, { transform: 'translateX(-30%)' }], { duration: 300 }).then(() => { prev.hidden = true; });
    }, { signal: drag.signal });
    ac.signal.addEventListener('abort', () => drag.abort());
  });

  // ---------- screens ----------
  function build(kind, data) {
    const v = mkView();
    v.dataset.kind = kind;
    const sc = $('.scroll', v);
    onScrollEdge(v);
    if (kind === 'collections') {
      v.insertAdjacentHTML('beforeend', `<header class="lhead"><div><h2 class="lt">Collections</h2></div><div class="trail"><button class="gbtn glass" aria-label="Layout and reorder" data-inert="Layout options">${icon('more')}</button></div></header>`);
      sc.innerHTML = `<div class="coll">
        <div class="sec-h"><button class="t" data-inert="Memories">Memories ${icon('chev-r')}</button></div>
        <div class="row"><button class="tile big" data-open-video aria-label="Maui memory, video"><img src="${VID.thumb}" alt=""><span>Maui<small>December 2025</small></span><svg class="i fill play" style="width:28px;height:28px"><use href="#ph-play"/></svg></button></div>
        <div class="sec-h"><button class="t" data-go="albums">Albums ${icon('chev-r')}</button><span class="fold" aria-hidden="true">${icon('chev-d')}</span></div>
        <div class="row">${ALBUMS.map((a, i) => `<button class="tile" data-album="${i}" aria-label="${esc(a.title)} album"><img src="${a.coverSrc}" alt="" loading="lazy"><span>${esc(a.title)}</span></button>`).join('')}</div>
        <div class="sec-h"><button class="t" data-inert="Media Types">Media Types ${icon('chev-r')}</button></div>
        <div class="mtype"><button data-go="library">${icon('photo')}Photos<span class="n">${ALL.filter((p) => p.type === 'photo').length}</span></button><button data-open-video>${icon('video')}Videos<span class="n">1</span></button></div>
      </div>`;
    }
    if (kind === 'album' || kind === 'library') {
      const items = kind === 'album' ? data.photos : ALL;
      const title = kind === 'album' ? data.title : 'Library';
      const range = fmtRange(items[0].date, items[items.length - 1].date);
      const cols = kind === 'album' ? 3 : 5;
      v.dataset.cols = String(cols);
      const nP = items.filter((p) => p.type === 'photo').length, nV = items.length - nP;
      const count = [nP ? `${nP} Photo${nP === 1 ? '' : 's'}` : '', nV ? `${nV} Video${nV === 1 ? '' : 's'}` : ''].filter(Boolean).join(', ');
      v.insertAdjacentHTML('beforeend', `<header class="lhead"><div class="lead">${kind === 'album' ? `<button class="gbtn glass" data-back aria-label="Back">${icon('chev-l')}</button>` : ''}<h2 class="lt">${esc(title)}</h2><div class="sub" data-sub>${range}</div></div><div class="trail" style="margin-top:${kind === 'album' ? '0' : '16px'}"><button class="gbtn glass" aria-label="Sort and filter" data-inert="Sort and filter">${icon('filter')}</button><div class="gcap glass"><button data-inert="Select">Select</button></div></div></header>`);
      sc.innerHTML = `<div class="gridwrap" style="padding-top:calc(var(--st) + ${kind === 'album' ? 150 : 106}px)"><div class="grid" style="--cols:${cols}">${items.map((p, i) => `<button class="cell" data-i="${i}" aria-label="${p.type === 'video' ? 'Video' : 'Photo'}, ${esc(p.place)}, ${fmtLong(p.date)}"><img src="${p.thumb}" alt="" loading="lazy" decoding="async">${p.type === 'video' ? `<span class="dur">${p.duration}</span>` : ''}</button>`).join('')}</div><div class="gridfoot">${count}<small>${range}</small></div></div>`;
      v._items = items;
      v._range = range;
      on(sc, 'scroll', () => subtitle(v), { passive: true });
      pinchable(v);
    }
    return v;
  }
  function subtitle(v) {
    const sc = $('.scroll', v), sub = $('[data-sub]', v);
    if (!sub) return;
    if (sc.scrollTop < 40) { sub.textContent = v._range; return; }
    const top = $('.lhead', v).getBoundingClientRect().bottom;
    const c = $$('.cell', sc).find((c) => c.getBoundingClientRect().bottom > top);
    if (c) sub.textContent = fmtShort(v._items[+c.dataset.i].date);
  }

  // Pinch (or ctrl + wheel, a trackpad pinch) changes the grid: 1, 3 or 5 columns.
  const LEVELS = [1, 3, 5];
  function setCols(v, dir, anchorY) {
    const idx = LEVELS.indexOf(+v.dataset.cols), ni = Math.max(0, Math.min(LEVELS.length - 1, idx + dir));
    if (ni === idx) return;
    const sc = $('.scroll', v), grid = $('.grid', v), y = anchorY ?? sc.clientHeight / 2;
    const at = $$('.cell', grid).find((c) => { const r = c.getBoundingClientRect(), sr = sc.getBoundingClientRect(); return (r.bottom - sr.top) / S() > y; });
    v.dataset.cols = String(LEVELS[ni]);
    grid.style.setProperty('--cols', String(LEVELS[ni]));
    grid.classList.remove('reflow');
    void grid.offsetWidth;
    grid.classList.add('reflow');
    if (at) { const r = at.getBoundingClientRect(), sr = sc.getBoundingClientRect(); sc.scrollTop += (r.top - sr.top) / S() - y + r.height / S() / 2; }
  }
  function pinchable(v) {
    const sc = $('.scroll', v);
    let acc = 0, lock = 0;
    on(sc, 'wheel', (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      acc += e.deltaY;
      const now = performance.now();
      if (now < lock) return;
      if (Math.abs(acc) > 40) { setCols(v, acc > 0 ? 1 : -1, toLocal({ left: e.clientX, top: e.clientY, width: 0, height: 0 }).y); acc = 0; lock = now + 380; }
    }, { passive: false });
    const pts = new Map();
    let d0 = 0;
    const dist = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); };
    on(sc, 'pointerdown', (e) => { if (e.pointerType !== 'touch') return; pts.set(e.pointerId, e); if (pts.size === 2) d0 = dist(); });
    on(sc, 'pointermove', (e) => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, e);
      if (pts.size !== 2 || !d0) return;
      const d = dist();
      if (d / d0 > 1.35) { setCols(v, -1); d0 = d; } else if (d / d0 < 0.72) { setCols(v, 1); d0 = d; }
    });
    const end = (e) => { pts.delete(e.pointerId); if (pts.size < 2) d0 = 0; };
    on(sc, 'pointerup', end);
    on(sc, 'pointercancel', end);
    on(sc, 'gesturestart', (e) => e.preventDefault());
  }

  // ---------- taps ----------
  on(screenEl, 'click', (e) => {
    const t = e.target.closest('button');
    if (!t || !screenEl.contains(t) || t.closest('.viewer')) return;
    if (t.matches('[data-inert]')) { notHere(t.dataset.inert); return; }
    if (t.matches('[data-back]')) { pop(); return; }
    if (t.dataset.go === 'albums') { pushAlbums(); return; }
    if (t.dataset.go === 'library') { push('library'); return; }
    if (t.dataset.tab === 'collections') { if (stack[stack.length - 1].kind === 'library') start(); else popToRoot(); return; }
    if (t.dataset.tab === 'library') { if (stack[stack.length - 1].kind !== 'library') resetTo('library'); else $('.scroll', stack[0].el).scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (t.dataset.album != null) { push('album', ALBUMS[+t.dataset.album]); return; }
    if (t.matches('[data-open-video]')) { openViewer([VID], 0, t.querySelector('img') || t); return; }
    if (t.classList.contains('cell')) { const v = t.closest('.view'); openViewer(v._items, +t.dataset.i, t); }
  });

  // ---------- the first screen ----------
  // React renders Albums (the polaroids fly into its covers), so it never leaves
  // the DOM: popping it hides it. Collections is built under it (earlier sibling).
  const albumsEl = $('.view[data-kind="albums"]');
  onScrollEdge(albumsEl);
  function drop(el) {
    if (el !== albumsEl) { el.remove(); return; }
    el.hidden = true;
    el.classList.remove('under');
    el.style.transform = '';
  }
  function adoptAlbums(el) {
    el.classList.remove('under');
    el.hidden = false;
    el.style.transform = '';
    const hv = $('.hero video', el);
    if (hv) { hv.muted = true; hv.play().catch(() => {}); }
    return el;
  }
  function pushAlbums() { // from Collections, after Albums has been popped
    const el = adoptAlbums(albumsEl);
    const prev = stack[stack.length - 1];
    stack.push({ el, kind: 'albums' });
    updateTabs();
    prev.el.classList.add('under');
    anim(el, [{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }]);
    anim(prev.el, [{ transform: 'translateX(0)' }, { transform: 'translateX(-30%)' }]).then(() => { prev.el.hidden = true; prev.el.style.transform = ''; });
  }
  function start() {
    $$('.view', viewsEl).forEach((v) => { if (v !== albumsEl) v.remove(); });
    const coll = build('collections');
    coll.hidden = true;
    viewsEl.insertBefore(coll, viewsEl.firstChild);
    stack = [{ el: coll, kind: 'collections' }, { el: adoptAlbums(albumsEl), kind: 'albums' }];
    updateTabs();
  }
  function resetTo(kind) {
    $$('.view', viewsEl).forEach(drop);
    const v = build(kind);
    viewsEl.appendChild(v);
    stack = [{ el: v, kind }];
    updateTabs();
  }
  start();

  // ---------- photo viewer ----------
  let V = null;
  const VW = () => V.el.clientWidth, VH = () => V.el.clientHeight;
  function fitRect(p, W, H) { const r = Math.min(W / p.w, H / p.h), w = p.w * r, h = p.h * r; return { x: (W - w) / 2, y: (H - h) / 2, w, h }; }
  // Transform + clip so the full-size element at t looks like a cover-cropped thumbnail at o.
  function cropFrom(o, t) {
    const s = Math.max(o.w / t.w, o.h / t.h), cw = o.w / s, ch = o.h / s, ix = (t.w - cw) / 2, iy = (t.h - ch) / 2;
    return { transform: `translate(${o.x - t.x - s * ix}px,${o.y - t.y - s * iy}px) scale(${s})`, clip: `inset(${iy}px ${ix}px ${iy}px ${ix}px round ${(o.r || 0) / s}px)` };
  }
  const radiusOf = (el) => (el.classList.contains('cell') ? 0 : el.classList.contains('hero') ? 18 : 15);

  function openViewer(items, idx, originEl) {
    if (V) return;
    const el = document.createElement('div');
    el.className = 'viewer';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Photo viewer');
    el.innerHTML = `<div class="vbg"></div><div class="track"></div>
      <div class="vtop"><button class="gbtn glass" data-vclose aria-label="Back">${icon('chev-l')}</button><div class="vtitle glass"><b></b><small></small></div><button class="gbtn glass" data-inert="More" aria-label="More">${icon('more')}</button></div>
      <div class="vbadges"><button class="rate glass" data-rate aria-label="Rate">${icon('star')}<span></span></button></div>
      <div class="scrub"><div class="strip"></div></div>
      <div class="vbot"><button class="gbtn glass" data-inert="Share" aria-label="Share">${icon('share')}</button><div class="gcap glass"><button class="heart" data-heart aria-label="Favorite">${icon('heart')}</button><button data-info aria-label="Info">${icon('info')}</button><button data-inert="Edit" aria-label="Edit">${icon('sliders')}</button></div><button class="gbtn glass" data-inert="Delete" aria-label="Delete">${icon('trash')}</button></div>
      <div class="info" role="dialog" aria-label="Photo info"><h3></h3><p></p><dl></dl></div>`;
    screenEl.appendChild(el);
    V = { el, items, idx, originEl, track: $('.track', el), slides: [], gap: 24, chrome: true, ac: new AbortController() };
    const W = VW(), H = VH();
    items.forEach((p, i) => {
      const s = document.createElement('div');
      s.className = 'slide';
      s.style.left = i * (W + V.gap) + 'px';
      s.style.width = W + 'px';
      if (p.type === 'video') {
        s.innerHTML = `<div class="vlayer"><video playsinline preload="metadata" poster="${p.poster}" src="${p.src}"></video></div>`;
      } else {
        const f = fitRect(p, W, H), img = new Image();
        img.className = 'ph';
        img.alt = `${p.place}, ${fmtLong(p.date)}`;
        img.src = p.thumb;
        img.decoding = 'async';
        Object.assign(img.style, { left: f.x + 'px', top: f.y + 'px', width: f.w + 'px', height: f.h + 'px' });
        s.appendChild(img);
        s._img = img;
      }
      V.track.appendChild(s);
      V.slides.push(s);
    });
    $('.strip', el).innerHTML = items.map((p, i) => `<button data-j="${i}" aria-label="Go to item ${i + 1}"><img src="${p.thumb}" alt="" loading="lazy"></button>`).join('');
    if (items.length < 2) $('.scrub', el).hidden = true;
    setIdx(idx, true);
    tabbar.classList.add('hide');
    const p = items[idx], slide = V.slides[idx], bg = $('.vbg', el);
    const chromeEls = $$('.vtop,.vbot,.scrub,.vbadges', el);
    if (p.type === 'video') { openVideo(p, slide, originEl, bg, chromeEls); return; }
    const img = slide._img;
    loadFull(p, img);
    if (originEl && !REDUCED) {
      const o = toLocal(originEl.getBoundingClientRect(), el);
      o.r = radiusOf(originEl);
      const c = cropFrom(o, fitRect(p, W, H));
      originEl.style.visibility = 'hidden';
      img.animate([{ transform: c.transform, clipPath: c.clip }, { transform: 'none', clipPath: 'inset(0px 0px 0px 0px round 0px)' }], { duration: 440, easing: 'cubic-bezier(.2,.86,.24,1)' });
      bg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards' });
      chromeEls.forEach((c) => c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay: 140, fill: 'backwards' }));
    }
    bg.style.opacity = 1;
    bindViewer();
  }
  function loadFull(p, img) {
    if (!img || img.dataset.full) return;
    img.dataset.full = '1';
    const f = new Image();
    f.decoding = 'async';
    f.src = p.src;
    (f.decode ? f.decode() : Promise.resolve()).then(() => { img.src = p.src; }, () => { img.src = p.src; });
  }
  function setIdx(i, instant) {
    V.idx = i;
    const p = V.items[i];
    $('.vtitle b', V.el).textContent = p.place;
    $('.vtitle small', V.el).textContent = fmtLong(p.date);
    V.track.style.transition = instant || REDUCED ? 'none' : 'transform .42s cubic-bezier(.25,.9,.3,1)';
    V.track.style.transform = `translateX(${-i * (VW() + V.gap)}px)`;
    [i - 1, i, i + 1].forEach((j) => { const q = V.items[j]; if (q && q.type === 'photo') loadFull(q, V.slides[j]._img); });
    const strip = $('.strip', V.el);
    $$('button', strip).forEach((b, j) => b.classList.toggle('on', j === i));
    strip.style.transform = `translateX(${-(i * 23 + 26)}px)`;
    $('[data-heart]', V.el).classList.toggle('on', store.get('fav.' + p.code, '0') === '1');
    const r = +store.get('rate.' + p.code, '0');
    $('[data-rate] span', V.el).textContent = r ? '★'.repeat(r) : '';
    $('.info', V.el).classList.remove('open');
  }
  function bindViewer() {
    const el = V.el, sig = { signal: V.ac.signal };
    let sx = 0, sy = 0, dx = 0, dy = 0, mode = null, t0 = 0, moved = false;
    const slideImg = () => V.slides[V.idx]._img;
    el.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.vtop,.vbot,.scrub,.vbadges,.info') || e.button > 0) return;
      sx = e.clientX; sy = e.clientY; dx = dy = 0; mode = null; moved = false; t0 = performance.now();
      el.setPointerCapture?.(e.pointerId);
    }, sig);
    el.addEventListener('pointermove', (e) => {
      if (!t0) return;
      dx = (e.clientX - sx) / S(); dy = (e.clientY - sy) / S();
      if (!mode && Math.hypot(dx, dy) > 8) { mode = Math.abs(dx) > Math.abs(dy) ? 'x' : dy > 0 ? 'down' : 'up'; moved = true; }
      if (mode === 'x') {
        const W = VW() + V.gap, edge = (V.idx === 0 && dx > 0) || (V.idx === V.items.length - 1 && dx < 0);
        V.track.style.transition = 'none';
        V.track.style.transform = `translateX(${-V.idx * W + (edge ? dx * 0.35 : dx)}px)`;
      }
      if (mode === 'down') {
        const img = slideImg();
        if (!img) return;
        const k = Math.max(0.55, 1 - dy / 900);
        img.style.transformOrigin = '50% 50%';
        img.style.transform = `translate(${dx}px,${dy}px) scale(${k})`;
        $('.vbg', el).style.opacity = Math.max(0, 1 - dy / 420);
        el.classList.add('nochrome');
      }
    }, sig);
    const up = (e) => {
      if (!t0) return;
      const dt = performance.now() - t0;
      t0 = 0;
      if (!moved) { if (e.target.closest('.slide')) toggleChrome(); return; }
      if (mode === 'x') {
        const v = dx / dt;
        let n = V.idx;
        if (dx < -VW() * 0.25 || v < -0.45) n++;
        else if (dx > VW() * 0.25 || v > 0.45) n--;
        setIdx(Math.max(0, Math.min(V.items.length - 1, n)));
      }
      if (mode === 'down') {
        if (dy > 110 || dy / dt > 0.6) { closeViewer(true); return; }
        const img = slideImg();
        img.animate([{ transform: img.style.transform }, { transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.2,.86,.24,1)' });
        img.style.transform = '';
        img.style.transformOrigin = '0 0';
        $('.vbg', el).style.opacity = 1;
        if (V.chrome) el.classList.remove('nochrome');
      }
      if (mode === 'up') $('.info', el).classList.add('open');
    };
    el.addEventListener('pointerup', up, sig);
    el.addEventListener('pointercancel', up, sig);
    el.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.matches('[data-inert]')) { notHere(b.dataset.inert); return; }
      if (b.matches('[data-vclose]')) { closeViewer(); return; }
      if (b.dataset.j != null) { setIdx(+b.dataset.j); return; }
      const p = V.items[V.idx];
      if (b.matches('[data-heart]')) {
        const fav = !b.classList.contains('on');
        b.classList.toggle('on', fav);
        store.set('fav.' + p.code, fav ? '1' : '0');
        if (!REDUCED) b.firstElementChild.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'ease-out' });
        return;
      }
      if (b.matches('[data-rate]')) {
        const r = (+store.get('rate.' + p.code, '0') + 1) % 6;
        store.set('rate.' + p.code, String(r));
        $('span', b).textContent = r ? '★'.repeat(r) : '';
        return;
      }
      if (b.matches('[data-info]')) {
        const info = $('.info', el);
        $('h3', info).textContent = p.place;
        $('p', info).textContent = fmtLong(p.date);
        $('dl', info).innerHTML = `<dt>Album</dt><dd>${esc(p.album.title)}</dd><dt>Size</dt><dd>${p.w} × ${p.h}</dd><dt>Camera</dt><dd>iPhone</dd>`;
        info.classList.toggle('open');
      }
    }, sig);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { const info = $('.info.open', el); if (info) info.classList.remove('open'); else closeViewer(); }
      if (e.key === 'ArrowRight' && V.idx < V.items.length - 1) setIdx(V.idx + 1);
      if (e.key === 'ArrowLeft' && V.idx > 0) setIdx(V.idx - 1);
    }, sig);
  }
  function toggleChrome() {
    V.chrome = !V.chrome;
    V.el.classList.toggle('nochrome', !V.chrome);
    V.el.classList.toggle('bare-black', !V.chrome);
    screenEl.classList.toggle('dark-chrome', !V.chrome);
  }
  // The grid cell (or tile) for item i, scrolled into view, to zoom back into.
  function originFor(i) {
    const top = stack[stack.length - 1];
    if (!top || !top.el._items || V.items !== top.el._items) return V.originEl && V.items.length === 1 && V.originEl.isConnected ? V.originEl : null;
    const cell = $(`.cell[data-i="${i}"]`, top.el);
    if (!cell) return null;
    const sc = $('.scroll', top.el), r = cell.getBoundingClientRect(), sr = sc.getBoundingClientRect();
    if (r.bottom < sr.top + 100 * S() || r.top > sr.bottom - 90 * S()) sc.scrollTop += (r.top - sr.top) / S() - sc.clientHeight / 2 + r.height / S() / 2;
    return cell;
  }
  function closeViewer(fromDrag) {
    if (!V || V.closing) return;
    V.closing = true;
    const el = V.el, p = V.items[V.idx], slide = V.slides[V.idx], bg = $('.vbg', el);
    if (V.originEl) V.originEl.style.visibility = '';
    const done = () => {
      V.ac.abort();
      el.remove();
      screenEl.classList.remove('dark-chrome');
      tabbar.classList.remove('hide');
      $$('.cell,.tile,.cover,.hero').forEach((c) => { c.style.visibility = ''; });
      V = null;
    };
    el.classList.add('nochrome');
    tabbar.classList.remove('hide');
    const target = originFor(V.idx);
    const img = p.type === 'video' ? $('.vlayer', slide) : slide._img;
    if (!target || REDUCED || !img) { el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200 }).finished.then(done, done); return; }
    const o = toLocal(target.getBoundingClientRect(), el);
    o.r = radiusOf(target);
    target.style.visibility = 'hidden';
    if (p.type === 'video') {
      img.style.transition = 'none';
      const t = fitRect(p, VW(), VH()), s = Math.max(o.w / t.w, o.h / t.h);
      bg.animate([{ opacity: getComputedStyle(bg).opacity }, { opacity: 0 }], { duration: 300, fill: 'forwards' });
      img.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${o.x + o.w / 2 - VW() / 2}px,${o.y + o.h / 2 - VH() / 2}px) scale(${s})`, opacity: 0.2 }], { duration: 380, easing: 'cubic-bezier(.2,.86,.24,1)', fill: 'forwards' }).finished.then(done, done);
      return;
    }
    const t = { x: parseFloat(img.style.left), y: parseFloat(img.style.top), w: parseFloat(img.style.width), h: parseFloat(img.style.height) };
    const c = cropFrom(o, t);
    let from = 'none';
    if (fromDrag && img.style.transform) { // turn the centred drag transform into a top-left one
      const m = new DOMMatrix(getComputedStyle(img).transform), k = m.a, cx = t.w / 2, cy = t.h / 2;
      from = `translate(${m.e + cx - k * cx}px,${m.f + cy - k * cy}px) scale(${k})`;
    }
    img.style.transformOrigin = '0 0';
    img.style.transform = '';
    bg.animate([{ opacity: getComputedStyle(bg).opacity }, { opacity: 0 }], { duration: 320, fill: 'forwards' });
    img.animate([{ transform: from, clipPath: 'inset(0px 0px 0px 0px round 0px)' }, { transform: c.transform, clipPath: c.clip }], { duration: fromDrag ? 360 : 420, easing: 'cubic-bezier(.2,.86,.24,1)', fill: 'forwards' }).finished.then(done, done);
  }

  // ---------- the vlog: the phone turns to landscape ----------
  function openVideo(p, slide, originEl, bg, chromeEls) {
    const el = V.el, vl = $('.vlayer', slide), vid = $('video', slide), sig = { signal: V.ac.signal };
    chromeEls.forEach((c) => { c.style.opacity = 0; });
    el.classList.add('nochrome');
    vl.insertAdjacentHTML('beforeend', `<button class="gbtn glass vclose" data-vclose2 aria-label="Close video">${icon('xmark')}</button>
      <button class="glass unmute" data-unmute>${icon('spk-off')}Tap for sound</button>
      <div class="vctl glass"><button data-pp aria-label="Pause">${icon('pause')}</button><time data-cur>0:00</time><div class="bar" data-bar><i></i></div><time data-dur>${p.duration || ''}</time><button data-mute aria-label="Mute">${icon('spk')}</button></div>`);
    if (originEl && !REDUCED) {
      const o = toLocal(originEl.getBoundingClientRect(), el), t = fitRect(p, VW(), VH()), s = Math.max(o.w / t.w, o.h / t.h);
      vl.animate([{ transform: `translate(${o.x + o.w / 2 - VW() / 2}px,${o.y + o.h / 2 - VH() / 2}px) scale(${s})` }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,.86,.24,1)' });
    }
    bg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards' });
    bg.style.opacity = 1;
    el.classList.add('bare-black');
    screenEl.classList.add('dark-chrome');
    let hideT;
    const hideSoon = () => { clearTimeout(hideT); hideT = later(() => { if (!vid.paused) el.classList.remove('ctl'); }, 2600); };
    later(() => {
      if (!V || V.el !== el) return;
      landscape = true;
      screenEl.classList.add('landscape');
      el.classList.add('land', 'ctl');
      fit();
      later(() => {
        vid.muted = false;
        vid.play().catch(() => { vid.muted = true; el.classList.add('muted'); vid.play().catch(() => {}); });
        hideSoon();
      }, REDUCED ? 0 : 620);
    }, REDUCED ? 0 : 480);
    const fmt = (t) => { t = Math.max(0, Math.floor(t || 0)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };
    vid.addEventListener('timeupdate', () => { $('[data-cur]', el).textContent = fmt(vid.currentTime); $('[data-bar] i', el).style.width = (vid.currentTime / (vid.duration || 31)) * 100 + '%'; }, sig);
    vid.addEventListener('loadedmetadata', () => { $('[data-dur]', el).textContent = fmt(vid.duration); }, sig);
    vid.addEventListener('play', () => { $('[data-pp]', el).innerHTML = icon('pause'); hideSoon(); }, sig);
    vid.addEventListener('pause', () => { $('[data-pp]', el).innerHTML = icon('play'); el.classList.add('ctl'); }, sig);
    vid.addEventListener('ended', () => el.classList.add('ctl'), sig);
    vl.addEventListener('click', (e) => {
      if (!el.classList.contains('land') || e.target.closest('button,[data-bar]')) return;
      el.classList.toggle('ctl');
      if (el.classList.contains('ctl')) hideSoon();
    }, sig);
    const closeVideo = () => {
      vid.pause();
      el.classList.remove('land', 'ctl', 'muted');
      landscape = false;
      screenEl.classList.remove('landscape');
      fit();
      later(() => closeViewer(), REDUCED ? 0 : 640);
    };
    el.addEventListener('click', (e) => {
      const b = e.target.closest('button,[data-bar]');
      if (!b) return;
      if (b.matches('[data-pp]')) { if (vid.paused) vid.play(); else vid.pause(); }
      if (b.matches('[data-mute],[data-unmute]')) {
        vid.muted = !vid.muted;
        el.classList.toggle('muted', vid.muted);
        $('[data-mute]', el).innerHTML = icon(vid.muted ? 'spk-off' : 'spk');
        if (!vid.muted && vid.paused) vid.play();
      }
      if (b.matches('[data-bar]')) {
        const r = b.getBoundingClientRect();
        const f = r.width >= r.height ? (e.clientX - r.left) / r.width : (e.clientY - r.top) / r.height;
        if (vid.duration) vid.currentTime = Math.max(0, Math.min(1, f)) * vid.duration;
      }
      if (b.matches('[data-vclose2]')) closeVideo();
    }, sig);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeVideo();
      if (e.key === ' ') { e.preventDefault(); if (vid.paused) vid.play(); else vid.pause(); }
    }, sig);
  }

  return () => {
    ac.abort();
    if (V) V.ac.abort();
    timers.forEach(clearTimeout);
    clearInterval(clockId);
    ro.disconnect();
    // Leave the React-rendered Albums screen as React made it.
    $$('.view', viewsEl).forEach((v) => { if (v !== albumsEl) v.remove(); });
    albumsEl.hidden = false;
    albumsEl.classList.remove('under', 'scrolled');
    albumsEl.style.transform = '';
    V?.el.remove();
    tabbar.classList.remove('hide');
  };
}
