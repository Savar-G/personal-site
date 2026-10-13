// /bookshelf: a real shelf of hardcovers in Three.js (prototype variant C).
// shelf.tsx renders the stage, the detail card, and an accessible book list;
// this module owns the canvas: the scene, pointer + wheel + key input, and the
// pull-out animation. mountShelf() returns { select, destroy }.
//
// Units are centimetres. A book in local space: x = width (spine at -W/2),
// y = height (head at +H/2), z = thickness (front cover at +T/2).

const BOARD = 0.28; // board thickness
const OVERHANG = 0.32; // board overhang past the page block
const PX_PER_CM = 64; // spine texture resolution
const VIEW_H = 46; // visible height of the scene at the shelf, cm (desktop)
const VIEW_H_NARROW = 64; // phones: pull back so more spines fit across

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lum = ([r, g, b]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
const rgb = ([r, g, b], a = 1) => `rgba(${r | 0},${g | 0},${b | 0},${a})`;
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

function mulberry(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function loadImg(src) {
  return new Promise((res) => {
    if (!src) return res(null);
    const i = new Image();
    i.decoding = "async";
    i.onload = () => res(i);
    i.onerror = () => res(null);
    i.src = src;
  });
}

// Colours along the cover's spine-side edge (for the spine) and its average.
function sampleCover(img) {
  const c = document.createElement("canvas"); c.width = 24; c.height = 36;
  const x = c.getContext("2d", { willReadFrequently: true });
  x.drawImage(img, 0, 0, 24, 36);
  const d = x.getImageData(0, 0, 24, 36).data;
  const px = (i, j) => { const k = (j * 24 + i) * 4; return [d[k], d[k + 1], d[k + 2]]; };
  const stops = [];
  for (let s = 0; s < 6; s++) {
    let acc = [0, 0, 0], n = 0;
    for (let j = s * 6; j < s * 6 + 6; j++) for (let i = 1; i < 3; i++) { const p = px(i, j); acc = acc.map((v, k) => v + p[k]); n++; }
    stops.push(acc.map((v) => v / n));
  }
  const edge = stops.reduce((a, s) => a.map((v, k) => v + s[k] / stops.length), [0, 0, 0]);
  return { stops, edge };
}

function noise(ctx, w, h, amt, rnd) {
  const img = ctx.getImageData(0, 0, w, h), d = img.data;
  for (let i = 0; i < d.length; i += 4) { const n = (rnd() - 0.5) * amt; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  ctx.putImageData(img, 0, 0);
}

export function mountShelf(stage, books, { onSelect, onReady, onFail }) {
  let disposed = false, destroyed = false;
  let api = { select() {}, destroy() { disposed = true; } };
  const cleanups = [];
  const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); cleanups.push(() => t.removeEventListener(ev, fn, o)); };

  const start = async () => {
    const THREE = await import("three");
    if (disposed) return;

    const canvas = document.createElement("canvas");
    canvas.className = "shelf-canvas";
    canvas.setAttribute("aria-hidden", "true");
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      onFail?.();
      return;
    }
    stage.prepend(canvas);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const { RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js");
    if (disposed) { renderer.dispose(); canvas.remove(); return; }
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const disposables = [envTex];
    const track = (o) => { disposables.push(o); return o; };
    const canvasTex = (c, srgb = true) => {
      const t = new THREE.CanvasTexture(c);
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = maxAniso;
      return track(t);
    };
    const rnd = mulberry(11);

    // ---------- textures ----------
    function coverCanvas(img, col) {
      const c = document.createElement("canvas");
      const w = img ? img.naturalWidth : 400, h = img ? img.naturalHeight : 600;
      c.width = w; c.height = h;
      const x = c.getContext("2d");
      if (img) x.drawImage(img, 0, 0, w, h);
      else { x.fillStyle = rgb(col.edge); x.fillRect(0, 0, w, h); }
      // jacket fold at the spine + the board's hinge groove underneath
      let g = x.createLinearGradient(0, 0, w * 0.09, 0);
      g.addColorStop(0, "rgba(0,0,0,.28)"); g.addColorStop(0.18, "rgba(0,0,0,.05)");
      g.addColorStop(0.42, "rgba(0,0,0,.16)"); g.addColorStop(0.5, "rgba(255,255,255,.10)");
      g.addColorStop(0.62, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = g; x.fillRect(0, 0, w * 0.09, h);
      g = x.createLinearGradient(w, 0, w * 0.985, 0);
      g.addColorStop(0, "rgba(255,255,255,.10)"); g.addColorStop(1, "rgba(255,255,255,0)");
      x.fillStyle = g; x.fillRect(w * 0.985, 0, w * 0.015, h);
      return c;
    }

    const css = getComputedStyle(stage);
    const familyFor = (name) => {
      const v = name === "Inter" ? "--font-inter" : `--font-spine-${name.toLowerCase().replace(/\s+/g, "-")}`;
      return css.getPropertyValue(v).trim() || `"${name}", serif`;
    };
    const parseType = (t) => {
      const m = String(t).match(/^(.*?)\s+(\d{3})(\s+caps)?$/);
      return m ? { font: familyFor(m[1]), weight: m[2], caps: !!m[3] } : { font: familyFor("Inter"), weight: "600", caps: false };
    };

    function spineCanvas(b) {
      const Lp = Math.round(b.H * PX_PER_CM), Sp = Math.max(48, Math.round(b.T * PX_PER_CM));
      const c = document.createElement("canvas"); c.width = Sp; c.height = Lp;
      const x = c.getContext("2d");
      // Draw in a landscape frame: x runs head -> tail, y runs front cover -> back.
      x.translate(Sp, 0); x.rotate(Math.PI / 2);
      const g = x.createLinearGradient(0, 0, Lp, 0);
      b.col.stops.forEach((s, i, all) => g.addColorStop(i / (all.length - 1), rgb(mix(s, b.col.edge, 0.75))));
      x.fillStyle = g; x.fillRect(0, 0, Lp, Sp);
      // the jacket wraps a rounded spine: darker at both folds
      const sh = x.createLinearGradient(0, 0, 0, Sp);
      sh.addColorStop(0, "rgba(0,0,0,.30)"); sh.addColorStop(0.1, "rgba(0,0,0,0)");
      sh.addColorStop(0.45, "rgba(255,255,255,.07)"); sh.addColorStop(0.9, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(0,0,0,.32)");
      x.fillStyle = sh; x.fillRect(0, 0, Lp, Sp);

      x.fillStyle = lum(b.col.edge) > 0.56 ? "rgba(24,20,16,.88)" : "rgba(250,246,238,.94)";
      x.textBaseline = "middle";
      const { font, weight, caps } = b.type;
      const title = caps ? b.shortTitle.toUpperCase() : b.shortTitle;
      x.letterSpacing = caps ? "0.06em" : "0em";
      let size = Sp * 0.4;
      x.font = `${weight} ${size}px ${font}`;
      let tw = x.measureText(title).width;
      if (tw > Lp * 0.5) { size *= (Lp * 0.5) / tw; x.font = `${weight} ${size}px ${font}`; }
      x.textAlign = "center"; x.fillText(title, Lp * 0.54, Sp * 0.53);
      // author at the head
      const inter = familyFor("Inter");
      x.letterSpacing = "0.02em";
      let as = Math.min(Sp * 0.22, 30);
      x.font = `500 ${as}px ${inter}`;
      tw = x.measureText(b.author).width;
      if (tw > Lp * 0.22) { as *= (Lp * 0.22) / tw; x.font = `500 ${as}px ${inter}`; }
      x.textAlign = "left"; x.globalAlpha = 0.8; x.fillText(b.author, Lp * 0.045, Sp * 0.53);
      // tail mark: the year finished, NOW while reading, or a dot
      x.globalAlpha = 0.65; x.textAlign = "right";
      x.font = `500 ${Math.min(Sp * 0.17, 22)}px ${familyFor("Inter")}`;
      const yr = (b.dateRead || "").slice(0, 4);
      x.fillText(b.status === "reading" ? "NOW" : yr || "•", Lp * 0.965, Sp * 0.53);
      x.globalAlpha = 1;
      x.setTransform(1, 0, 0, 1, 0, 0);
      noise(x, Sp, Lp, 10, rnd);
      return c;
    }

    function pageTex(alongU) {
      const N = 512, c = document.createElement("canvas");
      c.width = alongU ? N : 4; c.height = alongU ? 4 : N;
      const x = c.getContext("2d");
      for (let i = 0; i < N; i++) {
        const v = 226 + rnd() * 22 - (rnd() < 0.05 ? 18 : 0);
        x.fillStyle = `rgb(${v},${v - 4},${v - 12})`;
        if (alongU) x.fillRect(i, 0, 1, 4); else x.fillRect(0, i, 4, 1);
      }
      return canvasTex(c);
    }
    function woodTex(dark) {
      const c = document.createElement("canvas"); c.width = 2048; c.height = 256;
      const x = c.getContext("2d");
      x.fillStyle = dark ? "#5a3f28" : "#b88c5c"; x.fillRect(0, 0, 2048, 256);
      for (let i = 0; i < 140; i++) {
        const y0 = rnd() * 256, a = rnd() * 0.14 + 0.03;
        x.strokeStyle = rnd() < 0.5 ? `rgba(70,40,15,${a})` : `rgba(255,230,190,${a * 0.6})`;
        x.lineWidth = rnd() * 2.4 + 0.4;
        x.beginPath();
        for (let X = 0; X <= 2048; X += 32) x.lineTo(X, y0 + Math.sin(X / (180 + i * 3) + i) * 6 + Math.sin(X / 37 + i) * 1.2);
        x.stroke();
      }
      noise(x, 2048, 256, 12, rnd);
      const t = canvasTex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return t;
    }
    function plasterTex(base) {
      const c = document.createElement("canvas"); c.width = c.height = 512;
      const x = c.getContext("2d"); x.fillStyle = base; x.fillRect(0, 0, 512, 512);
      noise(x, 512, 512, 9, rnd);
      const t = canvasTex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return t;
    }
    const pageU = pageTex(true), pageV = pageTex(false);

    // ---------- books ----------
    const list = books.map((d, i) => {
      const H = d.heightCm;
      const T = Math.max(1.45, d.pages * 0.0058 + 2 * BOARD);
      return { ...d, i, H, T, W: 15.5, shortTitle: d.title.replace(/:.*$/, ""), type: parseType(d.spineType), bigLoaded: false };
    });

    // fonts the spines use, before painting them
    const faces = new Set(list.map((b) => `${b.type.weight} 40px ${b.type.font}`));
    faces.add(`500 20px ${familyFor("Inter")}`);
    await Promise.race([
      Promise.all([...faces].map((f) => document.fonts.load(f).catch(() => null))),
      new Promise((r) => setTimeout(r, 3000)),
    ]);
    if (disposed) { renderer.dispose(); canvas.remove(); return; }

    await Promise.all(list.map(async (b) => {
      const img = await loadImg(b.coverSmall);
      b.img = img;
      b.col = img ? sampleCover(img) : { stops: [[110, 100, 90], [110, 100, 90]], edge: [110, 100, 90] };
      b.W = clamp(b.H * (img ? img.naturalWidth / img.naturalHeight : 0.66), 12.5, 19);
    }));
    if (disposed) { renderer.dispose(); canvas.remove(); return; }

    const geos = new Map();
    const box = (w, h, d) => {
      const k = `${w.toFixed(2)}|${h.toFixed(2)}|${d.toFixed(2)}`;
      if (!geos.has(k)) geos.set(k, track(new THREE.BoxGeometry(w, h, d)));
      return geos.get(k);
    };
    const plane = (w, h) => track(new THREE.PlaneGeometry(w, h));

    for (const b of list) {
      const edge = new THREE.Color(rgb(b.col.edge));
      b.mats = {
        cover: track(new THREE.MeshPhysicalMaterial({ map: canvasTex(coverCanvas(b.img, b.col)), roughness: 0.48, clearcoat: 0.35, clearcoatRoughness: 0.4 })),
        spine: track(new THREE.MeshPhysicalMaterial({ map: canvasTex(spineCanvas(b)), roughness: 0.52, clearcoat: 0.3, clearcoatRoughness: 0.45 })),
        back: track(new THREE.MeshPhysicalMaterial({ color: edge.clone().multiplyScalar(0.92), roughness: 0.55, clearcoat: 0.25 })),
        edge: track(new THREE.MeshStandardMaterial({ color: edge.clone().multiplyScalar(0.8), roughness: 0.7 })),
        pageU: track(new THREE.MeshStandardMaterial({ map: pageU, roughness: 0.95 })),
        pageV: track(new THREE.MeshStandardMaterial({ map: pageV, roughness: 0.95 })),
      };
      b.img = null;
    }

    const pickables = [];
    function makeBook(b) {
      const g = new THREE.Group();
      const { W, H, T, mats } = b;
      const add = (geo, mat, x, y, z, shadow = true) => {
        const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
        m.castShadow = shadow; m.receiveShadow = true; m.userData.book = b;
        g.add(m); pickables.push(m); return m;
      };
      add(box(W, H, BOARD), mats.edge, 0, 0, T / 2 - BOARD / 2);
      add(box(W, H, BOARD), mats.edge, 0, 0, -T / 2 + BOARD / 2);
      add(box(BOARD, H, T), mats.edge, -W / 2 + BOARD / 2, 0, 0);
      const pw = W - BOARD - OVERHANG, ph = H - 2 * OVERHANG, pt = T - 2 * BOARD;
      add(box(pw, ph, pt), [mats.pageU, mats.pageU, mats.pageV, mats.pageV, mats.pageU, mats.pageU], -W / 2 + BOARD + pw / 2, 0, 0);
      add(plane(W, H), mats.cover, 0, 0, T / 2 + 0.004, false);
      add(plane(W, H), mats.back, 0, 0, -T / 2 - 0.004, false).rotation.y = Math.PI;
      add(plane(T, H), mats.spine, -W / 2 - 0.004, 0, 0, false).rotation.y = -Math.PI / 2;
      return g;
    }

    const AX = { x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1) };
    const qAxis = (ax, a) => new THREE.Quaternion().setFromAxisAngle(AX[ax], a);
    const Q_UPRIGHT = qAxis("y", Math.PI / 2); // spine faces +z, front cover faces +x
    const Q_FLAT = qAxis("z", Math.PI / 2).multiply(Q_UPRIGHT); // spine faces +z, cover up

    // ---------- scene: the shelf ----------
    const scene = new THREE.Scene();
    scene.environment = envTex;
    const camera = new THREE.PerspectiveCamera(28, 1, 1, 2000);

    const n = list.length;
    let x = 2.2, i = 0;
    const setHome = (b, pos, quat) => {
      b.home = { pos: pos.clone(), quat: quat.clone() };
      b.pos = pos.clone(); b.quat = quat.clone(); b.hv = 0; b.tw = null;
    };
    while (i < n) {
      // a few books lie flat in small stacks, like a real shelf
      if (i % 15 === 9 && i + 3 <= n) {
        const group = list.slice(i, i + 3);
        const maxH = Math.max(...group.map((b) => b.H));
        let y = 0;
        for (const b of group) {
          y += b.T / 2;
          const q = qAxis("y", (rnd() - 0.5) * 0.09).multiply(Q_FLAT);
          setHome(b, new THREE.Vector3(x + 0.6 + maxH / 2 + (rnd() - 0.5) * 0.8, y + 0.01, 13 - b.W / 2 - 1.2 - rnd() * 0.6), q);
          y += b.T / 2 + 0.02;
        }
        x += maxH + 1.4; i += 3; continue;
      }
      const b = list[i];
      x += b.T / 2;
      setHome(b, new THREE.Vector3(x, b.H / 2 + 0.01, 13 - b.W / 2 - 0.8 - rnd() * 1.6), Q_UPRIGHT);
      x += b.T / 2 + 0.05 + rnd() * 0.12; i++;
    }
    const len = x + 2.2;
    for (const b of list) { b.group = makeBook(b); scene.add(b.group); }

    const plankMat = track(new THREE.MeshStandardMaterial({ roughness: 0.62 }));
    const plank = new THREE.Mesh(track(new THREE.BoxGeometry(len + 6, 2.4, 28)), plankMat);
    plank.position.set(len / 2, -1.2, 0); plank.receiveShadow = plank.castShadow = true;
    const wallMat = track(new THREE.MeshStandardMaterial({ roughness: 0.95 }));
    const wall = new THREE.Mesh(track(new THREE.PlaneGeometry(len + 800, 400)), wallMat);
    wall.position.set(len / 2, 40, -14.2); wall.receiveShadow = true;
    const endMat = track(new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.35, metalness: 0.6 }));
    for (const ex of [0.6, len - 0.6]) {
      const up = new THREE.Mesh(box(0.35, 16, 13), endMat); up.position.set(ex, 8, 4); up.castShadow = up.receiveShadow = true;
      const base = new THREE.Mesh(box(9, 0.25, 13), endMat); base.position.set(ex < 1 ? ex + 4.5 : ex - 4.5, 0.12, 4); base.receiveShadow = true;
      scene.add(up, base);
    }
    scene.add(plank, wall);

    const sun = new THREE.DirectionalLight(0xfff1dc, 2.2);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 4;
    Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 50, bottom: -30, near: 1, far: 260 });
    sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
    const lamp = new THREE.PointLight(0xffcf8f, 0, 0, 0);
    lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -0.001;
    // a reading light on the open book, so its cover reads true at night
    const readLight = new THREE.SpotLight(0xfff4e6, 0, 0, 0.32, 0.9, 0);
    scene.add(sun, sun.target, lamp, readLight, readLight.target);

    // ---------- state ----------
    let selected = null, hovered = null;
    let s = 0, sTarget = 0;
    let recede = 0;
    let dirty = 3; // frames left to render
    const drag = { yaw: 0, pitch: 0, active: false };
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const dark = matchMedia("(prefers-color-scheme: dark)");
    let W = 1, H = 1;

    // half the visible width at the spines (they stand ~6 cm in front of z = 0)
    const half = () => Math.tan((camera.fov * Math.PI) / 360) * (dist() - 6) * camera.aspect;
    const dist = () => (W < 760 ? VIEW_H_NARROW : VIEW_H) / 2 / Math.tan((camera.fov * Math.PI) / 360);
    const fits = () => 2 * half() >= len + 4;
    const sMin = () => (fits() ? len / 2 : half() - 2);
    const sMax = () => (fits() ? len / 2 : len - half() + 2);

    function placeCamera() {
      const narrow = W < 760;
      camera.position.set(s, narrow ? 20 : 17, dist());
      camera.lookAt(s, narrow ? 13 : 9, 0);
      sun.position.set(s - 50, 70, 70); sun.target.position.set(s, 5, 0);
      lamp.position.set(s + 6, 44, 30);
    }

    function applyTheme() {
      const isDark = dark.matches;
      wallMat.map = plasterTex(isDark ? "#2a2520" : "#ebe4d8"); wallMat.needsUpdate = true;
      plankMat.map = woodTex(isDark); plankMat.map.repeat.set(len / 120, 1); plankMat.needsUpdate = true;
      sun.intensity = isDark ? 0.12 : 2.3;
      sun.castShadow = !isDark;
      lamp.intensity = isDark ? 2.1 : 0;
      scene.environmentIntensity = isDark ? 0.16 : 0.5;
      dirty = 3;
    }

    function resize() {
      const r = stage.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      renderer.setSize(W, H, false);
      camera.aspect = W / H; camera.updateProjectionMatrix();
      sTarget = clamp(sTarget, sMin(), sMax());
      s = clamp(s, sMin(), sMax());
      placeCamera();
      if (selected) { const d = displayPose(selected); tweenTo(selected, d.pos, d.quat, 1); }
      dirty = 3;
    }

    function tweenTo(b, toP, toQ, dur, ctrl = null) {
      b.tw = { fP: b.pos.clone(), fQ: b.quat.clone(), toP: toP.clone(), toQ: toQ.clone(), ctrl, t0: performance.now(), dur: reduce.matches ? 1 : dur };
    }
    const _p = new THREE.Vector3();
    function stepTween(b, now) {
      const tw = b.tw; if (!tw) return;
      const t = clamp((now - tw.t0) / tw.dur, 0, 1), e = ease(t), eR = ease(clamp((t - 0.12) / 0.88, 0, 1));
      if (tw.ctrl) {
        const u = 1 - e;
        b.pos.copy(tw.fP).multiplyScalar(u * u).add(_p.copy(tw.ctrl).multiplyScalar(2 * u * e)).add(_p.copy(tw.toP).multiplyScalar(e * e));
      } else b.pos.lerpVectors(tw.fP, tw.toP, e);
      b.quat.slerpQuaternions(tw.fQ, tw.toQ, eR);
      if (t >= 1) { b.pos.copy(tw.toP); b.quat.copy(tw.toQ); b.tw = null; }
    }

    // A pose that shows the cover to the camera, clear of the detail card.
    function displayPose(b) {
      placeCamera(); camera.updateMatrixWorld();
      const narrow = W < 760;
      const tan = Math.tan((camera.fov * Math.PI) / 360);
      // Phones: the card is a sheet over the bottom 52% of the screen, so
      // centre the book in the part of the stage that stays visible above it
      // (and below the 56px bar).
      let top = 0, bottom = H;
      if (narrow) {
        const r = stage.getBoundingClientRect();
        top = clamp(56 - r.top, 0, H);
        bottom = clamp(innerHeight * 0.48 - r.top, top + 1, H);
      }
      const strip = bottom - top;
      const fill = narrow ? (strip * 0.84) / H : 0.7;
      const d = Math.min(b.H / fill / (2 * tan), dist() - 26); // always in front of the shelf
      const visH = 2 * d * tan, visW = visH * camera.aspect;
      let dx = 0, dy = 0;
      if (narrow) dy = ((H / 2 - (top + bottom) / 2) / H) * visH;
      else {
        const card = Math.min(420, W * 0.42) + 32; // card width + its margin (shelf.css)
        dx = (((W - card) / 2 - W / 2) / W) * visW;
      }
      return { pos: new THREE.Vector3(dx, dy, -d).applyMatrix4(camera.matrixWorld), quat: camera.quaternion.clone() };
    }

    async function loadBigCover(b) {
      if (b.bigLoaded || !b.coverImage) return;
      b.bigLoaded = true;
      const img = await loadImg(b.coverImage);
      if (!img || disposed) return;
      const old = b.mats.cover.map;
      b.mats.cover.map = canvasTex(coverCanvas(img, b.col));
      b.mats.cover.needsUpdate = true;
      old.dispose();
      dirty = 3;
    }

    function select(b) {
      if (b === selected) return;
      const prev = selected;
      selected = b;
      drag.yaw = drag.pitch = 0;
      if (prev) tweenTo(prev, prev.home.pos, prev.home.quat, 800, prev.home.pos.clone().add(new THREE.Vector3(0, 6, 24)));
      if (b) {
        if (W < 760) {
          // Phones: room below the stage (shelf.css) so it can scroll up under
          // the bar, clear of the sheet, before the book is placed.
          stage.classList.add("is-open");
          const r = stage.getBoundingClientRect();
          if (innerHeight * 0.48 - Math.max(r.top, 56) < 300) stage.scrollIntoView({ block: "start" });
        }
        const d = displayPose(b);
        tweenTo(b, d.pos, d.quat, 1000, b.home.pos.clone().add(new THREE.Vector3(0, 6, 24)));
        loadBigCover(b);
      }
      if (!b) stage.classList.remove("is-open");
      dirty = 3;
      onSelect?.(b ? b.slug : null);
    }

    // ---------- input ----------
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    function pick(cx, cy) {
      const r = canvas.getBoundingClientRect();
      ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(pickables, false)[0];
      return hit ? hit.object.userData.book : null;
    }

    let down = null, lastMove = null;
    on(canvas, "pointerdown", (e) => {
      down = { x: e.clientX, y: e.clientY, lx: e.clientX, moved: false, rot: !!selected && pick(e.clientX, e.clientY) === selected, id: e.pointerId };
    });
    on(canvas, "pointermove", (e) => {
      lastMove = e; dirty = Math.max(dirty, 1);
      if (!down) return;
      const dx = e.clientX - down.lx; down.lx = e.clientX;
      if (!down.moved && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) {
        down.moved = true;
        canvas.setPointerCapture(down.id);
      }
      if (!down.moved) return;
      if (down.rot) { drag.active = true; drag.yaw += dx * 0.009; drag.pitch = clamp(drag.pitch + (e.movementY || 0) * 0.006, -0.6, 0.6); }
      else if (!selected) sTarget = clamp(sTarget - dx * (2 * half() / W), sMin(), sMax());
      dirty = 3;
    });
    const up = (e) => {
      const d = down; down = null; drag.active = false;
      if (!d || d.moved || e.type === "pointercancel") return;
      const b = pick(e.clientX, e.clientY);
      if (selected) { if (!b) select(null); else if (b !== selected) select(b); }
      else if (b) select(b);
    };
    on(canvas, "pointerup", up);
    on(canvas, "pointercancel", up);
    on(canvas, "pointerleave", () => { lastMove = null; hovered = null; canvas.style.cursor = ""; dirty = 3; });
    // Sideways wheel pans the shelf; vertical wheel pans it too until an end, then the page scrolls.
    on(canvas, "wheel", (e) => {
      if (selected || fits()) return;
      const horiz = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const delta = horiz ? e.deltaX : e.deltaY;
      const next = clamp(sTarget + delta * 0.05, sMin(), sMax());
      if (!horiz && next === sTarget) return;
      e.preventDefault();
      sTarget = next; dirty = 3;
    }, { passive: false });
    on(stage, "keydown", (e) => {
      if (e.target !== stage) return;
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        sTarget = clamp(sTarget + (e.key === "ArrowRight" ? 12 : -12), sMin(), sMax()); dirty = 3;
      }
    });
    on(window, "keydown", (e) => { if (e.key === "Escape" && selected) select(null); });
    on(dark, "change", applyTheme);
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    cleanups.push(() => ro.disconnect());
    let visible = true;
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) dirty = 3; });
    io.observe(stage);
    cleanups.push(() => io.disconnect());

    // ---------- loop ----------
    const P = new THREE.Vector3(), Q = new THREE.Quaternion(), pivot = new THREE.Vector3(), qt = new THREE.Quaternion();
    let last = performance.now(), raf = 0;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!visible || document.hidden) return;
      const k = 1 - Math.exp(-dt * 9);
      let busy = selected !== null || drag.active;
      if (Math.abs(sTarget - s) > 0.002) { s += (sTarget - s) * k; busy = true; } else s = sTarget;
      placeCamera();

      if (lastMove && !down) {
        const h = pick(lastMove.clientX, lastMove.clientY);
        if (h !== hovered) { hovered = h; busy = true; }
        canvas.style.cursor = h ? (h === selected ? "grab" : "pointer") : selected ? "zoom-out" : "";
      }
      const r = (selected ? 1 : 0);
      if (Math.abs(r - recede) > 0.001) { recede += (r - recede) * (1 - Math.exp(-dt * (reduce.matches ? 60 : 5))); busy = true; } else recede = r;
      if (!drag.active && (Math.abs(drag.yaw) > 0.0005 || Math.abs(drag.pitch) > 0.0005)) {
        const kk = 1 - Math.exp(-dt * 5); drag.yaw -= drag.yaw * kk; drag.pitch -= drag.pitch * kk; busy = true;
      }

      for (const b of list) {
        if (b.tw) { stepTween(b, now); busy = true; }
        const target = hovered === b && !b.tw && b !== selected && !reduce.matches ? 1 : 0;
        if (Math.abs(target - b.hv) > 0.001) { b.hv += (target - b.hv) * (1 - Math.exp(-dt * 12)); busy = true; } else b.hv = target;
        P.copy(b.pos); Q.copy(b.quat);
        if (b.hv > 0.001) {
          if (b.home.quat.equals(Q_UPRIGHT)) {
            // a finger tips the book out from the top
            pivot.set(b.home.pos.x, 0, b.home.pos.z + b.W / 2);
            qt.setFromAxisAngle(AX.x, 0.17 * b.hv);
            P.sub(pivot).applyQuaternion(qt).add(pivot); Q.premultiply(qt);
            P.z += 0.8 * b.hv;
          } else P.z += 2.2 * b.hv;
        }
        if (b !== selected && !b.tw) P.z -= ease(recede) * 8;
        if (b === selected && !b.tw) {
          const idle = reduce.matches ? 0 : Math.sin(now / 1700) * 0.05;
          Q.multiply(qAxis("y", drag.yaw + idle)).multiply(qAxis("x", drag.pitch));
        }
        b.group.position.copy(P); b.group.quaternion.copy(Q);
      }
      if (selected) {
        readLight.position.copy(camera.position).add(_p.set(-18, 26, 0));
        readLight.target.position.copy(selected.group.position);
      }
      readLight.intensity = ease(recede) * (dark.matches ? 2.4 : 0.6);

      if (busy) dirty = Math.max(dirty, 1);
      if (dirty > 0) { renderer.render(scene, camera); dirty--; }
    }

    applyTheme();
    resize();
    s = sTarget = sMin();
    placeCamera();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
    api = {
      select(slug) { select(slug ? list.find((b) => b.slug === slug) ?? null : null); },
      destroy() {
        if (destroyed) return;
        destroyed = disposed = true;
        cancelAnimationFrame(raf);
        cleanups.forEach((f) => f());
        disposables.forEach((d) => d.dispose());
        renderer.dispose();
        canvas.remove();
      },
    };
    stage.classList.add("is-ready");
    onReady?.();
  };

  const ready = start().catch((err) => { console.error(err); onFail?.(); });
  return {
    select: (slug) => api.select(slug),
    destroy: () => { disposed = true; api.destroy(); ready.then(() => api.destroy()); },
    ready,
  };
}
