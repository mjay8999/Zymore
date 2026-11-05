import { promises as fs } from "node:fs";
import path from "node:path";
import { list, put } from "@vercel/blob";

export type ContentBlock =
  | {
      id: string;
      type: "paragraph";
      text: string;
      fontSize: number;
    }
  | {
      id: string;
      type: "image";
      src: string;
      alt: string;
      caption?: string;
      width?: number;
      align?: "left" | "center" | "right";
      frame?: boolean;
    };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  readTime: string;
  published: string;
  team: string;
  category: string;
  topics: string[];
  coverImage: string;
  coverAlt: string;
  relatedSlugs: string[];
  blocks: ContentBlock[];
};

const postsFilePath = path.join(process.cwd(), "data", "posts.json");
const postsBlobPath = "content/posts.json";

function hasBlobConnection(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      (process.env.BLOB_STORE_ID &&
        (process.env.VERCEL === "1" || process.env.VERCEL_OIDC_TOKEN)),
  );
}

function normalizePosts(raw: unknown): BlogPost[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.filter((item): item is BlogPost => {
    if (!item || typeof item !== "object") {
      return false;
    }

    const post = item as Partial<BlogPost>;
    return (
      typeof post.slug === "string" &&
      typeof post.title === "string" &&
      typeof post.excerpt === "string" &&
      typeof post.readTime === "string" &&
      typeof post.published === "string" &&
      typeof post.team === "string" &&
      typeof post.category === "string" &&
      Array.isArray(post.topics) &&
      typeof post.coverImage === "string" &&
      typeof post.coverAlt === "string" &&
      Array.isArray(post.relatedSlugs) &&
      Array.isArray(post.blocks)
    );
  });
}

export function formatPublishedDate(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return input;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export async function getAllPosts(): Promise<BlogPost[]> {
  let parsed: unknown;
  if (hasBlobConnection()) {
    const { blobs } = await list({ prefix: postsBlobPath, limit: 1 });
    if (blobs[0]) {
      const response = await fetch(blobs[0].url, { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load blog content from Vercel Blob.");
      parsed = await response.json();
    } else {
      parsed = JSON.parse(await fs.readFile(postsFilePath, "utf8")) as unknown;
    }
  } else {
    parsed = JSON.parse(await fs.readFile(postsFilePath, "utf8")) as unknown;
  }
  const posts = normalizePosts(parsed);

  return posts.sort((a, b) => {
    const left = new Date(a.published).getTime();
    const right = new Date(b.published).getTime();
    return right - left;
  });
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug);
}

export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.category === category);
}

export function getRelatedPosts(post: BlogPost, allPosts: BlogPost[]): BlogPost[] {
  return post.relatedSlugs
    .map((slug) => allPosts.find((candidate) => candidate.slug === slug))
    .filter((candidate): candidate is BlogPost => Boolean(candidate));
}

export async function savePosts(posts: BlogPost[]): Promise<void> {
  const contents = JSON.stringify(posts, null, 2);
  if (hasBlobConnection()) {
    await put(postsBlobPath, contents, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
    return;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("Vercel Blob is not configured. Connect a Blob store before saving posts.");
  }
  await fs.writeFile(postsFilePath, contents);
}
