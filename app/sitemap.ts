import type { MetadataRoute } from "next";
import { blogCategories } from "@/lib/blog-categories";
import { getAllPosts } from "@/lib/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://zymore.tech";
  const posts = await getAllPosts();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/founder`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/about`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/contact`,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${base}/blog`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/publications`,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${base}/technical-capabilities`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const categoryRoutes = blogCategories.map((category) => ({
    url: `${base}/blog/category/${category.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const blogRoutes = posts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...blogRoutes];
}
