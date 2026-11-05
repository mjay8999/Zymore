"use client";

import { useEffect, useMemo, useState } from "react";
import { upload } from "@vercel/blob/client";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import type { BlogPost, ContentBlock } from "@/lib/posts";

type Category = {
  slug: string;
  label: string;
};

type AdminResponse = {
  posts: BlogPost[];
  categories: Category[];
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function createParagraphBlock(): ContentBlock {
  return {
    id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: "paragraph",
    text: "",
    fontSize: 20,
  };
}

function createImageBlock(): ContentBlock {
  return {
    id: `i-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: "image",
    src: "",
    alt: "",
    caption: "",
  };
}

function createDraft(): BlogPost {
  return {
    slug: "",
    title: "",
    excerpt: "",
    readTime: "6 min read",
    published: new Date().toISOString().slice(0, 10),
    team: "Editorial",
    category: "ai-safety",
    topics: [],
    coverImage: "",
    coverAlt: "",
    relatedSlugs: [],
    blocks: [createParagraphBlock()],
  };
}

export default function AdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [draft, setDraft] = useState<BlogPost>(createDraft());
  const [topicsInput, setTopicsInput] = useState("");
  const [relatedInput, setRelatedInput] = useState("");
  const [selectedSlug, setSelectedSlug] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/control-panel-zymore/posts", { cache: "no-store" });
      if (!response.ok) {
        setStatus("Failed to load posts. Check admin access key.");
        setLoading(false);
        return;
      }

      const payload = (await response.json()) as AdminResponse;
      setPosts(payload.posts);
      setCategories(payload.categories);
      setLoading(false);
    };

    void load();
  }, []);

  const relatedOptions = useMemo(
    () => posts.filter((post) => post.slug !== draft.slug),
    [posts, draft.slug],
  );

  const loadPost = (slug: string) => {
    const existing = posts.find((post) => post.slug === slug);
    if (!existing) {
      return;
    }

    setDraft(existing);
    setTopicsInput(existing.topics.join(", "));
    setRelatedInput(existing.relatedSlugs.join(", "));
    setStatus(`Loaded ${existing.title}`);
  };

  const savePost = async () => {
    const payload: BlogPost = {
      ...draft,
      topics: topicsInput
        .split(",")
        .map((topic) => topic.trim())
        .filter(Boolean),
      relatedSlugs: relatedInput
        .split(",")
        .map((slug) => slug.trim())
        .filter(Boolean),
    };

    const response = await fetch("/api/control-panel-zymore/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { message?: string } | null;
      setStatus(result?.message ?? "Save failed. Verify required fields and access.");
      return;
    }

    setStatus("Article saved successfully.");
    const fresh = await fetch("/api/control-panel-zymore/posts", { cache: "no-store" });
    if (fresh.ok) {
      const data = (await fresh.json()) as AdminResponse;
      setPosts(data.posts);
    }
  };

  const uploadArticleImage = async (file: File, target: "cover" | string) => {
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
      setStatus("Choose a JPEG, PNG, WebP, or AVIF image.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setStatus("Images must be 8 MB or smaller.");
      return;
    }

    setStatus("Uploading image...");
    try {
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, "-").slice(-150);
      const blob = await upload(`articles/${Date.now()}-${safeName}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/uploads",
      });

      setDraft((previous) => ({
        ...previous,
        ...(target === "cover"
          ? { coverImage: blob.url }
          : {
              blocks: previous.blocks.map((block) =>
                block.id === target && block.type === "image" ? { ...block, src: blob.url } : block,
              ),
            }),
      }));
      setStatus("Image uploaded. Save the article to publish the change.");
    } catch {
      setStatus("Image upload failed. Make sure the Vercel Blob store is connected.");
    }
  };

  const updateBlock = (id: string, updater: (block: ContentBlock) => ContentBlock) => {
    setDraft((previous) => ({
      ...previous,
      blocks: previous.blocks.map((block) => (block.id === id ? updater(block) : block)),
    }));
  };

  const removeBlock = (id: string) => {
    setDraft((previous) => ({
      ...previous,
      blocks: previous.blocks.filter((block) => block.id !== id),
    }));
  };

  return (
    <div>
      <div className="site-shell">
        <SiteHeader active="blog" />
        <main>
          <section className="panel reveal compact-head">
            <p className="eyebrow">Admin</p>
            <h1>Zymore hidden article manager</h1>
            <p className="lead">
              Create or edit category-based blog posts with cover images, inline images, and custom paragraph font sizes.
            </p>
          </section>

          <section className="panel reveal delay-1">
            <div className="admin-grid">
              <div className="admin-form">
                <label>Load existing post</label>
                <select
                  value={selectedSlug}
                  onChange={(event) => {
                    const slug = event.target.value;
                    setSelectedSlug(slug);
                    if (slug) {
                      loadPost(slug);
                    }
                  }}
                >
                  <option value="">Create new post</option>
                  {posts.map((post) => (
                    <option key={post.slug} value={post.slug}>
                      {post.title}
                    </option>
                  ))}
                </select>

                <label>Title</label>
                <input
                  value={draft.title}
                  onChange={(event) => {
                    const title = event.target.value;
                    setDraft((previous) => ({
                      ...previous,
                      title,
                      ...(previous.slug ? {} : { slug: slugify(title) }),
                    }));
                  }}
                />

                <label>Slug</label>
                <input
                  value={draft.slug}
                  onChange={(event) => setDraft({ ...draft, slug: slugify(event.target.value) })}
                />

                <label>Excerpt</label>
                <textarea
                  rows={3}
                  value={draft.excerpt}
                  onChange={(event) => setDraft({ ...draft, excerpt: event.target.value })}
                />

                <div className="admin-row">
                  <div>
                    <label>Published date</label>
                    <input
                      type="date"
                      value={draft.published}
                      onChange={(event) => setDraft({ ...draft, published: event.target.value })}
                    />
                  </div>
                  <div>
                    <label>Read time</label>
                    <input
                      value={draft.readTime}
                      onChange={(event) => setDraft({ ...draft, readTime: event.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-row">
                  <div>
                    <label>Category</label>
                    <select
                      value={draft.category}
                      onChange={(event) => setDraft({ ...draft, category: event.target.value })}
                    >
                      {categories.map((category) => (
                        <option key={category.slug} value={category.slug}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Team</label>
                    <input
                      value={draft.team}
                      onChange={(event) => setDraft({ ...draft, team: event.target.value })}
                    />
                  </div>
                </div>

                <label>Topics (comma separated)</label>
                <input
                  value={topicsInput}
                  onChange={(event) => setTopicsInput(event.target.value)}
                  placeholder="AI safety, Cybersecurity, Healthcare"
                />

                <label>Related slugs (comma separated)</label>
                <input
                  value={relatedInput}
                  onChange={(event) => setRelatedInput(event.target.value)}
                  placeholder={relatedOptions.map((post) => post.slug).join(", ")}
                />

                <label>Cover image</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    if (file) void uploadArticleImage(file, "cover");
                    event.currentTarget.value = "";
                  }}
                />
                <label>Or paste an image URL</label>
                <input
                  value={draft.coverImage}
                  onChange={(event) => setDraft({ ...draft, coverImage: event.target.value })}
                  placeholder="https://..."
                />

                <label>Cover image alt text</label>
                <input
                  value={draft.coverAlt}
                  onChange={(event) => setDraft({ ...draft, coverAlt: event.target.value })}
                />

                <div className="admin-actions">
                  <button type="button" onClick={() => setDraft({ ...draft, blocks: [...draft.blocks, createParagraphBlock()] })}>
                    Add text block
                  </button>
                  <button type="button" onClick={() => setDraft({ ...draft, blocks: [...draft.blocks, createImageBlock()] })}>
                    Add image block
                  </button>
                  <button type="button" className="primary" onClick={savePost}>
                    Save article
                  </button>
                </div>

                <p className="admin-status">{loading ? "Loading admin data..." : status}</p>
              </div>

              <div className="admin-blocks">
                <h3>Article blocks</h3>
                {draft.blocks.map((block) => (
                  <article key={block.id} className="card">
                    <div className="admin-block-head">
                      <strong>{block.type === "paragraph" ? "Paragraph" : "Image"}</strong>
                      <button type="button" onClick={() => removeBlock(block.id)}>
                        Remove
                      </button>
                    </div>

                    {block.type === "paragraph" ? (
                      <>
                        <label>Text</label>
                        <textarea
                          rows={5}
                          value={block.text}
                          onChange={(event) =>
                            updateBlock(block.id, () => ({ ...block, text: event.target.value }))
                          }
                        />
                        <label>Font size ({block.fontSize}px)</label>
                        <input
                          type="range"
                          min={16}
                          max={34}
                          value={block.fontSize}
                          onChange={(event) =>
                            updateBlock(block.id, () => ({
                              ...block,
                              fontSize: Number(event.target.value),
                            }))
                          }
                        />
                      </>
                    ) : (
                      <>
                        <label>Upload image</label>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          onChange={(event) => {
                            const file = event.currentTarget.files?.[0];
                            if (file) void uploadArticleImage(file, block.id);
                            event.currentTarget.value = "";
                          }}
                        />
                        <label>Or paste an image URL</label>
                        <input
                          value={block.src}
                          onChange={(event) =>
                            updateBlock(block.id, () => ({ ...block, src: event.target.value }))
                          }
                        />
                        <label>Alt text</label>
                        <input
                          value={block.alt}
                          onChange={(event) =>
                            updateBlock(block.id, () => ({ ...block, alt: event.target.value }))
                          }
                        />
                        <label>Caption</label>
                        <input
                          value={block.caption ?? ""}
                          onChange={(event) =>
                            updateBlock(block.id, () => ({ ...block, caption: event.target.value }))
                          }
                        />
                      </>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
