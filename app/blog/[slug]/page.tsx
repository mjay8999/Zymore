import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ArticleRichText from "@/components/article-rich-text";
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
              {post.showRelated !== false && relatedPosts.length > 0 ? (
                <a href="#article-related">
                  <span>03</span>
                  <p>Related links</p>
                </a>
              ) : null}
            </aside>

            <article className="article-content" id="article-start">
              <div className="article-cover image-cover" id="article-content">
                {/* Native image sizing uses each source's actual dimensions and keeps its original ratio. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.coverImage}
                  alt={post.coverAlt}
                />
              </div>

              {post.blocks.map((block) => {
                if (block.type === "paragraph") {
                  return (
                    <ArticleRichText key={block.id} text={block.text} fontSize={block.fontSize} />
                  );
                }

                const align = block.align ?? "center";
                return (
                  <figure
                    key={block.id}
                    className={`article-inline-image${block.frame === false ? "" : " framed"}`}
                    style={{
                      width: `${block.width ?? 100}%`,
                      marginLeft: align === "left" ? 0 : "auto",
                      marginRight: align === "right" ? 0 : "auto",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={block.src}
                      alt={block.alt}
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

            </aside>
          </section>

          {post.showRelated !== false && relatedPosts.length > 0 ? (
            <section className="related-network" id="article-related" aria-labelledby="related-network-title">
              <div className="related-network-heading">
                <p className="eyebrow">Connected reading</p>
                <h2 id="related-network-title">Related articles</h2>
                <p>Follow the connections to explore ideas that build on this one.</p>
              </div>
              <div className="related-network-grid">
                {relatedPosts.map((related, index) => (
                  <Link className="related-network-card" key={related.slug} href={`/blog/${related.slug}`}>
                    <span className="related-network-node" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <span className="related-network-image">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={related.coverImage} alt={related.coverAlt} loading="lazy" />
                    </span>
                    <span className="related-network-copy">
                      <span className="meta">{related.category.replace(/-/g, " ")}</span>
                      <strong>{related.title}</strong>
                      <span className="related-network-excerpt">{related.excerpt}</span>
                      <span className="related-network-open">Read article <span aria-hidden="true">↗</span></span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
