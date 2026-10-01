// Desk markup, ported from mockups/desk-prototype/index.html. It is static,
// trusted HTML (no user input); essay fields are escaped. engine.js drives it.

import { CUBE_SCALE, POCKET, POCKET_CUBES, POCKET_QUERY } from "./pocket.js";

// Runs during HTML parsing, before the first paint, on a full page load (React
// does not run it again on hydration or client navigation; engine.js covers
// those). It scales the stage, applies the phone layout, and starts the landing,
// so the desk is visible on the first paint instead of after hydration.
const PREPAINT = `(function(){try{
var st=document.getElementById("stage");
var small=matchMedia(${JSON.stringify(POCKET_QUERY)}).matches,still=matchMedia("(prefers-reduced-motion: reduce)").matches;
var s=small?Math.min(innerWidth/390,1.25):Math.min(innerWidth/1440,innerHeight/900);
st.style.setProperty("--s",s);st.style.setProperty("--ts",small?1:Math.min(1.3,Math.max(1,.92/s)).toFixed(3));
if(small){var keep=function(el){if(el.dataset.deskStyle==null)el.dataset.deskStyle=el.getAttribute("style")||"";};
${JSON.stringify(POCKET)}.forEach(function(p){var el=st.querySelector(p[0]);if(!el)return;keep(el);var w=el.offsetWidth,h=el.offsetHeight;
el.style.left=p[1]-w/2+"px";el.style.top=p[2]-h/2+"px";el.style.setProperty("--r",p[3]+"deg");el.style.setProperty("--ms",p[4]);el.style.setProperty("--cy",(p[5]-p[2])/p[4]+h/2+"px");});
var cs=st.querySelectorAll(".cube");${JSON.stringify(POCKET_CUBES)}.forEach(function(c,i){var el=cs[i];if(!el)return;keep(el);
el.style.left=c[0]-el.offsetWidth/2+"px";el.style.top=c[1]-el.offsetHeight/2+"px";el.style.setProperty("--cr",c[2]+"deg");el.style.setProperty("--ms",${CUBE_SCALE});});}
var landed=null,dev=null;try{landed=sessionStorage.getItem("desk.landed");}catch(e){}try{dev=localStorage.getItem("desk.developed");}catch(e){}
if(!still&&!landed){st.classList.add("landing");st.querySelector(".greet h1").classList.add("pretype");}
if(!still&&dev===null)st.querySelector(".travel").classList.add("developing");
st.classList.add("ready");
}catch(e){}})();`;

export type DeskEssay = {
  slug: string;
  title: string;
  date: string; // "May 24, 2026"
  minutes: number;
  teaser: string;
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// The Muji gel ink pen that rests on the notebook's right page (and the copy that
// follows the pointer once it is picked up). Drawn in millimetres: the tip is at
// (0, 0) and the pen points up. The barrel is frosted, so the refill shows through.
// `p` prefixes the gradient ids so the two copies never share one.
function penSvg(p: string) {
  const ridges = Array.from({ length: 9 }, (_, i) => -9.2 - i * 1.15)
    .map((y) => `<path d="M-1.35 ${y.toFixed(2)}h2.7"/>`).join('');
  const bars = [0, .5, .8, 1.5, 1.8, 2.4, 3.1, 3.4, 4.1, 4.7, 5, 5.6, 6.3, 6.6, 7.3, 7.9, 8.2, 8.9, 9.5, 9.8, 10.5, 11.1, 11.4]
    .map((d, i) => `<rect x="1" y="${(-125.4 + d).toFixed(2)}" width="2.6" height="${i % 3 ? .22 : .38}"/>`).join('');
  return `<svg viewBox="-7 -144 14 144" aria-hidden="true">
<defs>
<linearGradient id="${p}b" x1="-5.2" x2="5.2" y1="0" y2="0" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#8b929c" stop-opacity=".88"/><stop offset=".1" stop-color="#ccd1d8" stop-opacity=".78"/>
<stop offset=".27" stop-color="#fbfcfd" stop-opacity=".9"/><stop offset=".42" stop-color="#eef1f4" stop-opacity=".42"/>
<stop offset=".7" stop-color="#e2e6eb" stop-opacity=".46"/><stop offset=".9" stop-color="#b9c0c9" stop-opacity=".78"/>
<stop offset="1" stop-color="#848b95" stop-opacity=".92"/></linearGradient>
<linearGradient id="${p}c" x1="0" x2="1" y1="0" y2="0">
<stop offset="0" stop-color="#8b929c" stop-opacity=".8"/><stop offset=".12" stop-color="#d4d8de" stop-opacity=".7"/>
<stop offset=".3" stop-color="#fbfcfd" stop-opacity=".85"/><stop offset=".5" stop-color="#eef1f4" stop-opacity=".4"/>
<stop offset=".88" stop-color="#bcc2ca" stop-opacity=".7"/><stop offset="1" stop-color="#848b95" stop-opacity=".88"/></linearGradient>
<linearGradient id="${p}i" x1="0" x2="1" y1="0" y2="0">
<stop offset="0" stop-color="#1d2024"/><stop offset=".35" stop-color="#474c55"/><stop offset="1" stop-color="#1a1c20"/></linearGradient>
<linearGradient id="${p}m" x1="0" x2="1" y1="0" y2="0">
<stop offset="0" stop-color="#6f747b"/><stop offset=".35" stop-color="#f1f3f5"/><stop offset=".6" stop-color="#b4b9bf"/><stop offset="1" stop-color="#5e6369"/></linearGradient>
<linearGradient id="${p}l" x1="0" x2="1" y1="0" y2="0">
<stop offset="0" stop-color="#efe5cb"/><stop offset=".6" stop-color="#e3d6b6"/><stop offset="1" stop-color="#b9ab8a"/></linearGradient>
<linearGradient id="${p}h" x1="0" x2="0" y1="0" y2="1">
<stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".08" stop-color="#fff" stop-opacity=".75"/>
<stop offset=".92" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>
<path d="M-.8-5.4 L-1.45-24 H1.45 L.8-5.4Z" fill="#8f959e" fill-opacity=".75"/>
<g stroke="#4a4f57" stroke-opacity=".45" stroke-width=".28">${ridges}</g>
<rect x="-1.95" y="-38" width="3.9" height="14.2" rx=".6" fill="url(#${p}i)"/>
<rect x="-1.7" y="-124" width="3.4" height="86.4" fill="url(#${p}i)" opacity=".92"/>
<rect x="-1.7" y="-128.6" width="3.4" height="4.8" rx=".5" fill="#a7adb5"/>
<circle cx="0" cy="-.45" r=".42" fill="#34363a"/>
<path d="M-.42-.75 L-.95-4.5 H.95 L.42-.75Z" fill="url(#${p}m)"/>
<rect x="-1.05" y="-6.1" width="2.1" height="1.75" rx=".3" fill="url(#${p}m)"/>
<path d="M-1.5-5.2 C-2.6-10 -4.6-21 -5-27.5 L-5-31 H5 L5-27.5 C4.6-21 2.6-10 1.5-5.2Z" fill="url(#${p}c)"/>
<path d="M-5.2-31 V-139.4 Q-5.2-141.2 -3.4-141.2 H3.4 Q5.2-141.2 5.2-139.4 V-31Z" fill="url(#${p}b)"/>
<path d="M-5.1-31.2 H5.1" stroke="#7d848e" stroke-opacity=".55" stroke-width=".35"/>
<path d="M-5.1-140 H5.1" stroke="#8d949e" stroke-opacity=".45" stroke-width=".5"/>
<rect x="-3.1" y="-138.6" width=".75" height="106.4" rx=".35" fill="url(#${p}h)"/>
<rect x=".7" y="-127" width="3.6" height="31" rx=".25" fill="url(#${p}l)" opacity=".96"/>
<g fill="#2f2b24" opacity=".8">${bars}</g>
<text transform="translate(3.25 -97.2) rotate(-90)" font-family="Helvetica, Arial, sans-serif" font-size="2.15" font-weight="700" fill="#2f2b24" letter-spacing=".05">MUJI <tspan font-weight="400" font-size="1.95">無印良品</tspan></text>
</svg>`;
}

function notebookPage(essays: DeskEssay[]) {
  const [latest] = essays;
  if (!latest)
    return `      <h4>writing</h4>\n      <div class="count">nothing yet</div>`;
  const more = essays.length - 1;
  return `      <h4>writing</h4>
      <div class="count">${essays.length} essay${essays.length === 1 ? "" : "s"} so far</div>
      <a href="/${esc(latest.slug)}">
        <div class="date">${esc(latest.date.toUpperCase())}</div>
        <div class="t">${esc(latest.title)}</div>
        <div class="ex">${esc(latest.teaser)}</div>
        <div class="more">${latest.minutes} min read →</div>
      </a>${more ? `\n      <a href="/writing"><div class="more">+ ${more} more →</div></a>` : ""}`;
}

function listEssays(essays: DeskEssay[]) {
  return essays
    .map(
      (e) =>
        `<li><span><a href="/${esc(e.slug)}">${esc(e.title)}</a></span><em>${esc(e.date)} · ${e.minutes} min</em></li>`,
    )
    .join("");
}

export function deskMarkup(essays: DeskEssay[]) {
  return `
<div class="stage" id="stage">

  <div class="greet">
    <h1>Hi, I'm <a class="hl" href="/about" style="view-transition-name:savar-name;view-transition-class:flight;">Savar.</a></h1>
    <p>Studying Mechatronics Engineering and Business @ SFU. Building at the intersection of hardware, software, and AI.</p>
    <span class="cta" id="cta"><span class="tap"><svg viewBox="0 0 256 256" fill="currentColor"><path d="M220 112h-4a28 28 0 0 0-44-18 28 28 0 0 0-40-10V44a28 28 0 0 0-56 0v84.8l-8.4-13.5A28 28 0 0 0 19.4 144l33 58.5A76 76 0 0 0 184 240h8a60 60 0 0 0 60-60v-36a32 32 0 0 0-32-32Zm16 68a44 44 0 0 1-44 44h-8a60 60 0 0 1-52.4-30.6l-33-58.5a12 12 0 0 1 20.7-12.1L102.8 153a8 8 0 0 0 14.8-4.2V44a12 12 0 0 1 24 0v64a8 8 0 0 0 16 0v-8a12 12 0 0 1 24 0v16a8 8 0 0 0 16 0 12 12 0 0 1 24 0v8a8 8 0 0 0 16 0 16 16 0 0 1 16 16Z"/></svg><i></i></span><span class="desk-only">Click</span><span class="pocket-only">Tap</span> anything to learn more about me.</span>
  </div>


  <div id="jerry" aria-hidden="true"><div class="face"><div class="body"><svg viewBox="0 0 50 50">
    <circle class="gb" cx="25" cy="25" r="25"/>
    <g class="eyes"><g class="lids">
      <rect class="ge" x="27.2" y="10.5" width="5.4" height="11" rx="2.7" transform="rotate(-25 29.9 16)"/>
      <rect class="ge" x="37.4" y="8.6" width="4.8" height="10.2" rx="2.4" transform="rotate(-25 39.8 13.7)"/>
    </g></g>
    <g class="dizzy" fill="none" stroke-width="2" stroke-linecap="round">
      <path d="M19 20 a3 3 0 1 1 3 3 a5 5 0 1 1 -5 -5"/><path d="M33 20 a3 3 0 1 1 3 3 a5 5 0 1 1 -5 -5"/>
    </g>
  </svg></div></div></div>

  <div class="obj travel" tabindex="0" role="link" aria-label="Travel" data-vis="0 .02 .98 .96" data-open="/travel" style="left:78px;top:126px;width:230px;height:200px;--r:-3deg;--cy:206px">
    <div class="pola" style="--dd:900ms;--x:0px;--y:22px;--pr:-11deg;--hx:-46px;--hy:10px;--hr:-17deg;view-transition-name:polaroid-japan;view-transition-class:flight;"><div class="ph" style="background-image:url(/desk/trip_japan.webp)"><i class="gl"></i></div><span>japan</span></div>
    <div class="pola" style="--dd:1400ms;--x:86px;--y:28px;--pr:9deg;--hx:58px;--hy:16px;--hr:16deg;view-transition-name:polaroid-indonesia;view-transition-class:flight;"><div class="ph" style="background-image:url(/desk/trip_bali.webp)"><i class="gl"></i></div><span>indonesia</span></div>
    <div class="pola" style="--dd:1900ms;--x:44px;--y:4px;--pr:-2deg;--hx:4px;--hy:-16px;--hr:-1deg;view-transition-name:polaroid-turkey;view-transition-class:flight;"><div class="ph" style="background-image:url(/desk/trip_cappadocia.webp)"><i class="gl"></i></div><span>turkey</span></div>
    <span class="cap">Travel</span></div>

  <div class="obj notebook" tabindex="0" role="link" aria-label="Writing" data-vis="0 0 1 1" data-open="/writing" style="view-transition-name:notebook;view-transition-class:flight;left:505px;top:74px;--r:4deg;--cy:258px">
    <div class="book"><div class="page-r"><canvas class="ink" width="660" height="976"></canvas><div class="pen" style="left:44px;top:214px;--a:30deg">${penSvg("pr")}</div></div><div class="cover"><div class="face front"></div><div class="face back"></div></div></div>
    <div class="hit"></div>
    <div class="pg">
${notebookPage(essays)}
    </div>
    <span class="cap">Writing</span></div>

  <div class="obj folder" tabindex="0" role="link" aria-label="Projects" data-vis=".08 .09 .92 .91" data-open="/projects" style="left:827px;top:139px;width:230px;height:197px;--r:-4deg;--cy:193px">
    <div class="fold">
      <img decoding="async" fetchpriority="low" src="/desk/folder.webp" alt="">
      <div class="doc sheet" style="view-transition-name:paper-1;view-transition-class:flight;--l:30px;--t:28px;--dr:-5deg;--dr2:-13deg;--up:-44px;--ux:-30px;--d:0ms"><i></i><i style="--w:62%"></i><i style="--w:74%"></i><i style="--w:50%"></i></div>
      <div class="doc sheet" style="view-transition-name:paper-2;view-transition-class:flight;--l:60px;--t:24px;--dr:1deg;--dr2:1deg;--up:-60px;--ux:0px;--d:60ms"><i style="--w:70%"></i><i></i><i style="--w:58%"></i><i style="--w:66%"></i></div>
      <div class="doc sheet" style="view-transition-name:paper-3;view-transition-class:flight;--l:90px;--t:30px;--dr:6deg;--dr2:14deg;--up:-46px;--ux:30px;--d:120ms"><i style="--w:76%"></i><i style="--w:54%"></i><i></i><i style="--w:62%"></i></div>
      <img decoding="async" fetchpriority="low" class="front" src="/desk/folder.webp" alt="">
    </div>
    <span class="cap">Projects</span></div>

  <div class="obj phone" id="phone" tabindex="0" role="group" aria-label="Socials. Use arrow keys and Enter." data-vis=".22 .11 .77 .89" style="left:1170px;top:30px;--r:10deg;--cy:382px">
    <img decoding="async" fetchpriority="low" src="/desk/razr.webp" alt="">
    <div class="screen">
      <div class="lock"><b><span id="ltime">7:41</span><i id="lampm">PM</i></b><span id="ldate">MON SEP 28</span><span class="lcity">VANCOUVER</span><span class="missed" id="missed" hidden>1 MISSED CALL</span></div>
      <div class="call"><small>INCOMING CALL</small><b>Savar</b><div class="keys"><span class="ans on" id="answer">Answer</span><span class="ign" id="ignore">Ignore</span></div></div>
      <div class="menu">
        <div class="bar"><span>▮▮▮</span><span id="mtime">7:41</span><span>▭</span></div>
        <div class="head">Contacts</div>
        <ul id="contacts">
          <li data-href="https://www.linkedin.com/in/savar-gupta">LinkedIn</li>
          <li data-href="https://x.com/savar_gupta">X</li>
          <li data-href="https://github.com/Savar-G">GitHub</li>
          <li data-href="mailto:savar.gupta1922@gmail.com">Email</li>
          <li data-href="https://beliapp.co/app/savargupta">Beli</li>
          <li data-href="https://cal.com/savar-gupta/coffee-chat">Book a call</li>
        </ul>
      </div>
    </div>
    <span class="cap">Socials</span></div>

  <div class="obj paper" id="resume" tabindex="0" role="link" aria-label="Resume" data-vis="0 0 1 1" style="left:70px;top:560px;width:176px;height:228px;--r:-6deg;--cy:238px">
    <div class="sheet"><img decoding="async" fetchpriority="low" src="/desk/resume_desk.webp" alt=""></div><span class="cap">Resume</span></div>

  <div class="obj books" tabindex="0" role="link" aria-label="Bookshelf" data-vis=".04 .1 .96 .92" data-open="/bookshelf" style="left:1180px;top:668px;width:190px;height:204px;--cy:206px">
    <span class="bk" style="view-transition-name:book-the-everything-store;view-transition-class:flight;left:0;top:18px;--br:-12deg;--hx:-34px;--hy:-4px;--hr:-21deg;box-shadow:0 6px 14px rgba(0,0,0,.18)"><img decoding="async" fetchpriority="low" src="/desk/the-everything-store.webp" alt=""><i class="gl"></i></span>
    <span class="bk" style="view-transition-name:book-build;view-transition-class:flight;left:78px;top:24px;--br:9deg;--hx:30px;--hy:-2px;--hr:18deg;box-shadow:0 6px 14px rgba(0,0,0,.18)"><img decoding="async" fetchpriority="low" src="/desk/build.webp" alt=""><i class="gl"></i></span>
    <span class="bk" style="view-transition-name:book-chip-war;view-transition-class:flight;left:40px;top:40px;--br:-2deg;--hx:-2px;--hy:-18px;--hr:-1deg;box-shadow:0 8px 18px rgba(0,0,0,.22)"><img decoding="async" fetchpriority="low" src="/desk/chip-war.webp" alt=""><i class="gl"></i></span>
    <span class="cap">Bookshelf</span></div>

  <div class="obj" id="coffee" tabindex="0" role="link" aria-label="Book a coffee chat" data-vis=".07 .07 .85 .83" data-href="https://cal.com/savar-gupta/coffee-chat" style="left:405px;top:585px;width:260px;height:267px;--r:-10deg;--cy:246px">
    <img decoding="async" fetchpriority="low" src="/desk/coffee.webp" alt=""><div class="liquid" id="liquid"></div>
    <div class="steam cup"><span style="position:absolute;left:0;bottom:0"><svg viewBox="0 0 26 80"><path d="M13 78 C 2 62, 24 52, 13 38 S 3 14, 14 2" class="wisp" stroke-width="6" stroke-linecap="round"/></svg></span><span style="position:absolute;left:24px;bottom:6px"><svg viewBox="0 0 26 80"><path d="M13 78 C 2 62, 24 52, 13 38 S 3 14, 14 2" class="wisp" stroke-width="6" stroke-linecap="round"/></svg></span><span style="position:absolute;left:46px;bottom:0"><svg viewBox="0 0 26 80"><path d="M13 78 C 2 62, 24 52, 13 38 S 3 14, 14 2" class="wisp" stroke-width="6" stroke-linecap="round"/></svg></span></div>
    <span class="cap" id="coffeecap">Coffee chat</span><span class="coldnote">gone cold · grab a fresh one with me →</span></div>

  <div class="cube" style="--ld:780ms;left:676px;top:688px;--cr:-8deg"><img decoding="async" fetchpriority="low" src="/desk/sugar.webp" alt=""></div>
  <div class="cube" style="--ld:870ms;left:712px;top:716px;--cr:14deg"><img decoding="async" fetchpriority="low" src="/desk/sugar.webp" alt=""></div>
  <div class="cube" style="--ld:960ms;left:680px;top:742px;--cr:3deg"><img decoding="async" fetchpriority="low" src="/desk/sugar.webp" alt=""></div>
  <div class="cubehint" id="cubehint">psst, drop one in</div>

  <div class="obj food" tabindex="0" role="link" aria-label="Food on Beli" data-vis=".25 .24 .77 .75" data-href="https://beliapp.co/app/savargupta" style="left:790px;top:560px;width:300px;height:309px;--r:6deg;--cy:266px">
    <img decoding="async" fetchpriority="low" src="/desk/ramen.webp" alt="">
    <div class="steam"><span style="position:absolute;left:0;bottom:0"><svg viewBox="0 0 26 80"><path d="M13 78 C 2 62, 24 52, 13 38 S 3 14, 14 2" class="wisp" stroke-width="6" fill="none" stroke-linecap="round"/></svg></span><span style="position:absolute;left:30px;bottom:6px"><svg viewBox="0 0 26 80"><path d="M13 78 C 2 62, 24 52, 13 38 S 3 14, 14 2" class="wisp" stroke-width="6" fill="none" stroke-linecap="round"/></svg></span><span style="position:absolute;left:58px;bottom:0"><svg viewBox="0 0 26 80"><path d="M13 78 C 2 62, 24 52, 13 38 S 3 14, 14 2" class="wisp" stroke-width="6" fill="none" stroke-linecap="round"/></svg></span></div>
    <span class="cap">Food</span></div>
  <p class="pocket-only pocket-note"><span><svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24h72v16H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16H136V200h72a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40ZM48,56H208a8,8,0,0,1,8,8v80H40V64A8,8,0,0,1,48,56ZM208,184H48a8,8,0,0,1-8-8V160H216v16A8,8,0,0,1,208,184Z"/></svg>This desk is more fun on a desktop.</span></p>
  <p class="pocket-only pocket-foot">Vancouver, BC · <span id="ftime">7:41 PM</span></p>
</div>

<script>${PREPAINT}</script>
<div id="iris"></div>
<canvas id="stars"></canvas>
<img decoding="async" fetchpriority="low" id="flyer" data-src="/desk/resume_full.webp" alt="">
<div id="viewer" aria-hidden="true">
  <div class="vbar"><button type="button" id="back">← back to desk</button><a href="/Savar_Gupta_Resume.pdf" download>download pdf ↓</a></div>
  <img decoding="async" fetchpriority="low" id="page" data-src="/desk/resume_full.webp" alt="Savar Gupta, resume" width="1720" height="2226">
</div>

<div id="sheet" role="dialog" aria-modal="true" aria-label="Socials" aria-hidden="true">
  <div class="shead"><h2>Socials</h2><button type="button" id="sheetclose" aria-label="Close"><svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/></svg></button></div>
  <div class="big"><div class="bigphone"><img decoding="async" fetchpriority="low" src="/desk/razr.webp" alt="">
    <div class="screen"><div class="menu">
      <div class="bar"><span>▮▮▮</span><span class="mtime">7:41</span><span>▭</span></div>
      <div class="head">Contacts</div>
      <ul class="sheetrows">
        <li class="on" data-href="https://www.linkedin.com/in/savar-gupta">LinkedIn</li>
        <li data-href="https://x.com/savar_gupta">X</li>
        <li data-href="https://github.com/Savar-G">GitHub</li>
        <li data-href="mailto:savar.gupta1922@gmail.com">Email</li>
        <li data-href="https://beliapp.co/app/savargupta">Beli</li>
        <li data-href="https://cal.com/savar-gupta/coffee-chat">Book a call</li>
      </ul>
    </div></div>
  </div></div>
  <div class="sbtns">
    <a class="primary" href="https://www.linkedin.com/in/savar-gupta" target="_blank" rel="noopener"><svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M216,24H40A16,16,0,0,0,24,40V216a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V40A16,16,0,0,0,216,24Zm0,192H40V40H216V216ZM96,112v64a8,8,0,0,1-16,0V112a8,8,0,0,1,16,0Zm88,28v36a8,8,0,0,1-16,0V140a20,20,0,0,0-40,0v36a8,8,0,0,1-16,0V112a8,8,0,0,1,15.79-1.78A36,36,0,0,1,184,140ZM100,84A12,12,0,1,1,88,72,12,12,0,0,1,100,84Z"/></svg>LinkedIn</a>
    <a href="https://x.com/savar_gupta" target="_blank" rel="noopener"><svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M214.75,211.71l-62.6-98.38,61.77-67.95a8,8,0,0,0-11.84-10.76L143.24,99.34,102.75,35.71A8,8,0,0,0,96,32H48a8,8,0,0,0-6.75,12.3l62.6,98.37-61.77,68a8,8,0,1,0,11.84,10.76l58.84-64.72,40.49,63.63A8,8,0,0,0,160,224h48a8,8,0,0,0,6.75-12.29ZM164.39,208,62.57,48h29L193.43,208Z"/></svg>X</a>
    <a href="https://github.com/Savar-G" target="_blank" rel="noopener"><svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58.14,58.14,0,0,0,208.31,75.68ZM200,112a40,40,0,0,1-40,40H112a40,40,0,0,1-40-40v-8a41.74,41.74,0,0,1,6.9-22.48A8,8,0,0,0,80,73.83a43.81,43.81,0,0,1,.79-33.58,43.88,43.88,0,0,1,32.32,20.06A8,8,0,0,0,119.82,64h32.35a8,8,0,0,0,6.74-3.69,43.87,43.87,0,0,1,32.32-20.06A43.81,43.81,0,0,1,192,73.83a8.09,8.09,0,0,0,1,7.65A41.72,41.72,0,0,1,200,104Z"/></svg>GitHub</a>
    <a href="mailto:savar.gupta1922@gmail.com"><svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM203.43,64,128,133.15,52.57,64ZM216,192H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z"/></svg>Email</a>
    <a href="https://beliapp.co/app/savargupta" target="_blank" rel="noopener"><svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M72,88V40a8,8,0,0,1,16,0V88a8,8,0,0,1-16,0ZM216,40V224a8,8,0,0,1-16,0V176H152a8,8,0,0,1-8-8,268.75,268.75,0,0,1,7.22-56.88c9.78-40.49,28.32-67.63,53.63-78.47A8,8,0,0,1,216,40ZM200,53.9c-32.17,24.57-38.47,84.42-39.7,106.1H200ZM119.89,38.69a8,8,0,1,0-15.78,2.63L112,88.63a32,32,0,0,1-64,0l7.88-47.31a8,8,0,1,0-15.78-2.63l-8,48A8.17,8.17,0,0,0,32,88a48.07,48.07,0,0,0,40,47.32V224a8,8,0,0,0,16,0V135.32A48.07,48.07,0,0,0,128,88a8.17,8.17,0,0,0-.11-1.31Z"/></svg>Beli</a>
    <a href="https://cal.com/savar-gupta/coffee-chat" target="_blank" rel="noopener"><svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z"/></svg>Book a call</a>
  </div>
  <p class="shint">tap a contact, or the phone's screen</p>
</div>
<div id="pen" aria-hidden="true"><div class="nib">${penSvg("ph")}</div></div>
<div class="hint" id="penhint"></div>
<div class="hint" id="hint"><kbd>↑</kbd> <kbd>↓</kbd> to move · <kbd>enter</kbd> to open</div>
<div class="toast" id="toast"></div>
<a class="corner" id="listlink" href="#list">prefer a list? →</a>
<button class="corner" id="tidy" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>tidy up</button>
<div class="fact" id="fact"></div>

<div id="list" aria-hidden="true" role="dialog" aria-label="Savar Gupta, plain list">
  <a class="corner close" href="#" id="listclose">← back to the desk</a>
  <div class="col">
    <h1>Savar Gupta</h1>
    <p class="lede">Studying Mechatronics Engineering and Business @ SFU. Building at the intersection of hardware, software, and AI. Based in Vancouver.</p>
    <h2>Now</h2>
    <ul>
      <li><span><a href="https://www.telus.com" target="_blank" rel="noopener">TELUS</a> · Technical Product Manager Co-op, Internet Hardware</span><em>Jan 2026 – now</em></li>
      <li><span><a href="https://unifysocial.ca" target="_blank" rel="noopener">Unify</a> · Co-founder</span><em>Jul 2024 – now</em></li>
      <li><span><a href="https://www.embedr.app/" target="_blank" rel="noopener">Embedr</a> · Product &amp; GTM</span><em>now</em></li>
      <li><span>Algo Communication Products · Electro-Mechanical Engineering Co-op</span><em>May – Aug 2023</em></li>
    </ul>
    <h2><a href="/projects">Projects</a></h2>
    <ul>
      <li><span><a href="https://github.com/Savar-G/taskline" target="_blank" rel="noopener">Taskline</a> · Obsidian task dashboard that turns agent-extracted action items into one execution queue.</span></li>
      <li><span><a href="https://unifysocial.ca" target="_blank" rel="noopener">Unify</a> · Settlement platform for newcomers to Canada. 350+ users, 16 partnerships. I helped lead the <a href="https://github.com/UnifyCN/landing-page" target="_blank" rel="noopener">landing page</a>, <a href="https://github.com/UnifyCN/mobile-app" target="_blank" rel="noopener">mobile app</a>, and <a href="https://github.com/UnifyCN/web-app" target="_blank" rel="noopener">web app</a>.</span></li>
      <li><span><a href="https://www.embedr.app/" target="_blank" rel="noopener">Embedr</a> · Landing page and the product, <a href="https://studio.embedr.app/home" target="_blank" rel="noopener">Embedr Studio</a>. <a href="https://www.youtube.com/watch?v=ZQaxrc0SsEA&amp;t=13s" target="_blank" rel="noopener">Video</a></span></li>
      <li><span><a href="https://health.savargupta.com" target="_blank" rel="noopener">HealthOS</a> · Personal health dashboard.</span></li>
      <li><span>Health &amp; Activity Wearable · ESP32-S3 wearable: 2-layer PCB, IMU and heart-rate sensing, bare-metal drivers.</span></li>
    </ul>
    <h2><a href="/writing">Writing</a></h2>
    <ul>${listEssays(essays)}</ul>
    <h2>Elsewhere</h2>
    <ul>
      <li><span><a href="/Savar_Gupta_Resume.pdf" target="_blank">Resume</a> (PDF)</span></li>
      <li><span><a href="/about">About</a></span></li>
      <li><span><a href="/bookshelf">Bookshelf</a></span></li>
      <li><span><a href="/things">Things</a></span></li>
      <li><span><a href="/travel">Travel</a> · Japan, Turkey, Indonesia, Hawaii</span></li>
      <li><span><a href="mailto:savar.gupta1922@gmail.com">Email</a> · <a href="https://www.linkedin.com/in/savar-gupta" target="_blank" rel="noopener">LinkedIn</a> · <a href="https://x.com/savar_gupta" target="_blank" rel="noopener">X</a> · <a href="https://github.com/Savar-G" target="_blank" rel="noopener">GitHub</a> · <a href="https://beliapp.co/app/savargupta" target="_blank" rel="noopener">Beli</a> · <a href="https://cal.com/savar-gupta/coffee-chat" target="_blank" rel="noopener">Book a call</a></span></li>
    </ul>
  </div>
</div>
<div class="tally" id="tally"></div>
<noscript><style>.desk-page .stage:not(.ready) { visibility: visible; }</style></noscript>
`;
}
