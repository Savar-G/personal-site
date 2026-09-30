// Projects for /projects. Facts come from the Sep 2026 resume and Savar's own
// messages; no invented metrics. Order matters: the desk's folder papers fly
// into the first three cards.

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
    name: "Health & Activity Wearable",
    category: "Hardware · Firmware",
    tone: "hardware",
    role: "Hardware & Firmware Engineer",
    dates: "May 2026 – now",
    summary:
      "An ESP32-S3 wearable that senses motion and heart rate and classifies activity on the device.",
    did: [
      {
        lead: "Designed a 2-layer mixed-signal PCB",
        text: "in KiCad for an ESP32-S3 wearable (IMU, PPG heart rate, LiPo power); fabricated through JLCPCB.",
      },
      {
        lead: "Wrote bare-metal I2C drivers",
        text: "in C/C++ for the IMU and PPG, scheduled with FreeRTOS, checked with a logic analyzer.",
      },
      {
        lead: "Built an on-device TinyML activity classifier",
        text: "(Edge Impulse) that streams predictions to a phone app over BLE, with no cloud.",
      },
    ],
    tools: ["KiCad", "ESP32-S3", "C/C++", "FreeRTOS", "Edge Impulse", "BLE"],
    links: [],
    media: { kind: "icon", icon: "chip" },
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
