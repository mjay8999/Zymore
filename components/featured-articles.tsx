"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export type FeaturedArticleData = {
  slug: string;
  title: string;
  excerpt: string;
  published: string;
  category: string;
  coverImage: string;
  coverAlt: string;
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date);
}

export default function FeaturedArticles({ articles }: { articles: FeaturedArticleData[] }) {
  const [category, setCategory] = useState("all");
  const [start, setStart] = useState(0);
  const categories = useMemo(() => [...new Set(articles.map((article) => article.category))], [articles]);
  const filtered = useMemo(
    () => articles.filter((article) => category === "all" || article.category === category),
    [articles, category],
  );
  const visible = filtered.slice(start, start + 3);

  const move = (direction: -1 | 1) => {
    if (filtered.length <= 3) return;
    const pageCount = Math.ceil(filtered.length / 3);
    const currentPage = Math.floor(start / 3);
    const nextPage = (currentPage + direction + pageCount) % pageCount;
    setStart(nextPage * 3);
  };

  return (
    <section className="featured-articles" aria-labelledby="featured-articles-title">
      <div className="featured-articles-heading">
        <div>
          <p className="eyebrow">From the Zymore journal</p>
          <h2 id="featured-articles-title">Articles</h2>
          <p className="featured-articles-intro">Ideas and field notes on AI safety, governance, and applied research.</p>
        </div>
        <div className="featured-articles-actions">
          <Link className="text-link" href="/blog">View all articles <span aria-hidden="true">→</span></Link>
          <div className="carousel-controls" aria-label="Featured article controls">
            <button type="button" onClick={() => move(-1)} disabled={filtered.length <= 3} aria-label="Previous articles">←</button>
            <button type="button" onClick={() => move(1)} disabled={filtered.length <= 3} aria-label="Next articles">→</button>
          </div>
        </div>
      </div>

      {categories.length > 1 ? (
        <div className="featured-article-filters" aria-label="Filter featured articles by topic">
          <button type="button" className={category === "all" ? "active" : ""} onClick={() => { setCategory("all"); setStart(0); }}>All</button>
          {categories.map((item) => (
            <button type="button" className={category === item ? "active" : ""} key={item} onClick={() => { setCategory(item); setStart(0); }}>
              {item.replace(/-/g, " ")}
            </button>
          ))}
        </div>
      ) : null}

      {visible.length ? (
        <div className="featured-article-grid" aria-live="polite">
          {visible.map((article) => (
            <article className="featured-article-card" key={article.slug}>
              <Link className="featured-article-image" href={`/blog/${article.slug}`} aria-label={`Read ${article.title}`}>
                <Image src={article.coverImage} alt={article.coverAlt} fill sizes="(max-width: 760px) 88vw, (max-width: 1080px) 44vw, 30vw" />
                <span className="featured-article-open" aria-hidden="true">↗</span>
              </Link>
              <div className="featured-article-meta">
                <span>{article.category.replace(/-/g, " ")}</span>
                <time dateTime={article.published}>{formatDate(article.published)}</time>
              </div>
              <h3><Link href={`/blog/${article.slug}`}>{article.title}</Link></h3>
              <p>{article.excerpt}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="featured-articles-empty">
          <p>New articles are in progress.</p>
          <Link href="/blog">Visit the journal <span aria-hidden="true">→</span></Link>
        </div>
      )}
    </section>
  );
}
