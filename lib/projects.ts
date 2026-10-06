// Projects for /projects. Facts come from the Sep 2026 resume and Savar's own
// messages; no invented metrics. Order matters: the desk's folder papers fly
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
  | {
      kind: "showcase";
      site: { src: string; url: string; width: number; height: number };
      screens: {
        src: string;
        caption: string;
        width: number;
        height: number;
        video?: string;
      }[];
    }
  | { kind: "youtube"; id: string; start?: number; title: string }
  // A photo; `credit` records where a stock photo came from.
  | {
      kind: "image";
      src: string;
      alt: string;
      width: number;
      height: number;
      credit?: string;
    }
  | { kind: "placeholder"; label: string }
  // No media: a small icon tile on a compact card.
  | { kind: "icon"; icon: "tasks" | "heart" | "chip" };

export type Project = {
  name: string;
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
  tools: string[];
  links: ProjectLink[];
  media: ProjectMedia;
  // The flagship spans the full width; a tall card spans two grid rows.
  layout?: "feature" | "tall";
};

export const projects: Project[] = [
  {
    name: "Unify",
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
      { value: "450+", label: "users" },
      { value: "16", label: "partnerships" },
      { value: "35+", label: "events" },
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
    tools: ["Python", "Chrome extension", "macOS MediaRemote", "SQLite", "iCloud", "Claude Code"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/Savar-G/podcast-sync",
        kind: "github",
      },
    ],
    media: {
      kind: "image",
      src: "/projects/podcast-sync-player.webp",
      alt: "A YouTube player with the Podcast Sync message: Resumed at 40:30 from Apple Podcasts, with −15 s, +15 s, and Undo buttons",
      width: 880,
      height: 125,
    },
  },
  {
    name: "SFU Rocketry",
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
    },
    layout: "tall",
  },
  {
    name: "Health & Activity Wearable",
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
    name: "Taskline",
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
    category: "Software",
    tone: "plain",
    role: "Solo builder",
    summary:
      "A personal health dashboard that tracks strength training, running, sleep, recovery, and body composition.",
    did: [],
    tools: ["Next.js"],
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
