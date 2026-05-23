import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";

const BASE_URL = "https://savargupta.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const posts = getAllPosts();

  return [
    { url: `${BASE_URL}/`, lastModified: now, priority: 1 },
    { url: `${BASE_URL}/about`, lastModified: now, priority: 0.8 },
    ...posts.map((post) => ({
      url: `${BASE_URL}/${post.slug}`,
      lastModified: post.date ? new Date(`${post.date}T00:00:00Z`) : now,
      priority: 0.7,
    })),
  ];
}
