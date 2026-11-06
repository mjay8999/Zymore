import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ArticleRichText from "@/components/article-rich-text";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import {
  formatPublishedDate,
  getArticleHeadings,
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/posts";

type BlogDetailProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

const DEFAULT_AUTHOR_BYLINE = "By Jay Abhay Mehta | Founder & Principal Engineer, Zymore Labs";
const COVER_ASPECT_RATIOS = {
  "16:9": "16 / 9",
  "3:2": "3 / 2",
  "4:3": "4 / 3",
  "1:1": "1 / 1",
  "4:5": "4 / 5",
} as const;

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
  const articleHeadings = getArticleHeadings(post);

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
            <p className="article-byline">{post.author || DEFAULT_AUTHOR_BYLINE}</p>
          </section>

          <section className="article-layout reveal delay-1">
            <nav className="chapter-nav" aria-label="On this page">
              <a href="#article-start">
                <span>01</span>
                <p>Overview</p>
              </a>
              {articleHeadings.map((heading, index) => (
                <a className={`chapter-link level-${heading.level}`} href={`#${heading.id}`} key={heading.id}>
                  <span>{String(index + 2).padStart(2, "0")}</span>
                  <p>{heading.title}</p>
                </a>
              ))}
              {post.showRelated !== false && relatedPosts.length > 0 ? (
                <a href="#article-related-all">
                  <span>{String(articleHeadings.length + 2).padStart(2, "0")}</span>
                  <p>Related articles</p>
                </a>
              ) : null}
            </nav>

            <article className="article-content" id="article-start">
              <div
                className="article-cover image-cover"
                id="article-content"
                style={{ aspectRatio: COVER_ASPECT_RATIOS[post.coverAspectRatio ?? "16:9"] }}
              >
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
                    <ArticleRichText
                      key={block.id}
                      text={block.text}
                      fontSize={block.fontSize}
                      headingIds={articleHeadings
                        .filter((heading) => heading.blockId === block.id)
                        .map(({ lineIndex, id }) => ({ lineIndex, id }))}
                    />
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

              {post.showRelated !== false && relatedPosts.length > 0 ? (
                <section className="related-sidebar" aria-labelledby="related-sidebar-heading">
                  <div className="related-sidebar-network" aria-label="Connected articles">
                    <Link className="related-sidebar-node current" href="#article-start" aria-label="Current article">
                      <span className="visually-hidden">Current article</span>
                    </Link>
                    {relatedPosts.slice(0, 4).map((related) => (
                      <Link className="related-sidebar-node" href={`/blog/${related.slug}`} key={related.slug} aria-label={related.title}>
                        <span className="visually-hidden">{related.title}</span>
                      </Link>
                    ))}
                  </div>
                  <h3 id="related-sidebar-heading">Related articles</h3>
                  <Link className="related-sidebar-card" href={`/blog/${relatedPosts[0].slug}`}>
                    <span className="related-sidebar-image">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={relatedPosts[0].coverImage} alt={relatedPosts[0].coverAlt} />
                    </span>
                    <span className="related-sidebar-copy">
                      <span className="meta">{relatedPosts[0].team} · {formatPublishedDate(relatedPosts[0].published)}</span>
                      <strong>{relatedPosts[0].title}</strong>
                    </span>
                  </Link>
                  {relatedPosts.length > 1 ? (
                    <a className="related-sidebar-more" href="#article-related-all">View more <span aria-hidden="true">→</span></a>
                  ) : null}
                </section>
              ) : null}

            </aside>
          </section>

          {post.showRelated !== false && relatedPosts.length > 0 ? (
            <section className="related-network" id="article-related-all" aria-labelledby="related-network-title">
              <div className="related-network-heading">
                <p className="eyebrow">Connected reading</p>
                <h2 id="related-network-title">Related articles</h2>
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
