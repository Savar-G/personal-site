import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { projects } from "@/lib/projects";

const BASE_URL = "https://savargupta.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const posts = getAllPosts();

  return [
    { url: `${BASE_URL}/`, lastModified: now, priority: 1 },
    { url: `${BASE_URL}/about`, lastModified: now, priority: 0.8 },
    { url: `${BASE_URL}/things`, lastModified: now, priority: 0.6 },
    { url: `${BASE_URL}/writing`, lastModified: now, priority: 0.8 },
    { url: `${BASE_URL}/projects`, lastModified: now, priority: 0.8 },
    { url: `${BASE_URL}/travel`, lastModified: now, priority: 0.6 },
    { url: `${BASE_URL}/food`, lastModified: now, priority: 0.6 },
    { url: `${BASE_URL}/investing`, lastModified: now, priority: 0.6 },
    ...projects.map((project) => ({
      url: `${BASE_URL}/projects/${project.slug}`,
      lastModified: now,
      priority: 0.6,
    })),
    ...posts.map((post) => ({
      url: `${BASE_URL}/${post.slug}`,
      lastModified: post.date ? new Date(`${post.date}T00:00:00Z`) : now,
      priority: 0.7,
    })),
  ];
}
