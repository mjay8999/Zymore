"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { BlogCategory } from "@/lib/blog-categories";
import type { BlogPost } from "@/lib/posts";

type BlogExplorerProps = {
  posts: Array<Pick<BlogPost, "slug" | "title" | "excerpt" | "published" | "team" | "category" | "topics" | "coverImage" | "coverAlt">>;
  categories: BlogCategory[];
  initialCategory?: string;
  categoryTitle?: string;
};

type SortOrder = "recent" | "oldest" | "title";
type ViewMode = "grid" | "list";

function canOptimizeImage(src: string): boolean {
  try {
    const hostname = new URL(src).hostname;
    return hostname === "images.unsplash.com" || hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return src.startsWith("/") && !src.startsWith("//");
  }
}

function formatPublishedDate(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default function BlogExplorer({
  posts,
  categories,
  initialCategory = "all",
  categoryTitle,
}: BlogExplorerProps) {
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("recent");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [category, setCategory] = useState(initialCategory);

  const visiblePosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return posts
      .filter((post) => category === "all" || post.category === category)
      .filter((post) => {
        if (!normalizedQuery) return true;
        return [post.title, post.excerpt, post.category, post.team, ...post.topics]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((left, right) => {
        if (sortOrder === "title") return left.title.localeCompare(right.title);
        const dateDifference = new Date(left.published).getTime() - new Date(right.published).getTime();
        return sortOrder === "recent" ? -dateDifference : dateDifference;
      });
  }, [posts, query, sortOrder, category]);

  return (
    <section className="blog-explorer" aria-label="Blog articles">
      <h1 className="visually-hidden">{categoryTitle ?? "The Zymore journal"}</h1>
      <header className="blog-explorer-header">
        <div className="blog-explorer-count" aria-live="polite">
          <strong>{visiblePosts.length}</strong>
          <span>{visiblePosts.length === 1 ? "article" : "articles"}</span>
        </div>
        {categoryTitle ? <p className="blog-explorer-category-title">{categoryTitle}</p> : null}
        <div className="blog-explorer-controls">
          <label className="visually-hidden" htmlFor="blog-sort">Sort articles</label>
          <select id="blog-sort" value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)}>
            <option value="recent">Most recent</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title A–Z</option>
          </select>
          <label className="visually-hidden" htmlFor="blog-view">Article layout</label>
          <select id="blog-view" value={viewMode} onChange={(event) => setViewMode(event.target.value as ViewMode)}>
            <option value="grid">Grid view</option>
            <option value="list">List view</option>
          </select>
          <label className="visually-hidden" htmlFor="blog-category">Article category</label>
          <select id="blog-category" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option value={item.slug} key={item.slug}>{item.label}</option>
            ))}
          </select>
          <label className="blog-search">
            <span className="visually-hidden">Search articles</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Enter search..."
            />
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <circle cx="10.8" cy="10.8" r="6.5" />
              <path d="m16 16 4.2 4.2" />
            </svg>
          </label>
        </div>
      </header>

      {visiblePosts.length > 0 ? (
        <div className={`blog-explorer-grid ${viewMode === "list" ? "list-view" : ""}`}>
          {visiblePosts.map((post) => (
            <article className="blog-explorer-card" key={post.slug}>
              <div className="blog-explorer-meta">
                <span className="blog-explorer-category-dot" aria-hidden="true">•••</span>
                <span>{formatPublishedDate(post.published)}</span>
              </div>
              <Link className="blog-explorer-image" href={`/blog/${post.slug}`} aria-label={post.title}>
                <Image
                  src={post.coverImage}
                  alt={post.coverAlt}
                  width={900}
                  height={900}
                  sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, (max-width: 1300px) 25vw, 17vw"
                  unoptimized={!canOptimizeImage(post.coverImage)}
                />
              </Link>
              <div className="blog-explorer-copy">
                <p className="meta">{post.category.replace(/-/g, " ")}</p>
                <h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2>
                {viewMode === "list" ? <p className="blog-explorer-excerpt">{post.excerpt}</p> : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="blog-explorer-empty">No articles match that search. Try a different title or topic.</p>
      )}
    </section>
  );
}
