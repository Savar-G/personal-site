// Desk markup, ported from mockups/desk-prototype/index.html. It is static,
// trusted HTML (no user input); essay fields are escaped. engine.js drives it.

export type DeskEssay = {
  slug: string;
  title: string;
  date: string; // "May 24, 2026"
  minutes: number;
  teaser: string;
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

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
    <h1>Hi, I'm <a class="hl" href="/about">Savar.</a></h1>
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

  <div class="obj travel" tabindex="0" role="link" aria-label="Travel" data-vis="0 .02 .98 .96" data-open="/travel" style="left:78px;top:80px;width:230px;height:200px;--r:-3deg;--cy:212px">
    <div class="pola" style="--dd:900ms;--x:0px;--y:22px;--pr:-11deg;--hx:-46px;--hy:10px;--hr:-17deg"><div class="ph" style="background-image:url(/desk/trip_japan.webp)"></div><span>japan</span></div>
    <div class="pola" style="--dd:1400ms;--x:86px;--y:28px;--pr:9deg;--hx:58px;--hy:16px;--hr:16deg"><div class="ph" style="background-image:url(/desk/trip_bali.webp)"></div><span>indonesia</span></div>
    <div class="pola" style="--dd:1900ms;--x:44px;--y:4px;--pr:-2deg;--hx:4px;--hy:-16px;--hr:-1deg"><div class="ph" style="background-image:url(/desk/trip_cappadocia.webp)"></div><span>turkey</span></div>
    <span class="cap">Travel</span></div>

  <div class="obj notebook" tabindex="0" role="link" aria-label="Writing" data-vis="0 0 1 1" data-open="/writing" style="left:610px;top:70px;--r:4deg;--cy:254px">
    <div class="book"><div class="page-r"></div><div class="cover"><div class="face front"></div><div class="face back"></div></div></div>
    <div class="hit"></div>
    <div class="pg">
${notebookPage(essays)}
    </div>
    <span class="cap">Writing</span></div>

  <div class="obj folder" tabindex="0" role="link" aria-label="Projects" data-vis=".08 .09 .92 .91" data-open="/projects" style="left:860px;top:70px;width:230px;height:197px;--r:-4deg;--cy:184px">
    <div class="fold">
      <img decoding="async" src="/desk/folder.webp" alt="">
      <div class="doc sheet" style="--l:30px;--t:28px;--dr:-5deg;--dr2:-13deg;--up:-44px;--ux:-30px;--d:0ms"><i></i><i style="--w:62%"></i><i style="--w:74%"></i><i style="--w:50%"></i></div>
      <div class="doc sheet" style="--l:60px;--t:24px;--dr:1deg;--dr2:1deg;--up:-60px;--ux:0px;--d:60ms"><i style="--w:70%"></i><i></i><i style="--w:58%"></i><i style="--w:66%"></i></div>
      <div class="doc sheet" style="--l:90px;--t:30px;--dr:6deg;--dr2:14deg;--up:-46px;--ux:30px;--d:120ms"><i style="--w:76%"></i><i style="--w:54%"></i><i></i><i style="--w:62%"></i></div>
      <img decoding="async" class="front" src="/desk/folder.webp" alt="">
    </div>
    <span class="cap">Projects</span></div>

  <div class="obj phone" id="phone" tabindex="0" role="group" aria-label="Socials. Use arrow keys and Enter." data-vis=".22 .11 .77 .89" style="left:1170px;top:30px;--r:10deg;--cy:382px">
    <img decoding="async" src="/desk/razr.webp" alt="">
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
          <li data-href="https://cal.com/savar-gupta/embedr?user=savar-gupta&amp;overlayCalendar=true">Book a call</li>
        </ul>
      </div>
    </div>
    <span class="cap">Socials</span></div>

  <div class="obj paper" id="resume" tabindex="0" role="link" aria-label="Resume" data-vis="0 0 1 1" style="left:70px;top:560px;width:176px;height:228px;--r:-6deg;--cy:238px">
    <div class="sheet"><img decoding="async" src="/desk/resume_desk.webp" alt=""></div><span class="cap">Resume</span></div>

  <div class="obj books" tabindex="0" role="link" aria-label="Bookshelf" data-vis=".04 .1 .96 .92" data-open="/bookshelf" style="left:1180px;top:668px;width:190px;height:204px;--cy:206px">
    <img decoding="async" class="bk" src="/desk/the-everything-store.webp" alt="" style="left:0;top:18px;--br:-12deg;--hx:-34px;--hy:-4px;--hr:-21deg;box-shadow:0 6px 14px rgba(0,0,0,.18)">
    <img decoding="async" class="bk" src="/desk/build.webp" alt="" style="left:78px;top:24px;--br:9deg;--hx:30px;--hy:-2px;--hr:18deg;box-shadow:0 6px 14px rgba(0,0,0,.18)">
    <img decoding="async" class="bk" src="/desk/chip-war.webp" alt="" style="left:40px;top:40px;--br:-2deg;--hx:-2px;--hy:-18px;--hr:-1deg;box-shadow:0 8px 18px rgba(0,0,0,.22)">
    <span class="cap">Bookshelf</span></div>

  <div class="obj" id="coffee" tabindex="0" role="link" aria-label="Book a coffee chat" data-vis=".07 .07 .85 .83" data-href="https://cal.com/savar-gupta/embedr?user=savar-gupta&amp;overlayCalendar=true" style="left:405px;top:585px;width:260px;height:267px;--r:-10deg;--cy:246px">
    <img decoding="async" src="/desk/coffee.webp" alt=""><div class="liquid" id="liquid"></div>
    <div class="steam cup"><span style="position:absolute;left:0;bottom:0"><svg viewBox="0 0 26 80"><path d="M13 78 C 2 62, 24 52, 13 38 S 3 14, 14 2" class="wisp" stroke-width="6" stroke-linecap="round"/></svg></span><span style="position:absolute;left:24px;bottom:6px"><svg viewBox="0 0 26 80"><path d="M13 78 C 2 62, 24 52, 13 38 S 3 14, 14 2" class="wisp" stroke-width="6" stroke-linecap="round"/></svg></span><span style="position:absolute;left:46px;bottom:0"><svg viewBox="0 0 26 80"><path d="M13 78 C 2 62, 24 52, 13 38 S 3 14, 14 2" class="wisp" stroke-width="6" stroke-linecap="round"/></svg></span></div>
    <span class="cap" id="coffeecap">Coffee chat</span><span class="coldnote">gone cold · grab a fresh one with me →</span></div>

  <div class="cube" style="left:676px;top:688px;--cr:-8deg"><img decoding="async" src="/desk/sugar.webp" alt=""></div>
  <div class="cube" style="left:712px;top:716px;--cr:14deg"><img decoding="async" src="/desk/sugar.webp" alt=""></div>
  <div class="cube" style="left:680px;top:742px;--cr:3deg"><img decoding="async" src="/desk/sugar.webp" alt=""></div>
  <div class="cubehint" id="cubehint">psst, drop one in</div>

  <div class="obj food" tabindex="0" role="link" aria-label="Food on Beli" data-vis=".25 .24 .77 .75" data-href="https://beliapp.co/app/savargupta" style="left:790px;top:560px;width:300px;height:309px;--r:6deg;--cy:266px">
    <img decoding="async" src="/desk/ramen.webp" alt="">
    <div class="steam"><span style="position:absolute;left:0;bottom:0"><svg viewBox="0 0 26 80"><path d="M13 78 C 2 62, 24 52, 13 38 S 3 14, 14 2" class="wisp" stroke-width="6" fill="none" stroke-linecap="round"/></svg></span><span style="position:absolute;left:30px;bottom:6px"><svg viewBox="0 0 26 80"><path d="M13 78 C 2 62, 24 52, 13 38 S 3 14, 14 2" class="wisp" stroke-width="6" fill="none" stroke-linecap="round"/></svg></span><span style="position:absolute;left:58px;bottom:0"><svg viewBox="0 0 26 80"><path d="M13 78 C 2 62, 24 52, 13 38 S 3 14, 14 2" class="wisp" stroke-width="6" fill="none" stroke-linecap="round"/></svg></span></div>
    <span class="cap">Food</span></div>
  <p class="pocket-only pocket-note"><span><svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24h72v16H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16H136V200h72a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40ZM48,56H208a8,8,0,0,1,8,8v80H40V64A8,8,0,0,1,48,56ZM208,184H48a8,8,0,0,1-8-8V160H216v16A8,8,0,0,1,208,184Z"/></svg>This desk is more fun on a desktop.</span></p>
  <p class="pocket-only pocket-foot">Vancouver, BC · <span id="ftime">7:41 PM</span></p>
</div>

<div id="iris"></div>
<canvas id="stars"></canvas>
<img decoding="async" id="flyer" data-src="/desk/resume_full.webp" alt="">
<div id="viewer" aria-hidden="true">
  <div class="vbar"><button type="button" id="back">← back to desk</button><a href="/Savar_Gupta_Resume.pdf" download>download pdf ↓</a></div>
  <img decoding="async" id="page" data-src="/desk/resume_full.webp" alt="Savar Gupta, resume" width="1720" height="2226">
</div>

<div id="sheet" role="dialog" aria-modal="true" aria-label="Socials" aria-hidden="true">
  <div class="shead"><h2>Socials</h2><button type="button" id="sheetclose" aria-label="Close"><svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/></svg></button></div>
  <div class="big"><div class="bigphone"><img decoding="async" src="/desk/razr.webp" alt="">
    <div class="screen"><div class="menu">
      <div class="bar"><span>▮▮▮</span><span class="mtime">7:41</span><span>▭</span></div>
      <div class="head">Contacts</div>
      <ul class="sheetrows">
        <li class="on" data-href="https://www.linkedin.com/in/savar-gupta">LinkedIn</li>
        <li data-href="https://x.com/savar_gupta">X</li>
        <li data-href="https://github.com/Savar-G">GitHub</li>
        <li data-href="mailto:savar.gupta1922@gmail.com">Email</li>
        <li data-href="https://beliapp.co/app/savargupta">Beli</li>
        <li data-href="https://cal.com/savar-gupta/embedr?user=savar-gupta&amp;overlayCalendar=true">Book a call</li>
      </ul>
    </div></div>
  </div></div>
  <div class="sbtns">
    <a class="primary" href="https://www.linkedin.com/in/savar-gupta" target="_blank" rel="noopener"><svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M216,24H40A16,16,0,0,0,24,40V216a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V40A16,16,0,0,0,216,24Zm0,192H40V40H216V216ZM96,112v64a8,8,0,0,1-16,0V112a8,8,0,0,1,16,0Zm88,28v36a8,8,0,0,1-16,0V140a20,20,0,0,0-40,0v36a8,8,0,0,1-16,0V112a8,8,0,0,1,15.79-1.78A36,36,0,0,1,184,140ZM100,84A12,12,0,1,1,88,72,12,12,0,0,1,100,84Z"/></svg>LinkedIn</a>
    <a href="https://x.com/savar_gupta" target="_blank" rel="noopener"><svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M214.75,211.71l-62.6-98.38,61.77-67.95a8,8,0,0,0-11.84-10.76L143.24,99.34,102.75,35.71A8,8,0,0,0,96,32H48a8,8,0,0,0-6.75,12.3l62.6,98.37-61.77,68a8,8,0,1,0,11.84,10.76l58.84-64.72,40.49,63.63A8,8,0,0,0,160,224h48a8,8,0,0,0,6.75-12.29ZM164.39,208,62.57,48h29L193.43,208Z"/></svg>X</a>
    <a href="https://github.com/Savar-G" target="_blank" rel="noopener"><svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58.14,58.14,0,0,0,208.31,75.68ZM200,112a40,40,0,0,1-40,40H112a40,40,0,0,1-40-40v-8a41.74,41.74,0,0,1,6.9-22.48A8,8,0,0,0,80,73.83a43.81,43.81,0,0,1,.79-33.58,43.88,43.88,0,0,1,32.32,20.06A8,8,0,0,0,119.82,64h32.35a8,8,0,0,0,6.74-3.69,43.87,43.87,0,0,1,32.32-20.06A43.81,43.81,0,0,1,192,73.83a8.09,8.09,0,0,0,1,7.65A41.72,41.72,0,0,1,200,104Z"/></svg>GitHub</a>
    <a href="mailto:savar.gupta1922@gmail.com"><svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM203.43,64,128,133.15,52.57,64ZM216,192H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z"/></svg>Email</a>
    <a href="https://beliapp.co/app/savargupta" target="_blank" rel="noopener"><svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M72,88V40a8,8,0,0,1,16,0V88a8,8,0,0,1-16,0ZM216,40V224a8,8,0,0,1-16,0V176H152a8,8,0,0,1-8-8,268.75,268.75,0,0,1,7.22-56.88c9.78-40.49,28.32-67.63,53.63-78.47A8,8,0,0,1,216,40ZM200,53.9c-32.17,24.57-38.47,84.42-39.7,106.1H200ZM119.89,38.69a8,8,0,1,0-15.78,2.63L112,88.63a32,32,0,0,1-64,0l7.88-47.31a8,8,0,1,0-15.78-2.63l-8,48A8.17,8.17,0,0,0,32,88a48.07,48.07,0,0,0,40,47.32V224a8,8,0,0,0,16,0V135.32A48.07,48.07,0,0,0,128,88a8.17,8.17,0,0,0-.11-1.31Z"/></svg>Beli</a>
    <a href="https://cal.com/savar-gupta/embedr?user=savar-gupta&amp;overlayCalendar=true" target="_blank" rel="noopener"><svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z"/></svg>Book a call</a>
  </div>
  <p class="shint">tap a contact, or the phone's screen</p>
</div>
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
      <li><span><a href="mailto:savar.gupta1922@gmail.com">Email</a> · <a href="https://www.linkedin.com/in/savar-gupta" target="_blank" rel="noopener">LinkedIn</a> · <a href="https://x.com/savar_gupta" target="_blank" rel="noopener">X</a> · <a href="https://github.com/Savar-G" target="_blank" rel="noopener">GitHub</a> · <a href="https://beliapp.co/app/savargupta" target="_blank" rel="noopener">Beli</a> · <a href="https://cal.com/savar-gupta/embedr?user=savar-gupta&amp;overlayCalendar=true" target="_blank" rel="noopener">Book a call</a></span></li>
    </ul>
  </div>
</div>
<div class="tally" id="tally"></div>
<noscript><style>.desk-page .stage:not(.ready) { visibility: visible; }</style></noscript>
`;
}
