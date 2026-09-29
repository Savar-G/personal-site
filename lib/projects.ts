export type ProjectLink = { label: string; href: string };

export type Project = {
  name: string;
  role?: string;
  description: string;
  tags?: string;
  links: ProjectLink[];
  video?: { youtubeId: string; start?: number; title: string };
};

// Facts come from the resume (Sep 2026). No invented metrics.
export const projects: Project[] = [
  {
    name: "Unify",
    role: "Co-founder",
    description:
      "Settlement platform for newcomers to Canada. 350+ users and 16 partnerships. I helped lead the landing page, the mobile app, and the web app.",
    tags: "React Native · React · Supabase · RAG",
    links: [
      { label: "unifysocial.ca", href: "https://unifysocial.ca" },
      {
        label: "Landing page",
        href: "https://github.com/UnifyCN/landing-page",
      },
      { label: "Mobile app", href: "https://github.com/UnifyCN/mobile-app" },
      { label: "Web app", href: "https://github.com/UnifyCN/web-app" },
    ],
  },
  {
    name: "Taskline",
    description:
      "Obsidian task dashboard that turns agent-extracted action items into one execution queue.",
    tags: "Obsidian · AI agents",
    links: [{ label: "GitHub", href: "https://github.com/Savar-G/taskline" }],
  },
  {
    name: "Embedr",
    role: "Product & GTM",
    description:
      "I worked on the landing page and on the product, Embedr Studio.",
    links: [
      { label: "embedr.app", href: "https://www.embedr.app/" },
      { label: "Embedr Studio", href: "https://studio.embedr.app/home" },
    ],
    video: {
      youtubeId: "ZQaxrc0SsEA",
      start: 13,
      title: "This AI Builds PCBs, Firmware & Mechanical Designs",
    },
  },
  {
    name: "Health & Activity Wearable",
    description:
      "ESP32-S3 wearable with IMU and heart-rate sensing: a 2-layer PCB, bare-metal sensor drivers, and an on-device activity classifier.",
    tags: "KiCad · ESP32-S3 · C/C++ · FreeRTOS",
    links: [],
  },
  {
    name: "HealthOS",
    description: "Personal health dashboard.",
    tags: "Next.js",
    links: [
      { label: "health.savargupta.com", href: "https://health.savargupta.com" },
      { label: "GitHub", href: "https://github.com/Savar-G/HealthOS" },
    ],
  },
];
