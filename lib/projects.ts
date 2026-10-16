// Projects for /projects. Facts come from the Sep 2026 resume, Savar's own
// messages, and (for the school projects) the course reports; no invented
// metrics. Order matters: the desk's folder papers fly
// into the first three cards, and the tall Rocketry card sits left of the
// three small cards after it.

export type Tone =
  "startup" | "product" | "hardware" | "mechanical" | "software" | "plain";

export type ProjectLink = {
  label: string;
  href: string;
  kind?: "site" | "github";
};

export type ProjectMedia =
  // A site in a browser frame with phone screens beside it (the flagship).
  // An optional team photo shares the site's slot behind a caption toggle.
  | {
      kind: "showcase";
      site: { src: string; url: string; width: number; height: number };
      team?: { src: string; alt: string; width: number; height: number };
      screens: {
        src: string;
        caption: string;
        width: number;
        height: number;
        video?: string;
      }[];
    }
  | { kind: "youtube"; id: string; start?: number; title: string }
  // A video file this site hosts; it loads only when played.
  | { kind: "video"; src: string; poster: string; title: string }
  // A photo; `credit` records where a stock photo came from.
  | {
      kind: "image";
      src: string;
      alt: string;
      width: number;
      height: number;
      credit?: string;
      // Line art on white: inverted in dark mode and padded on the rail.
      // Photos and slides keep their colours and fill the frame.
      drawing?: boolean;
    }
  | { kind: "placeholder"; label: string }
  // No media: a small icon tile on a compact card.
  | { kind: "icon"; icon: "tasks" | "heart" | "chip" };

export type Project = {
  name: string;
  // The case study lives at /projects/<slug>.
  slug: string;
  // One or two lines for the /projects rail card. Draft copy; Savar rewrites it.
  blurb: string;
  category: string;
  tone: Tone;
  role: string;
  dates?: string;
  // Optional first line, set stronger than the summary.
  tagline?: string;
  summary: string;
  // "What I did": a short bold lead, then the rest. Either one list, or
  // groups shown side by side (Unify: Engineering / Business).
  did: { lead?: string; text: string }[];
  didGroups?: { title: string; items: { lead?: string; text: string }[] }[];
  stats?: { value: string; label: string }[];
  // ---- Case study (/projects/<slug>, R-92). Every part is optional; a
  // section with no content is left out, never filled in. ----
  // Key numbers that lead the page; falls back to `stats`.
  results?: { value: string; label: string }[];
  // One line under the numbers.
  resultsNote?: string;
  // Shown with role and dates when it adds something (team size, company).
  team?: string;
  // Why the project exists, in Savar's words.
  problem?: string[];
  // Decisions and what they cost, not a feature list.
  approach?: { title: string; text: string }[];
  // Savar writes these himself.
  reflection?: string[];
  tools: string[];
  links: ProjectLink[];
  media: ProjectMedia;
  // The flagship spans the full width; a tall card spans two grid rows.
  layout?: "feature" | "tall";
};

export const projects: Project[] = [
  {
    name: "Unify",
    slug: "unify",
    blurb:
      "The all-in-one newcomer settlement platform. Unify makes settling in Canada simpler, clearer, and more connected.",
    category: "Startup · Software & AI",
    tone: "startup",
    role: "Co-founder",
    dates: "Jul 2024 – now",
    tagline: "The all-in-one newcomer settlement platform.",
    summary:
      "Unify makes settling in Canada simpler, clearer, and more connected.",
    did: [],
    didGroups: [
      {
        title: "Engineering",
        items: [
          {
            lead: "Helped lead the builds",
            text: "of the React Native iOS/Android app, the React web app, and the landing page, on a shared Supabase backend.",
          },
          {
            lead: "Built the RAG-powered AI Assistant:",
            text: "OpenAI embeddings and pgvector retrieval with recency-weighted re-ranking, profile-aware context, and streaming answers with sources.",
          },
          {
            lead: "Made it safe to run in production:",
            text: "rate-limiting and prompt-injection defenses, served through Supabase Edge Functions.",
          },
        ],
      },
      {
        title: "Business",
        items: [
          {
            lead: "Secured 16 partnerships and ran 35+ community events",
            text: "that brought newcomers into the app.",
          },
          {
            lead: "Designed a referral revenue model",
            text: "(3 partners signed) that earns commission on partner sign-ups and keeps the app free.",
          },
          {
            lead: "Drove 2M+ social views",
            text: "and set the roadmap from 51 interviews, 225 surveys, and 73 beta testers.",
          },
        ],
      },
    ],
    stats: [
      { value: "650+", label: "users" },
      { value: "16", label: "partnerships" },
      { value: "35+", label: "events" },
    ],
    results: [
      { value: "650+", label: "users" },
      { value: "16", label: "partnerships" },
      { value: "35+", label: "community events" },
      { value: "2M+", label: "social views" },
    ],
    resultsNote: "Live on the App Store since March 2026.",
    team: "24 people (2025-26)",
    // Savar's words, from his YC Startup School answers (2026).
    problem: [
      "I watched close family and family friends move to Canada, and so much of their pain was avoidable: endless Googling, scrambling for the right information, missing deadlines no one warned them about. One friend had to leave the country because the deadline to extend their study permit slipped past them.",
      "The information exists. It's just scattered across government PDFs, Reddit, and word-of-mouth, with no community and no trusted guide.",
    ],
    approach: [
      {
        title: "Listen before building",
        text: "The roadmap came from 51 interviews, 225 surveys, and 73 beta testers, not from guesses.",
      },
      {
        title: "Keep it free for newcomers",
        text: "A referral model earns commission when newcomers sign up with partners, so the app never charges the people it helps.",
      },
      {
        title: "One backend, three apps",
        text: "The mobile app, the web app, and the landing page share one Supabase backend, so a small team ships to every platform at once.",
      },
    ],
    tools: ["React Native", "React", "Supabase", "pgvector", "OpenAI"],
    links: [
      { label: "unifysocial.ca", href: "https://unifysocial.ca", kind: "site" },
      {
        label: "Landing page",
        href: "https://github.com/UnifyCN/landing-page",
        kind: "github",
      },
      {
        label: "Mobile app",
        href: "https://github.com/UnifyCN/mobile-app",
        kind: "github",
      },
      {
        label: "Web app",
        href: "https://github.com/UnifyCN/web-app",
        kind: "github",
      },
    ],
    media: {
      kind: "showcase",
      site: {
        src: "/projects/unify-site.webp",
        url: "unifysocial.ca",
        width: 1600,
        height: 900,
      },
      team: {
        src: "/projects/unify-team.webp",
        alt: "The Unify team for 2025-26: 24 people in black suits on concrete stairs.",
        width: 1280,
        height: 790,
      },
      // Screen recordings from the app, cropped to the screen; they loop while visible.
      screens: [
        {
          src: "/projects/unify-social.webp",
          video: "/projects/unify-social.mp4",
          caption: "Community",
          width: 380,
          height: 832,
        },
        {
          src: "/projects/unify-learn.webp",
          video: "/projects/unify-learn.mp4",
          caption: "Learn",
          width: 380,
          height: 832,
        },
        {
          src: "/projects/unify-ai.webp",
          video: "/projects/unify-ai.mp4",
          caption: "AI Companion",
          width: 380,
          height: 832,
        },
      ],
    },
    layout: "feature",
  },
  {
    name: "Embedr",
    slug: "embedr",
    blurb:
      "An AI engineering environment for hardware: datasheets, KiCad schematics, and firmware bring-up.",
    category: "Startup · Software & AI",
    tone: "startup",
    role: "Product & GTM",
    dates: "Now",
    summary:
      "An AI engineering environment for hardware: datasheets, KiCad schematics, and firmware bring-up.",
    did: [],
    didGroups: [
      {
        title: "Product",
        items: [
          { lead: "Redesigned the landing page", text: "at embedr.app." },
          {
            lead: "Helped develop the product roadmap",
            text: "for Embedr Studio.",
          },
          {
            lead: "Ran user interviews and surveys",
            text: "to shape what the product builds next.",
          },
        ],
      },
      {
        title: "Go-to-market",
        items: [
          {
            lead: "Led GTM and built the outbound engine:",
            text: "automated prospect finding with enrichment and personalised hooks, a 4-step threaded email sequence, and reply handling that catches replies, bounces, and auto-replies and flags interested leads.",
          },
          {
            lead: "Made content for YouTube, X, and Instagram,",
            text: "including the product demo below.",
          },
          {
            lead: "Booked and ran calls",
            text: "with enterprise clients.",
          },
        ],
      },
    ],
    layout: "feature",
    tools: ["Google Apps Script", "Gmail API", "Claude Code", "Composio"],
    links: [
      { label: "embedr.app", href: "https://www.embedr.app/", kind: "site" },
      { label: "Embedr Studio", href: "https://studio.embedr.app/home" },
    ],
    media: {
      kind: "youtube",
      id: "ZQaxrc0SsEA",
      start: 13,
      title: "This AI Builds PCBs, Firmware & Mechanical Designs",
    },
  },
  {
    name: "Podcast Sync",
    slug: "podcast-sync",
    blurb:
      "YouTube on my desktop, Apple Podcasts on the go. The two apps never knew where I was in the other one, so I made them stay in sync, both ways.",
    category: "Software · Open source",
    tone: "software",
    role: "Solo builder",
    dates: "Oct 2026",
    // Leads with why (Savar, 2026-10-05).
    summary:
      "I like watching the video versions of podcasts on YouTube, at my desk or while I eat. On the go, I switch to Apple Podcasts on my iPhone and listen, no video. The two apps never knew where I was in the other one, so every switch meant scrubbing to find my spot again. I built Podcast Sync so they always stay in sync, both ways.",
    did: [
      {
        lead: "Matched each YouTube video to its podcast episode with no setup,",
        text: "using length, publish date, and the guest's name, because the two titles often differ. It matched 33 of 33 test episodes and skipped every clip.",
      },
      {
        lead: "Made the handoff to my iPhone take zero taps:",
        text: "when I pause YouTube, a small macOS helper moves Apple Podcasts on my Mac to the same second, and iCloud carries it to my iPhone.",
      },
      {
        lead: "Built the YouTube side as a Chrome extension:",
        text: "it jumps to where I stopped on my iPhone, marks that spot on the progress bar, learns each show's timing from ±15 s nudges, and shows podcast progress on thumbnails.",
      },
      {
        lead: "Kept it private:",
        text: "everything runs on my Mac and in my own iCloud, with read-only access to the Podcasts library and no servers or accounts.",
      },
      {
        lead: "Shipped it as open source",
        text: "with 128 tests and CI, built with four Claude Code agents working in parallel git worktrees.",
      },
    ],
    layout: "feature",
    results: [
      { value: "33/33", label: "test episodes matched" },
      { value: "0", label: "taps to hand off to iPhone" },
      { value: "128", label: "tests, with CI" },
    ],
    resultsNote: "Open source. Everything runs on my Mac and in my own iCloud.",
    // Savar's words (the old summary, R-85).
    problem: [
      "I like watching the video versions of podcasts on YouTube, at my desk or while I eat. On the go, I switch to Apple Podcasts on my iPhone and listen, no video.",
      "The two apps never knew where I was in the other one, so every switch meant scrubbing to find my spot again.",
    ],
    approach: [
      {
        title: "Match on what both apps agree on",
        text: "Titles differ between YouTube and Apple Podcasts, so the match uses length, publish date, and the guest's name instead.",
      },
      {
        title: "Let iCloud do the travelling",
        text: "Moving Apple Podcasts on the Mac is enough: iCloud already syncs it to the iPhone, so there is no server to run.",
      },
      {
        title: "Build in parallel",
        text: "Four Claude Code agents worked in separate git worktrees, one per part of the system.",
      },
    ],
    tools: ["Python", "Chrome extension", "macOS MediaRemote", "SQLite", "iCloud", "Claude Code"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/Savar-G/podcast-sync",
        kind: "github",
      },
    ],
    // The launch video (R-86): 1080p, compressed for the web; the poster is
    // its "Same podcast. Same second." frame.
    media: {
      kind: "video",
      src: "/projects/podcast-sync-launch.mp4",
      poster: "/projects/podcast-sync-launch.webp",
      title: "Podcast Sync launch video",
    },
  },
  {
    name: "SFU Rocketry",
    slug: "sfu-rocketry",
    blurb:
      "A student team building liquid-fuelled rockets. I designed, validated, and hot-fired a LOX/Ethanol engine.",
    category: "Hardware · Mechanical",
    tone: "mechanical",
    role: "Propulsion & Mechanical Engineer",
    dates: "Oct 2022 – May 2024",
    summary: "A student team building liquid-fuelled rockets.",
    did: [
      {
        lead: "Designed, validated, and hot-fired a LOX/Ethanol liquid rocket engine:",
        text: "a full design-to-test cycle with thermal and structural analysis (SolidWorks, FEA).",
      },
      {
        lead: "Designed and built an automated pneumatic valve system",
        text: "for the LOX/Ethanol tanks, for precise flow control.",
      },
    ],
    tools: ["SolidWorks", "FEA", "Pneumatics"],
    links: [
      {
        label: "sfurocketry.com",
        href: "https://www.sfurocketry.com/",
        kind: "site",
      },
    ],
    media: {
      kind: "image",
      src: "/projects/rocketry-gen3.webp",
      alt: "CAD wireframe of the SFU Rocketry GEN3 liquid rocket engine",
      width: 1068,
      height: 786,
      credit: "SFU Rocketry, sfurocketry.com (GEN3 engine wireframe)",
      drawing: true,
    },
    layout: "tall",
  },
  // School projects (R-93). Facts come from the course reports and poster; no
  // grade or placement is claimed. `problem` and `reflection`
  // are left for Savar to write.
  {
    name: "Ball-Launching Arm",
    slug: "ball-launching-arm",
    blurb:
      "An autonomous arm that senses which of three balls is loaded, feeds one at a time, and launches or drops it. I led the control system.",
    category: "Hardware · Mechatronics",
    tone: "hardware",
    role: "Controls lead",
    dates: "May – Aug 2025",
    team: "5 students, MSE 312 (Mechatronics Design II)",
    summary:
      "An autonomous arm for SFU's MSE 312 design competition: a 3D-printed truss arm on a 12 V encoder gearmotor, a servo-fed hopper, and Simulink control on an Arduino Mega.",
    did: [
      {
        lead: "Led the Simulink control system:",
        text: "an LDR sensor classifies each ball, a servo state machine feeds one ball at a time, and a launch sequence cocks the arm to 55° and swings it to 160° at 400°/s. The marble drops instead.",
      },
      {
        lead: "Wrote a custom trajectory generator",
        text: "with an acceleration ramp, a cruise limit, and an exact stop, which feeds the PID position loop that drives the motor through PWM.",
      },
      {
        lead: "Tuned the PID from measurements:",
        text: "the motor's open-loop step response gave its gain and time constant, then one gain changed at a time against settling time and overshoot.",
      },
      {
        lead: "Helped debug the integration:",
        text: "loose joints and damaged ICs in the drive circuit, and a failed motor whose encoder had to be realigned.",
      },
    ],
    results: [
      { value: "1.3 mm", label: "tip deflection at 5 N (limit 10 mm)" },
      { value: "3", label: "ball types: two launched, the marble dropped" },
      { value: "400°/s", label: "launch swing" },
      { value: "±1°", label: "arm position tolerance" },
    ],
    resultsNote: "Every subsystem met its design constraints in testing.",
    approach: [
      {
        title: "Move the sensor, not the threshold",
        text: "On the black arm the light sensor needed steady light and missed the marble. We moved it to the hopper with a white LED opposite, so room light no longer changed the readings.",
      },
      {
        title: "Let the hopper sort the marble",
        text: "The sensor could not see the translucent marble at all. The hopper's brass rods are spaced so the marble falls through and is dropped, and the sensor only tells wood from fluffy.",
      },
      {
        title: "Replace the block that failed",
        text: "Simulink's trapezoidal trajectory block reached a forward target and never came back. My own generator moved the arm in both directions without overshoot.",
      },
      {
        title: "One ball, then wait",
        text: "The hopper servo idles at 90°, pushes to 120° for 0.5 s, then ignores the sensor for 15 s, so a second ball cannot follow before the launch ends.",
      },
      {
        title: "Pick the arm by the numbers",
        text: "Three truss designs went through FEA. A matrix of six weighted criteria (deflection, inertia, mass, and more) chose the third: 2.75 points against 2.0 and 1.4.",
      },
    ],
    tools: ["Simulink", "MATLAB", "Arduino Mega", "SolidWorks", "FEA", "3D printing"],
    links: [],
    media: {
      kind: "image",
      src: "/projects/mse312-launcher.webp",
      alt: "The black 3D-printed truss arm beside the taped servo hopper, with a green marble ready to drop.",
      width: 945,
      height: 709,
    },
  },
  {
    name: "Greener Together",
    slug: "greener-together",
    blurb:
      "Does volunteer stewardship make Vancouver's rain gardens work better? A data hackathon answer from 200+ sites, in R and Tableau.",
    category: "Business · Data analytics",
    tone: "plain",
    role: "Team member",
    dates: "Nov 2025",
    team: "4 students as Unify Consulting, BUS 336 hackathon",
    summary:
      "We analyzed City of Vancouver condition data for 200+ rain gardens to find out what community stewardship adds, and pitched two recommendations to the City.",
    did: [
      {
        lead: "Found that vegetation health drives site condition,",
        text: "and that stewarded sites scored better on vegetation in 2024, with the biggest gains from 2022 to 2024.",
      },
      {
        lead: "Built the analysis in R and the dashboards in Tableau:",
        text: "a site map, a vegetation-to-condition scatter plot, and group comparisons.",
      },
      {
        lead: "Recommended two moves to the City:",
        text: "grow stewardship through schools and local groups, and forecast clogging and overflow with ARIMA so maintenance is preventive, not reactive.",
      },
    ],
    results: [
      { value: "200+", label: "rain-garden sites" },
      { value: "0.37", label: "points better vegetation at stewarded sites" },
      { value: "2", label: "recommendations to the City" },
    ],
    resultsNote: "The vegetation gap in 2024 is statistically significant.",
    approach: [
      {
        title: "Start from the City's cost",
        text: "Rain gardens only work with steady maintenance, and maintenance is expensive. So the question was what volunteers add, not whether the gardens work.",
      },
      {
        title: "Find the driver first",
        text: "Vegetation health predicted overall condition, so comparing vegetation between stewarded and other sites gave a fair test.",
      },
      {
        title: "Pair people with prediction",
        text: "Volunteers improve the sites, and an ARIMA forecast of clogging and overflow lets the City fix sites before they fail.",
      },
    ],
    tools: ["R", "Tableau"],
    links: [],
    media: {
      kind: "image",
      src: "/projects/hackathon-poster.webp",
      alt: "Top of the team's poster: Greener Together, How Stewardship Strengthens Vancouver's Green Infrastructure.",
      width: 1600,
      height: 900,
    },
  },
  {
    name: "Microgrid Demand Forecasting",
    slug: "microgrid-forecasting",
    blurb:
      "Hourly power forecasts for a real microgrid, so operators can see surplus periods and decide when to run off the main grid.",
    category: "Software · Machine learning",
    tone: "software",
    role: "Team member",
    dates: "Jan – Apr 2025",
    team: "3 students, MSE 413",
    summary:
      "Machine-learning forecasts of island-mode power on the Mesa Del Sol microgrid, to find surplus periods and support grid disconnection decisions.",
    did: [
      {
        lead: "Turned 10-second sensor logs into an hourly dataset:",
        text: "10,917 rows of power, voltage, and frequency, with 3-hour lag features and sine/cosine time encoding.",
      },
      {
        lead: "Compared linear, polynomial, and random forest models",
        text: "on a held-out test set, scored by R² and RMSE.",
      },
      {
        lead: "Best model: degree-3 polynomial regression,",
        text: "R² 0.845 and RMSE 5.80, against 0.757 for a 200-tree random forest and 0.426 for linear regression.",
      },
    ],
    results: [
      { value: "0.845", label: "R², best model" },
      { value: "5.80", label: "RMSE, best model" },
      { value: "10,917", label: "hourly rows" },
    ],
    resultsNote:
      "Degree-3 polynomial regression beat a 200-tree random forest (R² 0.757) and linear regression (0.426).",
    approach: [
      {
        title: "Hourly, not every 10 seconds",
        text: "Down-sampling to hourly kept the daily pattern and cut the compute.",
      },
      {
        title: "Forecast the way it would run",
        text: "Each prediction fed the next step (recursive forecasting), as it would in real use.",
      },
      {
        title: "Deeper is not better",
        text: "Random forests with depth 20 and 30 did slightly worse than depth 10, a sign of overfitting; more trees helped instead.",
      },
    ],
    tools: ["Python", "scikit-learn", "pandas", "Jupyter"],
    links: [],
    media: {
      kind: "image",
      src: "/projects/mse413-forecast.webp",
      alt: "Forecast against actual island-mode power from May to August 2023: the polynomial model follows the real load closely.",
      width: 1440,
      height: 810,
      drawing: true,
    },
  },
  {
    name: "Health & Activity Wearable",
    slug: "wearable",
    blurb:
      "An ESP32-S3 wearable with IMU and heart-rate sensing and an on-device activity classifier that streams to a phone over BLE, with no cloud.",
    category: "Hardware · Firmware",
    tone: "hardware",
    role: "Hardware & Firmware Engineer",
    dates: "May 2026 – now",
    summary:
      "An ESP32-S3 wearable: a 2-layer KiCad PCB with IMU and heart-rate sensing, bare-metal C/C++ drivers on FreeRTOS, and an on-device activity classifier that streams to a phone over BLE, with no cloud.",
    did: [],
    tools: ["KiCad", "ESP32-S3", "C/C++", "FreeRTOS", "Edge Impulse", "BLE"],
    links: [],
    media: { kind: "icon", icon: "chip" },
  },
  {
    name: "Serene",
    slug: "serene",
    blurb:
      "A voice-first AI companion wearable for seniors who live alone. We interviewed nurses, caregivers, and seniors before designing anything.",
    category: "Product · Discovery",
    tone: "product",
    role: "Team member",
    dates: "Fall 2025",
    team: "6 students, MSE 490 (Tech Entrepreneurship)",
    summary:
      "A voice-first AI companion wearable for seniors who live alone, with fall detection, shaped by interviews with nurses, caregivers, and seniors.",
    did: [],
    results: [{ value: "6+", label: "stakeholder interviews" }],
    resultsNote: "Nurses, caregivers, family members, and seniors.",
    approach: [
      {
        title: "Find the buyer",
        text: "Seniors wear the device, but families and caregivers decide to buy it. The product has to calm the family as much as it comforts the senior.",
      },
      {
        title: "Safety without stigma",
        text: "Seniors refuse devices that look medical. One caregiver said they \"make my clients feel sick and old.\" It has to feel like part of who they are.",
      },
      {
        title: "Nothing to remember",
        text: "A nurse told us a device that needs a button press will not work for someone with dementia, so it listens and acts on its own.",
      },
    ],
    tools: ["Customer interviews", "Stakeholder mapping", "Market sizing"],
    links: [],
    media: { kind: "icon", icon: "heart" },
  },
  {
    name: "Taskline",
    slug: "taskline",
    blurb:
      "An Obsidian plugin that turns agent-extracted action items from meetings and notes into one execution queue.",
    category: "Software · AI tools",
    tone: "software",
    role: "Solo builder",
    summary:
      "An Obsidian plugin that turns agent-extracted action items from meetings and notes into one execution queue.",
    did: [],
    tools: ["TypeScript", "Obsidian", "AI agents"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/Savar-G/taskline",
        kind: "github",
      },
    ],
    media: { kind: "icon", icon: "tasks" },
  },
  {
    name: "HealthOS",
    slug: "healthos",
    blurb:
      "A personal health dashboard that tracks strength training, running, sleep, recovery, and body composition.",
    category: "Software",
    tone: "plain",
    role: "Solo builder",
    summary:
      "A personal health dashboard that tracks strength training, running, sleep, recovery, and body composition.",
    did: [
      {
        lead: "A Next.js dashboard over all of it:",
        text: "strength, running, sleep, recovery, and body composition in one place.",
      },
      {
        lead: "Four Claude Code agents, one per domain,",
        text: "each with its own context file, maintain the data. The dashboard just reads it.",
      },
      {
        lead: "A running agent that writes my training plan,",
        text: "which replaced a $30/mo service.",
      },
    ],
    results: [
      { value: "18,000+", label: "strength sets since 2020" },
      { value: "1,100+", label: "nights of sleep" },
      { value: "1,600+", label: "weight entries" },
      { value: "$30/mo", label: "service it replaced" },
    ],
    resultsNote: "I use it daily.",
    // Savar's words, from his YC Startup School answers (2026).
    problem: [
      "My health data lived in six apps that didn't talk to each other: Oura for sleep, Strong for lifts, a weight tracker, running notes.",
      "I couldn't see how recovery affected my lifting, or how last week's mileage set up this week's readiness.",
    ],
    approach: [
      {
        title: "Agents own the data",
        text: "Each domain has one agent and one context file, so the dashboard stays a plain reader.",
      },
      {
        title: "One place for every signal",
        text: "Putting sleep, lifts, runs, and weight side by side is what shows how one affects the next.",
      },
    ],
    tools: ["Next.js", "Claude Code agents"],
    links: [
      {
        label: "health.savargupta.com",
        href: "https://health.savargupta.com",
        kind: "site",
      },
      {
        label: "GitHub",
        href: "https://github.com/Savar-G/HealthOS",
        kind: "github",
      },
    ],
    media: { kind: "icon", icon: "heart" },
  },
];
