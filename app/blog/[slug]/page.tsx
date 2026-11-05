import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import {
  formatPublishedDate,
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/posts";

type BlogDetailProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

function canOptimizeImage(src: string): boolean {
  try {
    const hostname = new URL(src).hostname;
    return hostname === "images.unsplash.com" || hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return src.startsWith("/") && !src.startsWith("//");
  }
}

export async function generateMetadata({ params }: BlogDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getAllPosts();
  const relatedPosts = getRelatedPosts(post, allPosts);

  return (
    <div>
      <div className="site-shell">
        <SiteHeader active="blog" />
        <main>
          <section className="article-top reveal">
            <p className="meta">
              {post.category.replace(/-/g, " ")} | {formatPublishedDate(post.published)}
            </p>
            <h1>{post.title}</h1>
            <p className="lead">{post.excerpt}</p>
          </section>

          <section className="article-layout reveal delay-1">
            <aside className="chapter-nav" aria-label="Article meta">
              <a href="#article-start">
                <span>01</span>
                <p>Overview</p>
              </a>
              <a href="#article-content">
                <span>02</span>
                <p>Article</p>
              </a>
              <a href="#article-related">
                <span>03</span>
                <p>Related links</p>
              </a>
            </aside>

            <article className="article-content" id="article-start">
              <div className="article-cover image-cover" id="article-content">
                <Image
                  src={post.coverImage}
                  alt={post.coverAlt}
                  width={1600}
                  height={900}
                  priority
                  sizes="(max-width: 820px) 100vw, 760px"
                  unoptimized={!canOptimizeImage(post.coverImage)}
                />
              </div>

              {post.blocks.map((block) => {
                if (block.type === "paragraph") {
                  return (
                    <p
                      key={block.id}
                      className="article-paragraph"
                      style={{ fontSize: `${block.fontSize}px` }}
                    >
                      {block.text}
                    </p>
                  );
                }

                return (
                  <figure key={block.id} className="article-inline-image">
                    <Image
                      src={block.src}
                      alt={block.alt}
                      width={1200}
                      height={800}
                      sizes="(max-width: 820px) 100vw, 760px"
                      unoptimized={!canOptimizeImage(block.src)}
                    />
                    {block.caption ? <figcaption>{block.caption}</figcaption> : null}
                  </figure>
                );
              })}
            </article>

            <aside className="article-side" aria-label="Article metadata">
              <div className="meta-card">
                <div>
                  <p>Published</p>
                  <strong>{formatPublishedDate(post.published)}</strong>
                </div>
                <div>
                  <p>Team</p>
                  <strong>{post.team}</strong>
                </div>
                <div>
                  <p>Topics</p>
                  <ul>
                    {post.topics.map((topic) => (
                      <li key={topic}>{topic}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {relatedPosts.length > 0 ? (
                <div className="related-tree" id="article-related">
                  <div className="tree-line" aria-hidden="true">
                    <span className="node node-core" />
                    <span className="node node-a" />
                    <span className="node node-b" />
                  </div>
                  <h3>Related articles</h3>
                  <div className="related-list">
                    {relatedPosts.map((related) => (
                      <Link key={related.slug} href={`/blog/${related.slug}`}>
                        <p className="meta">{related.category.replace(/-/g, " ")}</p>
                        <h4>{related.title}</h4>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </aside>
          </section>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
