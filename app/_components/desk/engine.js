// Desk engine, ported from the <script> in mockups/desk-prototype/index.html.
// It drives the markup from markup.ts: dragging, hover states, the RAZR, the
// sugar cubes, the ghost, and the resume hyperspace. It stays plain,
// imperative DOM code on purpose, close to the prototype, so the two are easy
// to keep in sync. Differences from the prototype:
// - Travel, Writing, Projects, and Bookshelf open real routes (router.navigate).
//   Where the browser has view transitions, the object flies into its page
//   (named elements in markup.ts, <ViewTransition> on the page); elsewhere the
//   object lifts and the desk fades. The name ("Savar.") flies into the name in
//   the header on /about the same way.
// - Every listener, timer, and animation loop stops when the desk unmounts.
// - The landing animation plays once per browser session. It is CSS (class
//   "landing" on the stage), started before the first paint by the inline
//   script in markup.ts on a full page load, or here after a client-side one.
// - Phones and short screens get the pocket desk (M3): the same objects laid out
//   from the POCKET table, tap instead of drag, and a contact sheet for Socials.

import { POCKET, POCKET_CUBES, CUBE_SCALE, POCKET_QUERY } from './pocket.js';

/**
 * @param {HTMLElement} root the .desk-page element
 * @param {{ navigate: (href: string) => void, prefetch: (href: string) => void }} router
 * @returns {() => void} cleanup
 */
export function mountDesk(root, router) {
  const ac = new AbortController();
  const on = (target, type, fn, opts = {}) => target.addEventListener(type, fn, { ...opts, signal: ac.signal });
  const timers = new Set(), intervals = [];
  let dead = false;
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
  const cancel = id => { clearTimeout(id); timers.delete(id); };
  const every = (fn, ms) => { intervals.push(setInterval(fn, ms)); };
  const raf = fn => requestAnimationFrame(t => { if (!dead) fn(t); });
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];

  const stage = $('#stage');
  const toast = $('#toast');
  const hint = $('#hint');
  const phone = $('#phone');
  const rows = $$('#contacts li');
  let scale = 1, z = 10, sel = 0, toastTimer;

  // Same query as the pocket-desk block in desk.css.
  const small = matchMedia(POCKET_QUERY);
  function fit() {
    if (small.matches) {                                   // pocket desk: 390 px wide, scrolls down
      scale = Math.min(innerWidth / 390, 1.25);
      stage.style.setProperty('--s', scale); stage.style.setProperty('--ts', 1);
      return;
    }
    scale = Math.min(innerWidth / 1440, innerHeight / 900);
    stage.style.setProperty('--s', scale);
    // On a 13" laptop or a half-width window the desk shrinks; keep captions and body text readable.
    stage.style.setProperty('--ts', Math.min(1.3, Math.max(1, 0.92 / scale)).toFixed(3));
  }
  on(window, 'resize', fit); fit();
  stage.classList.add('ready');

  // Small memory for returning visitors (ghost catches, sugars, polaroids developed). Private windows may refuse it.
  const store = {
    get(k, d) { try { const v = localStorage.getItem('desk.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('desk.' + k, JSON.stringify(v)); } catch {} }
  };
  const session = {
    get(k) { try { return sessionStorage.getItem('desk.' + k); } catch { return null; } },
    set(k) { try { sessionStorage.setItem('desk.' + k, '1'); } catch {} }
  };
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function say(msg) {
    toast.textContent = msg; toast.classList.add('show');
    cancel(toastTimer); toastTimer = later(() => toast.classList.remove('show'), 1800);
  }
  function overlayOpen() {
    return $('#list').classList.contains('show') || $('#viewer').classList.contains('show') || $('#sheet').classList.contains('show');
  }

  // ---------- Leaving for a page ----------
  // Pages with a flight: the view transition carries the object, so only lift it.
  // Other pages: the object lifts toward you and the desk fades, then the route changes.
  const FLIGHTS = new Set(['/travel', '/writing', '/projects', '/bookshelf', '/about']);
  const flies = href => 'startViewTransition' in document && FLIGHTS.has(href);
  const navigate = href => router.navigate(href);
  let leaving = false;
  function leave(el, href) {
    if (leaving) return; leaving = true;
    if (still) return navigate(href);
    if (flies(href)) {
      if (el) el.animate([{ scale: '1' }, { scale: '1.05' }], { duration: 160, easing: 'ease-out', fill: 'forwards' });
      return navigate(href);
    }
    if (el) el.animate([{ scale: '1' }, { scale: '1.08' }], { duration: 260, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'forwards' });
    stage.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, delay: 60, easing: 'ease-in', fill: 'forwards' })
      .finished.then(() => navigate(href));
  }
  function go(el) {
    if (el.id === 'resume') warpIn();
    else if (el.dataset.open) leave(el, el.dataset.open);
    else if (el.dataset.href) window.open(el.dataset.href, el.dataset.href.startsWith('mailto:') ? '_self' : '_blank');
  }
  // Internal links (the name, the notebook's essay, the plain list) change route without a reload.
  on(root, 'click', e => {
    const a = e.target.closest('a[href^="/"]');
    if (!a || a.target === '_blank' || a.hasAttribute('download') || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    const href = a.getAttribute('href');
    if (stage.contains(a)) leave(a.closest('.obj'), href); else navigate(href);
  });
  new Set([...$$('[data-open]').map(el => el.dataset.open), ...$$('a[href^="/"]:not([download]):not([target])').map(a => a.getAttribute('href'))])
    .forEach(href => router.prefetch(href));

  // ---------- Travel: grab the polaroids by a corner and throw them (desk only) ----------
  // Pulled by a corner, the stack swings so its centre trails the grip, the way paper does on a desk.
  // Let go while moving and it slides on, slows down, and bumps softly off the edges of the desk.
  const polaroids = $('.travel');
  const throws = el => el === polaroids && !still && !small.matches;
  const toRad = d => d * Math.PI / 180;
  const angleOf = el => parseFloat(el.style.getPropertyValue('--r')) || 0;
  let slideId = 0;
  function setPose(el, x, y, ang) { el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.setProperty('--r', ang.toFixed(2) + 'deg'); }
  function throwGrab(el, e) {
    ++slideId; el.classList.remove('sliding');
    const p = toStage(e.clientX, e.clientY), a = toRad(-angleOf(el));
    const dx = p.x - (el.offsetLeft + el.offsetWidth / 2), dy = p.y - (el.offsetTop + el.offsetHeight / 2);
    return { gx: dx * Math.cos(a) - dy * Math.sin(a), gy: dx * Math.sin(a) + dy * Math.cos(a),     // the grip, in the stack's own frame
             ang: angleOf(el), w: 0, px: p.x, py: p.y, t: e.timeStamp, trail: [[p.x, p.y, e.timeStamp]] };
  }
  function throwMove(el, g, e) {
    const p = toStage(e.clientX, e.clientY), dt = Math.max(4, e.timeStamp - g.t) / 1000;
    const vx = (p.x - g.px) / dt, vy = (p.y - g.py) / dt;
    g.px = p.x; g.py = p.y; g.t = e.timeStamp;
    g.trail.push([p.x, p.y, e.timeStamp]);
    while (g.trail.length > 2 && e.timeStamp - g.trail[0][2] > 90) g.trail.shift();
    let a = toRad(g.ang);
    const rx = -(g.gx * Math.cos(a) - g.gy * Math.sin(a)), ry = -(g.gx * Math.sin(a) + g.gy * Math.cos(a));   // grip → centre
    const spin = -(rx * vy - ry * vx) / (rx * rx + ry * ry + 900) * 57.3 * .75;                              // deg/s that lets the centre trail
    g.w += (spin - g.w) * Math.min(1, dt * 16); g.ang += g.w * dt; a = toRad(g.ang);
    setPose(el, p.x - (g.gx * Math.cos(a) - g.gy * Math.sin(a)) - el.offsetWidth / 2,
                p.y - (g.gx * Math.sin(a) + g.gy * Math.cos(a)) - el.offsetHeight / 2, g.ang);
  }
  function throwRelease(el, g, e) {
    const [x0, y0, t0] = g.trail[0], [x1, y1, t1] = g.trail[g.trail.length - 1], span = (t1 - t0) / 1000;
    if (span < .008 || e.timeStamp - t1 > 70) return;                  // it was set down, not thrown
    let vx = (x1 - x0) / span, vy = (y1 - y0) / span, w = g.w * .6;
    const speed = Math.hypot(vx, vy);
    if (speed < 60) return;
    if (speed > 2200) { vx *= 2200 / speed; vy *= 2200 / speed; }
    const id = ++slideId, W = el.offsetWidth, H = el.offsetHeight;
    let x = el.offsetLeft, y = el.offsetTop, ang = g.ang, last = performance.now();
    el.classList.add('sliding');
    raf(function slide(t) {
      if (id !== slideId) return;
      const dt = Math.min(.032, Math.max(.001, (t - last) / 1000)); last = t;
      x += vx * dt; y += vy * dt;
      const f = Math.exp(-5 * dt); vx *= f; vy *= f;          // paper on wood: it slides v/5 px, ~440 px at most
      ang += w * dt; w *= Math.exp(-6 * dt);
      // The edges of the desk: a soft bump and a little spin. Room is left under the stack for its caption.
      if (x < 8) { x = 8; vx = Math.abs(vx) * .45; w -= vy * .04; }
      if (x > 1432 - W) { x = 1432 - W; vx = -Math.abs(vx) * .45; w += vy * .04; }
      if (y < 8) { y = 8; vy = Math.abs(vy) * .45; w += vx * .04; }
      if (y > 878 - H) { y = 878 - H; vy = -Math.abs(vy) * .45; w -= vx * .04; }
      setPose(el, x, y, ang);
      if (Math.hypot(vx, vy) > 12 || Math.abs(w) > 1) raf(slide); else el.classList.remove('sliding');
    });
  }

  // Drag anywhere; a press that moves < 4px is a click.
  $$('.obj').forEach(el => {
    let start = null;
    on(el, 'pointerdown', e => {
      if (!small.matches && (e.target.closest('#contacts') || e.target.closest('.pg a'))) return;
      start = { x: e.clientX, y: e.clientY, left: el.offsetLeft, top: el.offsetTop, moved: false, target: e.target };
      if (!small.matches) el.setPointerCapture(e.pointerId);     // phones scroll instead of dragging
      if (throws(el)) start.grip = throwGrab(el, e);
    });
    on(el, 'pointermove', e => {
      if (!start) return;
      const dx = (e.clientX - start.x) / scale, dy = (e.clientY - start.y) / scale;
      if (!start.moved && Math.hypot(dx, dy) < 4) return;
      if (small.matches) { start.moved = true; return; }         // a swipe, not a tap
      if (!start.moved) { start.moved = true; el.classList.add('dragging'); el.style.zIndex = ++z; }
      if (start.grip) return throwMove(el, start.grip, e);
      el.style.left = start.left + dx + 'px'; el.style.top = start.top + dy + 'px';
    });
    on(el, 'pointerup', e => {
      if (!start) return;
      const moved = start.moved, target = start.target, grip = start.grip; start = null; el.classList.remove('dragging');
      if (moved && !small.matches) {
        if (!still) el.animate([{ scale: '1.04' }, { scale: '.97' }, { scale: '1' }], { duration: 320, easing: 'ease-out' });
        if (grip) throwRelease(el, grip, e);
        messy();
      }
      if (moved) return;
      if (el !== phone) go(el);
      else if (small.matches) openSheet();
      else if (phone.classList.contains('ringing') && !target.closest('#answer, #ignore')) answerCall();   // a click anywhere on a ringing phone picks up
    });
    on(el, 'pointercancel', () => { start = null; el.classList.remove('dragging'); });
    on(el, 'keydown', e => {
      if (e.key !== 'Enter' || e.target !== el) return;
      if (el !== phone) go(el); else if (small.matches) openSheet();
    });
  });

  // Notebook: the cover opens while the pointer is on it.
  // It stays open while someone holds the pen (below).
  const nb = $('.notebook');
  let holding = false;
  on(nb.querySelector('.hit'), 'pointerenter', () => { if (!small.matches) nb.classList.add('open'); });
  on(nb, 'pointerleave', () => { if (!holding) nb.classList.remove('open'); });
  on(nb, 'focus', () => { if (!small.matches) nb.classList.add('open'); });
  on(nb, 'blur', () => { if (!holding) nb.classList.remove('open'); });

  // RAZR: wake on hover or focus, arrows move, Enter opens.
  function paint() { rows.forEach((r, i) => r.classList.toggle('on', i === sel)); }
  function wake(isOn) { if (isOn && small.matches) return; phone.classList.toggle('active', isOn); hint.classList.toggle('show', isOn); }
  on(phone, 'pointerenter', () => wake(true));
  on(phone, 'pointerleave', () => { if (document.activeElement !== phone) wake(false); });
  on(phone, 'focus', () => wake(true));
  on(phone, 'blur', () => wake(false));
  rows.forEach((r, i) => {
    on(r, 'pointerenter', () => { sel = i; paint(); });
    on(r, 'click', () => { if (small.matches) return; sel = i; paint(); go(r); });
  });
  on(window, 'keydown', e => {
    if (!phone.classList.contains('active')) return;
    if (phone.classList.contains('ringing')) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { callSel = 1 - callSel; paintCall(); e.preventDefault(); }
      else if (e.key === 'Enter') { if (callSel) ignoreCall(); else answerCall(); e.preventDefault(); }
      return;
    }
    if (e.key === 'ArrowDown') { sel = (sel + 1) % rows.length; paint(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { sel = (sel - 1 + rows.length) % rows.length; paint(); e.preventDefault(); }
    else if (e.key === 'Enter') { go(rows[sel]); e.preventDefault(); }
  });
  paint();

  // The hint has done its job once a visitor finds an object.
  $$('.obj').forEach(o => on(o, 'pointerenter', () => $('#cta').classList.add('learned'), { once: true }));

  // ---------- Objects land on the desk, one after another (once per session) ----------
  const objsAll = $$('.obj'), cubes = $$('.cube');
  const firstLanding = !session.get('landed'); session.set('landed');
  if (!still && firstLanding) {
    stage.classList.add('landing');                    // desk.css: the greeting rises, objects drop in, cubes last
    later(() => stage.classList.remove('landing'), 2200);
  }

  // ---------- The greeting types itself on the first visit of a session ----------
  // Every letter is laid out from the start (hidden), so the centred line never shifts.
  // A caret leads; at the end a highlighter sweeps in behind the name. Then the
  // original text nodes come back (the ghost measures them with a Range).
  const h1 = $('.greet h1'), hl = h1.querySelector('.hl');
  let typing = false;
  function typeGreeting(done) {
    const lead = h1.firstChild, name = hl.firstChild, chars = [];
    const split = (node, parent) => {
      [...node.textContent].forEach(c => { const el = document.createElement('span'); el.className = 'ch'; el.textContent = c; parent.insertBefore(el, node); chars.push(el); });
      node.remove();
    };
    split(lead, h1); split(name, hl);
    typing = true; h1.classList.add('typing'); h1.classList.remove('pretype');
    let i = 0;
    const step = () => {
      if (i) chars[i - 1].classList.remove('at');
      const el = chars[i++]; el.classList.add('on', 'at');
      if (i < chars.length) {
        const c = el.textContent;
        return later(step, c === ',' ? 240 : c === ' ' ? 110 : 55 + Math.random() * 50);
      }
      later(() => {                                     // the caret blinks at the end, then the name is highlighted
        chars.forEach(x => x.remove()); h1.insertBefore(lead, hl); hl.appendChild(name);
        h1.classList.remove('typing'); typing = false;
        hl.classList.add('sweep'); later(() => hl.classList.remove('sweep'), 420);
        done();
      }, 1000);
    };
    later(step, 380);
  }

  // ---------- The name beckons until someone finds it ----------
  // Every few seconds "Savar." lifts, tilts, and a sheen crosses the highlight: it is a link (About).
  function beckon() {
    if (still || session.get('name-found')) return;
    later(() => { if (!session.get('name-found')) hl.classList.add('beckon'); }, 2200);
  }
  ['pointerenter', 'focus'].forEach(t => on(hl, t, () => { session.set('name-found'); hl.classList.remove('beckon'); }));
  if (!still && firstLanding) typeGreeting(beckon); else beckon();

  // ---------- Polaroids develop the first time someone visits ----------
  if (!still && !store.get('developed', false)) {
    const travel = $('.travel'); travel.classList.add('developing');
    later(() => travel.classList.remove('developing'), 6800); store.set('developed', true);
  }

  // ---------- Glossy things: polaroid photos and book covers catch the light ----------
  // Under the pointer each one tips a few degrees toward it, and a soft highlight follows it across the
  // photo or the cover (.gl in markup.ts). The white polaroid frames stay matte. Desk only.
  if (!still) [[polaroids, $$('.travel .pola')], [$('.books'), $$('.books .bk')]].forEach(([obj, items]) => {
    const glosses = items.map(it => it.querySelector('.gl'));
    on(obj, 'pointermove', e => {
      if (small.matches || e.pointerType === 'touch') return;
      items.forEach((it, i) => {
        const g = glosses[i], r = g.parentElement.getBoundingClientRect();
        const mx = (e.clientX - r.left) / r.width, my = (e.clientY - r.top) / r.height;
        const near = Math.max(0, 1 - Math.hypot(mx - .5, my - .5) / 1.2);
        const tx = Math.max(-1, Math.min(1, (mx - .5) * 2)) * near, ty = Math.max(-1, Math.min(1, (my - .5) * 2)) * near;
        g.style.setProperty('--gx', (mx * 100).toFixed(1) + '%'); g.style.setProperty('--gy', (my * 100).toFixed(1) + '%');
        g.style.setProperty('--go', near.toFixed(2));
        it.style.transform = `perspective(600px) rotateY(${(tx * 4).toFixed(2)}deg) rotateX(${(-ty * 4).toFixed(2)}deg)`;
      });
    });
    on(obj, 'pointerleave', () => items.forEach((it, i) => { it.style.transform = ''; glosses[i].style.setProperty('--go', 0); }));
  });

  // ---------- Coffee steams for a minute, then goes cold ----------
  later(() => $('#coffee').classList.add('cold'), 60000);

  // ---------- Tidy up: put everything back where it started ----------
  const tidyBtn = $('#tidy');
  let homes;
  const rememberHomes = () => { homes = new Map([...objsAll, ...cubes].map(o => [o, [o.offsetLeft, o.offsetTop, angleOf(o)]])); };
  function messy() { tidyBtn.classList.add('show'); }
  on(tidyBtn, 'click', () => {
    let i = 0; ++slideId;
    homes.forEach(([hx, hy, hr], o) => {
      const dx = o.offsetLeft - hx, dy = o.offsetTop - hy, dr = ((angleOf(o) - hr) % 360 + 540) % 360 - 180;   // a thrown stack may have turned
      const turned = Math.abs(dr) >= .5;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && !turned) return;
      o.classList.remove('sliding');
      o.style.left = hx + 'px'; o.style.top = hy + 'px';
      if (turned) o.style.setProperty('--r', hr + 'deg');
      const k = (t, r) => turned ? { translate: t, rotate: r } : { translate: t };     // cubes keep their own rotate
      if (!still) o.animate([k(`${dx}px ${dy}px`, `${dr}deg`), { ...k(`${-dx * .04}px ${-dy * .04}px`, `${-dr * .04}deg`), offset: .8 }, k('0 0', '0deg')],
                            { duration: 620, delay: i++ * 45, easing: 'cubic-bezier(0.3, 0.8, 0.3, 1)' });
    });
    tidyBtn.classList.remove('show');
    wipeInk();
  });

  // ---------- Plain list for skimmers and screen readers (and the whole page on phones) ----------
  const list = $('#list');
  function showList(isOn) {
    list.classList.toggle('show', isOn); list.setAttribute('aria-hidden', String(!isOn));
    (isOn ? $('#listclose') : $('#listlink')).focus({ preventScroll: true });
  }
  on($('#listlink'), 'click', e => { e.preventDefault(); showList(true); });
  on($('#listclose'), 'click', e => { e.preventDefault(); showList(false); });
  on(window, 'keydown', e => { if (e.key === 'Escape' && list.classList.contains('show')) showList(false); });

  // ---------- The RAZR rings after 20 s of quiet ----------
  let lastAct = performance.now(), rang = false, ringAnim = null, ringStop = 0, callSel = 0;
  const phoneCap = phone.querySelector('.cap');
  ['pointermove', 'pointerdown', 'keydown', 'wheel'].forEach(t => on(window, t, () => { lastAct = performance.now(); }, { passive: true }));
  function paintCall() { $('#answer').classList.toggle('on', callSel === 0); $('#ignore').classList.toggle('on', callSel === 1); }
  function stopRing(missed) {
    phone.classList.remove('ringing'); if (ringAnim) ringAnim.cancel(); ringAnim = null; cancel(ringStop);
    phoneCap.textContent = 'Socials'; $('#missed').hidden = !missed;
  }
  // Answering the call is the coffee chat: it opens the booking page.
  function answerCall() { stopRing(false); say('Picking up… grab a time to talk'); window.open($('#coffee').dataset.href, '_blank'); }
  function ignoreCall() { stopRing(false); }
  on($('#answer'), 'click', e => { e.stopPropagation(); answerCall(); });
  on($('#ignore'), 'click', e => { e.stopPropagation(); ignoreCall(); });
  every(() => {
    if (rang || overlayOpen() || small.matches || phone.classList.contains('active') || performance.now() - lastAct < 20000) return;
    rang = true; phone.classList.add('ringing'); phoneCap.textContent = 'Savar is calling… click to answer'; callSel = 0; paintCall();
    if (!still) ringAnim = phone.animate([{ rotate: '0deg' }, { rotate: '-3deg', offset: .05 }, { rotate: '3deg', offset: .1 }, { rotate: '-3deg', offset: .15 },
                                          { rotate: '3deg', offset: .2 }, { rotate: '0deg', offset: .25 }, { rotate: '0deg' }], { duration: 1400, iterations: Infinity });
    ringStop = later(() => stopRing(true), 14000);
  }, 1000);
  on(phone, 'pointerenter', () => { if (ringAnim) ringAnim.pause(); });
  on(phone, 'pointerleave', () => { if (ringAnim) ringAnim.play(); });

  // ---------- Sugar cubes: drag one into the coffee ----------
  const coffee = $('#coffee');
  const liquid = $('#liquid');
  const coffeecap = $('#coffeecap');
  const cubehint = $('#cubehint');
  let sugars = store.get('sugars', 0);
  const sugarCap = () => { coffeecap.textContent = sugars ? `Coffee chat · ${sugars} sugar${sugars > 1 ? 's' : ''}` : 'Coffee chat'; };

  function toStage(x, y) {                    // client px → stage px
    const r = stage.getBoundingClientRect();
    return { x: (x - r.left) / scale, y: (y - r.top) / scale };
  }

  function splash(clientX, clientY) {
    const L = liquid.getBoundingClientRect();
    const cs = parseFloat(coffee.style.getPropertyValue('--ms')) || 1;   // the cup's pocket scale
    const rad = liquid.offsetWidth / 2;     // liquid radius in its own px (a circle, so rotation does not matter)
    // Drop point in the liquid's own (rotated) frame, for the ripples.
    const ang = -(parseFloat(coffee.style.getPropertyValue('--r')) || 0) * Math.PI / 180;
    const dx = (clientX - (L.left + L.width / 2)) / (scale * cs), dy = (clientY - (L.top + L.height / 2)) / (scale * cs);
    const lx = rad + dx * Math.cos(ang) - dy * Math.sin(ang), ly = rad + dx * Math.sin(ang) + dy * Math.cos(ang);
    [0, 160].forEach((delay, i) => {
      const ring = document.createElement('div');
      ring.className = 'ripple'; ring.style.left = lx + 'px'; ring.style.top = ly + 'px';
      liquid.appendChild(ring);
      ring.animate([{ transform: 'scale(.1)', opacity: 1 }, { transform: `scale(${2.4 - i * .5})`, opacity: 0 }],
                   { duration: 750, delay, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)', fill: 'backwards' }).finished.then(() => ring.remove());
    });
    const p = toStage(clientX, clientY);
    // Splat: an eight-lobed blob that pops and shrinks.
    const pts = [];
    for (let i = 0; i < 16; i++) { const rr = i % 2 ? 11 : 22, t = i / 16 * Math.PI * 2; pts.push(`${(Math.cos(t) * rr).toFixed(1)},${(Math.sin(t) * rr).toFixed(1)}`); }
    const splat = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    splat.setAttribute('class', 'splat'); splat.setAttribute('viewBox', '-30 -30 60 60');
    Object.assign(splat.style, { left: p.x - 30 * cs + 'px', top: p.y - 30 * cs + 'px', width: 60 * cs + 'px', height: 60 * cs + 'px' });
    splat.innerHTML = `<polygon points="${pts.join(' ')}" fill="#4a2a16" stroke="#1a0d06" stroke-width="2.5" stroke-linejoin="round"/><circle cx="-6" cy="-7" r="4" fill="#c89a6e"/>`;
    stage.appendChild(splat);
    splat.animate([{ transform: 'scale(0) rotate(0deg)' }, { transform: 'scale(1.2) rotate(12deg)', offset: .35 }, { transform: 'scale(0) rotate(20deg)' }],
                  { duration: 420, easing: 'cubic-bezier(0.2, 1.4, 0.4, 1)' }).finished.then(() => splat.remove());
    // Fat drops burst out, pointing the way they fly, arc up and fall back.
    for (let i = 0; i < 9; i++) {
      const d = document.createElement('div'), s = (9 + Math.random() * 7) * cs, a = (i / 9) * Math.PI * 2 + Math.random() * .5, dist = (34 + Math.random() * 30) * cs;
      const ddx = Math.cos(a) * dist, ddy = Math.sin(a) * dist, deg = a * 180 / Math.PI + 90;
      d.className = 'drop';
      Object.assign(d.style, { left: p.x - s / 2 + 'px', top: p.y - s * .6 + 'px', width: s + 'px', height: s * 1.25 + 'px' });
      stage.appendChild(d);
      d.animate([
        { transform: `translate(0,0) rotate(${deg}deg) scale(0)` },
        { transform: `translate(${ddx * .7}px, ${ddy * .7 - 18}px) rotate(${deg}deg) scale(1.25)`, offset: .45 },
        { transform: `translate(${ddx}px, ${ddy + 8}px) rotate(${deg}deg) scale(.15)`, opacity: .6 }
      ], { duration: 640 + Math.random() * 160, easing: 'cubic-bezier(0.2, 1.1, 0.4, 1)' }).finished.then(() => d.remove());
    }
    // "plop!"
    const w = document.createElement('div');
    w.className = 'plop'; w.textContent = 'plop!';
    Object.assign(w.style, { left: p.x + 18 * cs + 'px', top: p.y - 30 * cs + 'px', fontSize: 17 * Math.max(cs, .7) + 'px' });
    stage.appendChild(w);
    w.animate([{ transform: 'translateY(8px) rotate(-8deg) scale(.5)', opacity: 0 }, { transform: 'translateY(-6px) rotate(-8deg) scale(1.15)', opacity: 1, offset: .3 },
               { transform: 'translateY(-26px) rotate(-8deg) scale(1)', opacity: 0 }], { duration: 900, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)' }).finished.then(() => w.remove());
    // The cup squashes and stretches.
    coffee.animate([{ scale: '1 1' }, { scale: '1.06 .94' }, { scale: '.97 1.04' }, { scale: '1.01 .99' }, { scale: '1 1' }], { duration: 460, easing: 'ease-out' });
    sugars++; store.set('sugars', sugars); sugarCap();
    if (sugars === 1) say("I take mine black, but you do you.");
  }

  sugarCap();
  cubes.forEach(cube => {
    let start = null;
    on(cube, 'pointerenter', () => cubehint.classList.add('show'));
    on(cube, 'pointerleave', () => { if (!start) cubehint.classList.remove('show'); });
    on(cube, 'pointerdown', e => {
      start = { x: e.clientX, y: e.clientY, left: cube.offsetLeft, top: cube.offsetTop };
      cube.setPointerCapture(e.pointerId); cube.classList.add('dragging');
    });
    on(cube, 'pointercancel', () => { start = null; cube.classList.remove('dragging'); });
    on(cube, 'pointermove', e => {
      if (!start) return;
      cube.style.left = start.left + (e.clientX - start.x) / scale + 'px';
      cube.style.top = start.top + (e.clientY - start.y) / scale + 'px';
    });
    on(cube, 'pointerup', async () => {
      if (!start) return;
      start = null; cube.classList.remove('dragging'); cubehint.classList.remove('show');
      const c = cube.getBoundingClientRect(), L = liquid.getBoundingClientRect();
      const cx = c.left + c.width / 2, cy = c.top + c.height / 2;
      const [hx, hy] = homes.get(cube);
      if (Math.hypot(cx - (L.left + L.width / 2), cy - (L.top + L.height / 2)) > L.width / 2 * 0.9) {
        if (cube.offsetLeft === hx && cube.offsetTop === hy) return;
        if (!small.matches) return messy();
        const bx = cube.offsetLeft - hx, by = cube.offsetTop - hy;      // phones have no tidy button: slide back
        cube.style.left = hx + 'px'; cube.style.top = hy + 'px';
        if (!still) cube.animate([{ translate: `${bx}px ${by}px` }, { translate: '0 0' }], { duration: 320, easing: 'cubic-bezier(0.3, 0.8, 0.3, 1)' });
        return;
      }
      cube.style.pointerEvents = 'none';
      const cr = parseFloat(cube.style.getPropertyValue('--cr')) || 0;
      await cube.animate([{ scale: '1.12', rotate: cr + 'deg', opacity: 1 }, { scale: '.25', rotate: cr + 40 + 'deg', opacity: 0 }],
                         { duration: still ? 1 : 200, easing: 'cubic-bezier(0.6, 0, 1, 0.5)', fill: 'forwards' }).finished;
      if (!still) splash(cx, cy); else { sugars++; store.set('sugars', sugars); sugarCap(); }
      // A fresh cube returns to the pile so the toy never runs out.
      later(() => {
        cube.getAnimations().forEach(a => a.cancel());
        cube.style.left = hx + 'px'; cube.style.top = hy + 'px'; cube.style.pointerEvents = '';
        cube.animate([{ opacity: 0, scale: '.6' }, { opacity: 1, scale: '1' }], { duration: still ? 1 : 320, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1.3)' });
      }, 1400);
    });
  });

  // ---------- The Muji pen: pick it up and write in the notebook ----------
  // On the open notebook, a press on the pen picks it up: a copy (#pen) lifts off the page and follows the
  // pointer, tip first, and the cursor hides. Press and drag on the right page to write. A press anywhere off
  // the page, or Esc, puts the pen back. The ink stays in this browser until "tidy up" wipes the page.
  const restPen = nb.querySelector('.pen'), pageR = nb.querySelector('.page-r'), inkCvs = nb.querySelector('.ink');
  const heldPen = $('#pen'), nib = heldPen.querySelector('.nib'), penHint = $('#penhint');
  const ink = inkCvs.getContext('2d');
  const PW = 165, PH = 244, RES = inkCvs.width / PW;          // the page in desk px; canvas px per page px
  const PAPER = [3, 3, 160, 241];                              // where ink can go: inside the page's edges
  const NIB = 1.15, INK = '#222026', MAX_POINTS = 6000;         // line width (page px), gel ink, what we keep
  const HOLD_ANGLE = 26;                                       // leaning right, like a hand writing
  const rest = { x: parseFloat(restPen.style.left), y: parseFloat(restPen.style.top), a: parseFloat(restPen.style.getPropertyValue('--a')) };
  let strokes = store.get('ink', []), stroke = null, following = false, glideId = 0, pose = null, ptr = { x: 0, y: 0 }, swallow = false;
  strokes = Array.isArray(strokes) ? strokes.filter(s => Array.isArray(s) && s.length >= 2 && s.length % 2 === 0 && s.every(Number.isFinite)) : [];

  // The right page's frame on screen: its centre, rotation, and scale (stage × open book × pocket).
  function pageFrame() {
    const r = pageR.getBoundingClientRect(), th = (parseFloat(nb.style.getPropertyValue('--r')) || 0) * Math.PI / 180;
    const k = r.width / (PW * Math.abs(Math.cos(th)) + PH * Math.abs(Math.sin(th))) || 1;
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, th, k };
  }
  function toPage(f, x, y) {
    const dx = (x - f.cx) / f.k, dy = (y - f.cy) / f.k, c = Math.cos(f.th), s = Math.sin(f.th);
    return { x: PW / 2 + dx * c + dy * s, y: PH / 2 - dx * s + dy * c };
  }
  function fromPage(f, x, y) {
    const dx = (x - PW / 2) * f.k, dy = (y - PH / 2) * f.k, c = Math.cos(f.th), s = Math.sin(f.th);
    return { x: f.cx + dx * c - dy * s, y: f.cy + dx * s + dy * c };
  }
  const onPaper = p => p.x > PAPER[0] && p.x < PAPER[2] && p.y > PAPER[1] && p.y < PAPER[3];

  // Where the pen is drawn: its tip on screen, its angle, its scale.
  function place(p) {
    pose = p;
    heldPen.style.transform = `translate(${p.x}px, ${p.y}px)`;
    nib.style.transform = `rotate(${p.a}deg) scale(${p.k})`;
  }
  function restPose() { const f = pageFrame(), t = fromPage(f, rest.x, rest.y); return { x: t.x, y: t.y, a: rest.a + f.th * 180 / Math.PI, k: f.k }; }
  function holdPose() { return { x: ptr.x, y: ptr.y, a: HOLD_ANGLE, k: pageFrame().k * 1.04 }; }
  const easeOutPen = k => 1 - Math.pow(1 - k, 3);
  function glide(target, ms, done) {
    const id = ++glideId, from = pose, t0 = performance.now();
    (function f(now) {
      if (id !== glideId) return;
      const e = easeOutPen(Math.min((now - t0) / ms, 1)), to = target();
      place({ x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, a: from.a + (to.a - from.a) * e, k: from.k + (to.k - from.k) * e });
      if (e < 1) raf(f); else done();
    })(t0);
  }
  function penSay(html) { penHint.innerHTML = html; penHint.classList.toggle('show', !!html); }

  function pickUp(e) {
    holding = true; ptr = { x: e.clientX, y: e.clientY };
    place(restPose());
    restPen.style.visibility = 'hidden'; heldPen.classList.add('show'); root.classList.add('inking'); nb.classList.add('open');
    penSay('write on the page · <kbd>esc</kbd> to put it down');
    if (still) { following = true; return place(holdPose()); }
    following = false; glide(holdPose, 220, () => { following = true; });
  }
  function putDown() {
    if (!holding) return;
    endStroke(); holding = false; following = false; penSay('');
    root.classList.remove('inking'); heldPen.classList.remove('down');
    const settle = () => {
      heldPen.classList.remove('show'); restPen.style.visibility = '';
      if (!nb.matches(':hover') && document.activeElement !== nb) nb.classList.remove('open');
    };
    if (still) return settle();
    glide(restPose, 300, settle);
  }

  // Ink: smooth curves through the midpoints, one canvas, page units scaled up for a sharp line.
  function pen0() {
    if (!ink) return false;
    ink.restore(); ink.save();                  // one clip at a time: the paper, so a line runs off the edge, not along it
    ink.setTransform(RES, 0, 0, RES, 0, 0);
    ink.beginPath(); ink.rect(PAPER[0], PAPER[1], PAPER[2] - PAPER[0], PAPER[3] - PAPER[1]); ink.clip();
    ink.lineWidth = NIB; ink.lineCap = 'round'; ink.lineJoin = 'round'; ink.strokeStyle = ink.fillStyle = INK;
    return true;
  }
  function segment(pts, i) {                   // draws the curve that point i completes
    const n = pts.length / 2, x = j => pts[j * 2], y = j => pts[j * 2 + 1];
    ink.beginPath();
    if (i === 0) { ink.arc(x(0), y(0), NIB / 2, 0, Math.PI * 2); ink.fill(); return; }
    if (i === 1) { ink.moveTo(x(0), y(0)); ink.lineTo((x(0) + x(1)) / 2, (y(0) + y(1)) / 2); }
    else {
      ink.moveTo((x(i - 2) + x(i - 1)) / 2, (y(i - 2) + y(i - 1)) / 2);
      ink.quadraticCurveTo(x(i - 1), y(i - 1), (x(i - 1) + x(i)) / 2, (y(i - 1) + y(i)) / 2);
    }
    ink.stroke();
    if (i === n - 1 && i > 0 && !stroke) { ink.beginPath(); ink.moveTo((x(i - 1) + x(i)) / 2, (y(i - 1) + y(i)) / 2); ink.lineTo(x(i), y(i)); ink.stroke(); }
  }
  function redraw() {
    if (!pen0()) return;
    ink.clearRect(-1, -1, PW + 2, PH + 2);
    strokes.forEach(pts => { for (let i = 0; i < pts.length / 2; i++) segment(pts, i); });
  }
  function addPoint(p) {
    const pts = stroke, n = pts.length / 2;
    if (n && Math.hypot(p.x - pts[n * 2 - 2], p.y - pts[n * 2 - 1]) < .35) return;
    pts.push(Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10);
    if (pen0()) segment(pts, n);
  }
  function endStroke() {
    if (!stroke) return;
    const pts = stroke; stroke = null; heldPen.classList.remove('down');
    if (pen0() && pts.length >= 4) segment(pts, pts.length / 2 - 1);      // the last half-segment, to the tip
    strokes.push(pts);
    let total = strokes.reduce((t, s) => t + s.length / 2, 0);
    while (total > MAX_POINTS && strokes.length > 1) total -= strokes.shift().length / 2;
    store.set('ink', strokes); messy();
  }
  function wipeInk() {
    if (!strokes.length) return;
    strokes = []; store.set('ink', strokes);
    if (still) return redraw();
    inkCvs.classList.add('wipe'); later(() => { redraw(); inkCvs.classList.remove('wipe'); }, 380);
  }
  redraw();

  on(restPen, 'pointerdown', e => {
    if (holding || small.matches || !nb.classList.contains('open') || e.button !== 0) return;
    e.preventDefault(); e.stopPropagation(); pickUp(e);
  });
  on(restPen, 'pointerenter', () => { if (!holding && nb.classList.contains('open')) penSay('click the pen to write'); });
  on(restPen, 'pointerleave', () => { if (!holding) penSay(''); });
  // While the pen is held, presses belong to it: on the page they write, anywhere else they put it down.
  on(window, 'pointerdown', e => {
    if (!holding) { swallow = false; return; }
    e.preventDefault(); e.stopPropagation(); swallow = true;
    const p = toPage(pageFrame(), e.clientX, e.clientY);
    if (e.button !== 0 || !onPaper(p)) return putDown();
    ptr = { x: e.clientX, y: e.clientY }; if (following) place(holdPose());
    stroke = []; heldPen.classList.add('down'); addPoint(p);
  }, { capture: true });
  on(window, 'pointermove', e => {
    if (!holding) return;
    ptr = { x: e.clientX, y: e.clientY };
    if (following) place(holdPose());
    if (!stroke) return;
    if (!(e.buttons & 1)) return endStroke();
    const f = pageFrame();
    (e.getCoalescedEvents ? e.getCoalescedEvents() : []).concat(e).forEach(ev => {
      const p = toPage(f, ev.clientX, ev.clientY);
      if (p.x > -20 && p.x < PW + 20 && p.y > -20 && p.y < PH + 20) addPoint(p);
    });
  });
  on(window, 'pointerup', e => { if (stroke) { e.stopPropagation(); endStroke(); } }, { capture: true });
  on(window, 'pointercancel', endStroke);
  on(window, 'click', e => { if (holding || swallow) { e.preventDefault(); e.stopPropagation(); swallow = false; } }, { capture: true });
  on(window, 'keydown', e => { if (e.key === 'Escape' && holding) putDown(); });
  on(window, 'blur', putDown);
  on(small, 'change', putDown);

  // ---------- RAZR shows Savar's local time (Vancouver) ----------
  function vancouverNow() {
    const now = new Date(), tz = 'America/Vancouver';
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true })
      .formatToParts(now).map(p => [p.type, p.value]));
    const date = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' }).format(now)
      .replace(',', '').toUpperCase();
    $('#ltime').textContent = `${parts.hour}:${parts.minute}`;
    $('#lampm').textContent = parts.dayPeriod;
    $('#ldate').textContent = date;
    $$('#mtime, .mtime').forEach(el => { el.textContent = `${parts.hour}:${parts.minute}`; });
    $('#ftime').textContent = `${parts.hour}:${parts.minute} ${parts.dayPeriod}`;
  }
  vancouverNow(); every(vancouverNow, 10000);

  // ---------- Ghost-catching blob (Luigi's Mansion style) ----------
  // It hides behind desk objects and peeks out. Get close and it notices ("!"), then runs to other cover, slowly enough to catch.
  // Touch it and it is stunned: a heart with 30 appears. It struggles away from the cursor; stay close and the number counts down.
  // Fall behind and it breaks free. At 0 it panics, spins, and is sucked into the cursor. It comes back a few seconds later.
  (function ghost() {
    if (still) return;
    const J = $('#jerry'), body = J.querySelector('.body'), eyes = J.querySelector('.eyes'), lids = J.querySelector('.lids');
    const tally = $('#tally');
    const B = 40, SPEED = 0.26, HP = 30, objs = $$('.obj[data-vis]');
    let x = -100, y = -100, home = null, state = 'off', until = 0, runId = 0, hp = HP, caughtN = store.get('caught', 0), hpEl = null;
    if (caughtN) { tally.textContent = `caught: ${caughtN}`; tally.classList.add('show'); }
    const FACTS = [
      'Savar has hot-fired a liquid rocket engine (LOX and ethanol) with SFU Rocketry.',
      'He takes his coffee black.',
      'He has placed 1st in four case competitions and hackathons.',
      'He co-founded Unify, a settlement app used by 350+ newcomers to Canada.',
      "He's studying two degrees at once: Mechatronics Engineering and Business.",
      'He designed a 2-layer PCB for an ESP32-S3 wearable.',
      'He rates everything he eats on Beli.',
      "He's made the Dean's Honour Roll seven times.",
      "He's been to Japan, Turkey, Indonesia, and Hawaii.",
      'The phone on this desk is set to his Vancouver time.'
    ];
    const factEl = $('#fact'); let factT = 0;
    function showFact(n) {
      factEl.innerHTML = `<b>fun fact #${n}</b>${FACTS[(n - 1) % FACTS.length]}`; factEl.classList.add('show');
      cancel(factT); factT = later(() => factEl.classList.remove('show'), 6000);
    }
    let px = -1e4, py = -1e4;
    const rand = (a, b) => a + Math.random() * (b - a);
    const put = () => { J.style.transform = `translate(${x - B / 2}px, ${y - B / 2}px)`; };
    const heart = '<svg viewBox="0 0 24 24"><path fill="#ef4444" d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3.1 1.7-1.9 3.2-3.1 5.3-3.1 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"/></svg>';

    function rect(o) {
      const [l, t, r, b] = o.dataset.vis.split(' ').map(Number), w = o.offsetWidth, h = o.offsetHeight;
      return { l: o.offsetLeft + w * l, t: o.offsetTop + h * t, r: o.offsetLeft + w * r, b: o.offsetTop + h * b,
               get cx() { return (this.l + this.r) / 2; }, get cy() { return (this.t + this.b) / 2; } };
    }
    const near = (R, pad) => px > R.l - pad && px < R.r + pad && py > R.t - pad && py < R.b + pad;
    function peekSpot(R) {
      const sides = ['top', 'right', 'left'].filter(s => s !== 'left' || R.l > 60).filter(s => s !== 'right' || R.r < 1380).filter(s => s !== 'top' || R.t > 50);
      const f = s => ({ top: [0, -1], right: [1, 0], left: [-1, 0] }[s]); const dx = px - R.cx, dy = py - R.cy;
      sides.sort((a, b) => (f(b)[0] * dx + f(b)[1] * dy) - (f(a)[0] * dx + f(a)[1] * dy) + rand(-80, 80));
      const s = sides[0] || 'top', out = B * 0.12;
      if (s === 'top') return { s, x: rand(R.l + B * .6, R.r - B * .6), y: R.t - out };
      return { s, x: s === 'right' ? R.r + out : R.l - out, y: rand(R.t + B * .7, Math.min(R.b - B * .7, R.t + (R.b - R.t) * .6)) };
    }
    function tween(tx, ty, ms, ease) {
      const id = ++runId, x0 = x, y0 = y, t0 = performance.now();
      return new Promise(done => (function f(now) {
        if (id !== runId) return done(false);
        const k = Math.min((now - t0) / ms, 1), e = ease(k); x = x0 + (tx - x0) * e; y = y0 + (ty - y0) * e; put();
        if (k < 1) raf(f); else done(true);
      })(t0));
    }
    const easeOut = k => 1 - Math.pow(1 - k, 3), easeInOut = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    function look(dx, dy) { const d = Math.hypot(dx, dy) || 1, f = J.classList.contains('flip') ? -1 : 1; eyes.style.transform = `translate(${dx / d * 2.5 * f}px, ${dy / d * 2.5}px)`; }
    function blink() {
      if (state !== 'peek') return;
      const b = () => lids.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.1)' }, { transform: 'scaleY(1)' }], { duration: 150 });
      b(); if (Math.random() < .25) later(b, 220); later(blink, rand(1600, 3800));
    }
    function pop(cls, text, dx, dy, ms) {
      const el = document.createElement('div'); el.className = cls; el.textContent = text; Object.assign(el.style, { left: x + dx + 'px', top: y + dy + 'px' }); stage.appendChild(el);
      el.animate([{ opacity: 0, transform: 'translateY(6px) scale(.6)' }, { opacity: 1, transform: 'none', offset: .2 }, { opacity: 0, transform: 'translateY(-10px)' }],
                 { duration: ms, easing: 'ease-out' }).finished.then(() => el.remove());
    }
    function puffs() {
      for (let i = 0; i < 3; i++) {
        const p = document.createElement('div'); p.className = 'puff'; p.style.left = x + rand(-10, 10) + 'px'; p.style.top = y + B * .35 + 'px'; stage.appendChild(p);
        p.animate([{ transform: 'scale(.4)', opacity: .9 }, { transform: `translate(${rand(-18, 18)}px, ${rand(-10, 4)}px) scale(1.6)`, opacity: 0 }],
                  { duration: 420 + i * 80, easing: 'ease-out' }).finished.then(() => p.remove());
      }
    }

    // It spots you first, then runs: that pause is your chance.
    function notice() {
      if (state !== 'peek') return;
      state = 'notice'; pop('bang', '!', 16, -44, 700);
      lids.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1.2)' }], { duration: 250, fill: 'forwards' });
      later(() => { lids.getAnimations().forEach(a => a.cancel()); if (state === 'notice') flee(); }, 550);
    }
    async function flee() {
      const cands = objs.filter(o => o !== home && !o.matches('.dragging, .sliding')).map(o => {
        const R = rect(o), dC = Math.hypot(R.cx - px, R.cy - py), dMe = Math.hypot(R.cx - x, R.cy - y);
        const t = Math.max(0, Math.min(1, ((px - x) * (R.cx - x) + (py - y) * (R.cy - y)) / (dMe * dMe || 1)));
        const pass = Math.hypot(x + (R.cx - x) * t - px, y + (R.cy - y) * t - py);
        return { o, R, score: dC - .6 * dMe - (pass < 120 ? 300 : 0) + rand(0, 60) };
      }).sort((a, b) => b.score - a.score);
      const pick = cands[0]; if (!pick) return;
      state = 'run'; home = pick.o;
      J.classList.toggle('flip', pick.R.cx < x); look(pick.R.cx - x, pick.R.cy - y); puffs();
      const bob = body.animate([{ transform: 'scale(1,1) translateY(0)' }, { transform: 'scale(1.1,.9) translateY(2px)' }, { transform: 'scale(.95,1.06) translateY(-5px)' }, { transform: 'scale(1,1) translateY(0)' }],
                               { duration: 260, iterations: Infinity });
      const dist = Math.hypot(pick.R.cx - x, pick.R.cy - y);
      const ok = await tween(pick.R.cx, pick.R.cy, Math.max(900, Math.min(3200, dist / SPEED)), easeInOut);
      bob.cancel(); if (!ok) return;
      home.animate([{ translate: '0 0' }, { translate: '2px -1px' }, { translate: '-2px 1px' }, { translate: '0 0' }], { duration: 220 });
      state = 'hide'; until = performance.now() + rand(1400, 2600);
    }
    async function peekOut() {
      const R = rect(home), s = peekSpot(R); state = 'coming';
      J.classList.toggle('flip', s.s === 'left');
      const ok = await tween(s.x, s.y, 520, easeOut); if (!ok) return;
      state = 'peek'; until = performance.now() + rand(7000, 12000); later(blink, 500);
    }
    // Entrance: pop up from behind a letter of the name and perch on it, then run off to hide.
    const easeBack = k => 1 + 2.7 * Math.pow(k - 1, 3) + 1.7 * Math.pow(k - 1, 2);
    async function spawnFromName() {
      const h1 = $('.greet h1'), hl = h1.querySelector('.hl');
      const pick = [[h1.firstChild, 0], [h1.firstChild, 4], [hl.firstChild, 0]][Math.floor(Math.random() * 3)];
      const r = document.createRange(); r.setStart(pick[0], pick[1]); r.setEnd(pick[0], pick[1] + 1);
      const g = r.getBoundingClientRect(), sr = stage.getBoundingClientRect();
      const cx = ((g.left + g.right) / 2 - sr.left) / scale;
      const cap = pick[0] === hl.firstChild ? (hl.getBoundingClientRect().top - sr.top) / scale : (g.bottom - sr.top) / scale - 0.969 * 64;
      home = null; J.classList.remove('flip', 'caught', 'stunned'); body.getAnimations().forEach(a => a.cancel());
      x = cx; y = cap + B / 2 + 10; put(); J.style.visibility = 'visible';        // starts behind the letter
      state = 'coming';
      const ok = await tween(cx, cap - B / 2 + 1, 520, easeBack); if (!ok) return;
      body.animate([{ transform: 'scale(1,1)' }, { transform: 'scale(1.12,.86)' }, { transform: 'scale(.97,1.04)' }, { transform: 'scale(1,1)' }], { duration: 360 });
      state = 'peek'; until = performance.now() + rand(2200, 3200); later(blink, 400);
    }
    async function tuck() { if (!home) return flee(); state = 'coming'; const R = rect(home); if (await tween(R.cx, R.cy, 600, easeInOut)) { state = 'hide'; until = performance.now() + rand(2500, 5000); } }

    // ---- stun, tug of war, capture ----
    function stun() {
      if (state === 'stun' || state === 'caught' || state === 'off' || state === 'hide') return;
      runId++; body.getAnimations().forEach(a => a.cancel()); state = 'stun'; hp = HP; J.classList.add('stunned');
      const f = document.createElement('div'); f.className = 'flash'; Object.assign(f.style, { left: x + 'px', top: y + 'px' }); stage.appendChild(f);
      f.animate([{ transform: 'scale(.6)', opacity: 1 }, { transform: 'scale(2.4)', opacity: 0 }], { duration: 420, easing: 'ease-out' }).finished.then(() => f.remove());
      hpEl = document.createElement('div'); hpEl.className = 'hp'; stage.appendChild(hpEl);
      const shake = body.animate([{ transform: 'translate(0,0) rotate(0)' }, { transform: 'translate(-1.5px,1px) rotate(-6deg)' }, { transform: 'translate(1.5px,-1px) rotate(6deg)' }, { transform: 'translate(0,0) rotate(0)' }],
                                 { duration: 140, iterations: Infinity });
      let last = performance.now(); const t0 = last;
      (function tug(now) {
        if (state !== 'stun') { shake.cancel(); return; }
        const dt = (now - last) / 1000; last = now;
        const dx = x - px, dy = y - py, d = Math.hypot(dx, dy) || 1;
        if (now - t0 > 300) { x += dx / d * 55 * dt; y += dy / d * 55 * dt; }       // after the stun, it pulls away from you
        x = Math.max(24, Math.min(1416, x)); y = Math.max(24, Math.min(876, y)); put();
        if (d < 85) hp -= 20 * dt; else if (now - t0 > 300) { shake.cancel(); return breakFree(); }
        hpEl.innerHTML = heart + Math.max(0, Math.ceil(hp)); Object.assign(hpEl.style, { left: x - 22 + 'px', top: y - B / 2 - 30 + 'px' });
        if (hp <= 0) { shake.cancel(); return caught(); }
        raf(tug);
      })(last);
    }
    function breakFree() {
      J.classList.remove('stunned'); if (hpEl) hpEl.remove(); hpEl = null; pop('bang', 'hmph!', 18, -40, 900);
      state = 'peek'; flee();
    }
    async function caught() {
      state = 'caught'; if (hpEl) hpEl.remove(); hpEl = null; J.classList.remove('stunned'); J.classList.add('caught');
      pop('bang', 'AAAH!', 14, -46, 900);
      await body.animate([{ transform: 'rotate(0) scale(1)' }, { transform: 'rotate(-12deg) scale(1.08)' }, { transform: 'rotate(12deg) scale(.96)' }, { transform: 'rotate(-10deg) scale(1.06)' }, { transform: 'rotate(0) scale(1)' }],
                         { duration: 600 }).finished;
      // sucked into the cursor
      body.animate([{ transform: 'rotate(0) scale(1)' }, { transform: 'rotate(540deg) scale(0)' }], { duration: 480, easing: 'cubic-bezier(0.6, 0, 1, 0.5)', fill: 'forwards' });
      await tween(px, py, 480, k => k * k);
      const c = document.createElement('div'); c.className = 'bang'; c.textContent = 'caught!'; Object.assign(c.style, { left: px + 10 + 'px', top: py - 28 + 'px' }); stage.appendChild(c);
      c.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1.1)', offset: .25 }, { opacity: 0, transform: 'translateY(-14px)' }], { duration: 1200 }).finished.then(() => c.remove());
      caughtN++; store.set('caught', caughtN); tally.textContent = `caught: ${caughtN}`; tally.classList.add('show'); showFact(caughtN);
      J.style.visibility = 'hidden'; J.classList.remove('caught'); body.getAnimations().forEach(a => a.cancel());
      state = 'off'; until = performance.now() + 4000;
    }

    on(window, 'pointermove', e => {
      if (overlayOpen()) return;
      const p = toStage(e.clientX, e.clientY); px = p.x; py = p.y;
      const d = Math.hypot(px - x, py - y);
      if (['peek', 'coming', 'notice', 'run'].includes(state) && d < 30) return stun();
      if (state === 'peek') { if (d < 170) notice(); else look(px - x, py - y); }
      else if (state === 'hide' && home && near(rect(home), 30)) flee();
    });
    on(J, 'pointerdown', () => stun());
    every(() => {
      if (small.matches) return;
      const t = performance.now();
      if (state === 'off' && !typing && t > Math.max(until, 1500)) {
        spawnFromName();
      } else if (state === 'hide' && t > until) {
        if (home.matches('.dragging, .sliding')) return flee();
        if (!near(rect(home), 140)) peekOut();
      } else if (state === 'peek') {
        if (home && home.matches('.dragging, .sliding')) return notice();
        if (t > until) { if (Math.random() < .5) flee(); else tuck(); }
      }
    }, 150);
  })();

  // ---------- Resume: hyperspace zoom ----------
  const resume = $('#resume');
  const iris = $('#iris');
  const flyer = $('#flyer');
  const viewer = $('#viewer');
  const page = $('#page');
  const cvs = $('#stars');
  const ctx = cvs.getContext('2d');
  let busy = false;

  // Streaking starfield. dir = 1 flies forward, -1 flies back out.
  function hyperspace(ms, dir) {
    const dpr = devicePixelRatio || 1, W = innerWidth, H = innerHeight;
    cvs.width = W * dpr; cvs.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cx = W / 2, cy = H / 2;
    const stars = Array.from({ length: 520 }, () => ({ x: (Math.random() * 2 - 1) * W, y: (Math.random() * 2 - 1) * H, z: Math.random() * 0.9 + 0.1 }));
    const t0 = performance.now(); let last = t0;
    return new Promise(done => {
      (function frame(now) {
        const p = Math.min((now - t0) / ms, 1), dt = (now - last) / 1000; last = now;
        const env = Math.sin(Math.PI * p);            // 0 → 1 → 0
        const v = 2.6 * env * env;                     // speed, peaks mid-flight
        ctx.clearRect(0, 0, W, H);
        ctx.globalAlpha = Math.min(1, env * 1.6);
        ctx.lineCap = 'round';
        for (const s of stars) {
          const pz = s.z;
          s.z -= dir * v * dt;
          if (s.z <= 0.04) { s.z = 1; s.x = (Math.random() * 2 - 1) * W; s.y = (Math.random() * 2 - 1) * H; continue; }
          if (s.z > 1) { s.z = 0.05; continue; }
          const x1 = cx + s.x / pz * 0.5, y1 = cy + s.y / pz * 0.5;
          const x2 = cx + s.x / s.z * 0.5, y2 = cy + s.y / s.z * 0.5;
          const k = 1 - s.z;
          ctx.strokeStyle = `rgba(${200 + 55 * k | 0}, ${215 + 40 * k | 0}, 255, ${0.25 + 0.75 * k})`;
          ctx.lineWidth = 0.6 + 2.2 * k;
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        }
        if (p < 1) raf(frame); else { ctx.clearRect(0, 0, W, H); done(); }
      })(t0);
    });
  }

  // Transform that lays the full-size page exactly over the paper on the desk.
  function deskPose() {
    const r = resume.getBoundingClientRect(), pr = page.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const lifted = !small.matches && resume.matches(':hover, :focus-visible');   // match the hover pose so the hand-off has no jump
    const ms = parseFloat(resume.style.getPropertyValue('--ms')) || 1;
    const k = (resume.offsetWidth * scale * ms * (lifted ? 1.03 : 1)) / pr.width;
    const rot = (parseFloat(resume.style.getPropertyValue('--r')) || 0) + (lifted ? 2 : 0);
    return { cx, cy, t: `translate(${cx - (pr.left + pr.width / 2)}px, ${cy - (pr.top + pr.height / 2)}px) rotate(${rot}deg) scale(${k})` };
  }
  function placeFlyer() {
    const pr = page.getBoundingClientRect();
    Object.assign(flyer.style, { left: pr.left + 'px', top: pr.top + 'px', width: pr.width + 'px', height: pr.height + 'px', display: 'block' });
  }

  // The full-size resume (about 500 KB) loads only when someone reaches for the paper.
  function loadResume() { [flyer, page].forEach(i => { if (!i.src) i.src = i.dataset.src; }); return page.decode ? page.decode().catch(() => {}) : Promise.resolve(); }
  on(resume, 'pointerenter', loadResume, { once: true });
  on(resume, 'focus', loadResume, { once: true });

  async function warpIn() {
    if (busy) return; busy = true;
    await loadResume();
    viewer.scrollTop = 0;
    if (still) { viewer.classList.add('show'); viewer.setAttribute('aria-hidden', 'false'); $('#back').focus(); busy = false; return; }
    const pose = deskPose();
    placeFlyer(); resume.style.visibility = 'hidden';
    iris.style.setProperty('--cx', pose.cx + 'px'); iris.style.setProperty('--cy', pose.cy + 'px');
    raf(() => iris.classList.add('closed'));
    const fly = flyer.animate([
      { transform: pose.t },
      { transform: pose.t.replace(/scale\(([\d.]+)\)/, (m, k) => `scale(${k * 0.92})`), offset: 0.18 },   // small pull-back before the jump
      { transform: 'scale(1.05)', offset: 0.86 },
      { transform: 'none' }
    ], { duration: 1250, easing: 'cubic-bezier(0.7, 0, 0.2, 1)', fill: 'forwards' });
    await Promise.all([fly.finished, hyperspace(1250, 1)]);
    viewer.classList.add('show'); viewer.setAttribute('aria-hidden', 'false');
    later(() => { flyer.style.display = 'none'; fly.cancel(); }, 230);
    $('#back').focus();
    busy = false;
  }

  async function warpOut() {
    if (busy) return; busy = true;
    viewer.scrollTop = 0;
    if (still) { viewer.classList.remove('show'); viewer.setAttribute('aria-hidden', 'true'); busy = false; return; }
    placeFlyer();
    viewer.classList.remove('show'); viewer.setAttribute('aria-hidden', 'true');
    const pose = deskPose();
    iris.style.setProperty('--cx', pose.cx + 'px'); iris.style.setProperty('--cy', pose.cy + 'px');
    const fly = flyer.animate([{ transform: 'none' }, { transform: pose.t }],
      { duration: 900, easing: 'cubic-bezier(0.5, 0, 0.2, 1)', fill: 'forwards' });
    later(() => iris.classList.remove('closed'), 350);
    await Promise.all([fly.finished, hyperspace(900, -1)]);
    resume.style.visibility = '';
    flyer.style.display = 'none'; fly.cancel();
    resume.focus({ preventScroll: true });
    busy = false;
  }
  on($('#back'), 'click', warpOut);
  on(window, 'keydown', e => { if (e.key === 'Escape' && viewer.classList.contains('show')) warpOut(); });

  // ---------- Pocket desk (M3): where each object sits on a phone (table in pocket.js) ----------
  // The markup's own (desk) positions; the pre-paint script keeps a copy before it applies the pocket layout.
  const deskStyle = new Map([...objsAll, ...cubes].map(el => [el, el.dataset.deskStyle ?? el.getAttribute('style')]));
  function layout() {
    deskStyle.forEach((style, el) => el.setAttribute('style', style));      // the desk: positions from the markup
    if (small.matches) {
      POCKET.forEach(([sel, cx, cy, r, ms, row]) => {
        const el = $(sel), w = el.offsetWidth, h = el.offsetHeight;
        Object.assign(el.style, { left: cx - w / 2 + 'px', top: cy - h / 2 + 'px' });
        el.style.setProperty('--r', r + 'deg'); el.style.setProperty('--ms', ms);
        el.style.setProperty('--cy', (row - cy) / ms + h / 2 + 'px');
      });
      cubes.forEach((c, i) => {
        const [cx, cy, r] = POCKET_CUBES[i];
        Object.assign(c.style, { left: cx - c.offsetWidth / 2 + 'px', top: cy - c.offsetHeight / 2 + 'px' });
        c.style.setProperty('--cr', r + 'deg'); c.style.setProperty('--ms', CUBE_SCALE);
      });
    }
    rememberHomes(); tidyBtn.classList.toggle('show', strokes.length > 0 && !small.matches);   // ink on the page from last time can be tidied
  }
  layout();
  on(small, 'change', () => { closeSheet(); layout(); fit(); });

  // ---------- Phones: Socials opens a contact sheet ----------
  const sheet = $('#sheet'), sheetRows = $$('.sheetrows li');
  function openSheet() {
    const room = innerHeight - 290;                  // the sheet without the phone: header, buttons, hint, gaps
    sheet.style.setProperty('--k', Math.max(.75, Math.min(1.1, room / 420)).toFixed(3));
    sheet.classList.add('show'); sheet.setAttribute('aria-hidden', 'false'); sheet.scrollTop = 0;
    $('#sheetclose').focus({ preventScroll: true });
  }
  function closeSheet() {
    if (!sheet.classList.contains('show')) return;
    sheet.classList.remove('show'); sheet.setAttribute('aria-hidden', 'true');
    phone.focus({ preventScroll: true });
  }
  on($('#sheetclose'), 'click', closeSheet);
  on(sheet, 'click', e => { if (e.target === sheet) closeSheet(); });      // a tap on the dim closes it
  sheetRows.forEach(r => on(r, 'click', () => { sheetRows.forEach(x => x.classList.toggle('on', x === r)); go(r); }));
  on(window, 'keydown', e => { if (e.key === 'Escape') closeSheet(); });

  return () => {
    dead = true;
    ac.abort();
    timers.forEach(clearTimeout);
    intervals.forEach(clearInterval);
  };
}
