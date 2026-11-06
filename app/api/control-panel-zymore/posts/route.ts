import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { blogCategories } from "@/lib/blog-categories";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-session";
import { getAllPosts, savePosts, type BlogPost } from "@/lib/posts";
import { readLimitedJson } from "@/lib/read-limited-json";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function logStorageFailure(operation: string, error: unknown) {
  const isError = error instanceof Error;
  const message = isError
    ? error.message
        .replace(/Bearer\s+\S+/gi, "Bearer [redacted]")
        .replace(/(token=)[^\s&]+/gi, "$1[redacted]")
        .replace(/vercel_blob_rw_[a-z0-9_-]+/gi, "[redacted]")
    : "Unknown storage error";

  console.error(`[control-panel-zymore] ${operation} failed`, {
    errorName: isError ? error.name : "UnknownError",
    message,
  });
}

function isImageSource(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2_000) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function getPostValidationError(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") {
    return "Enter the article details and try again.";
  }

  const post = raw as Partial<BlogPost>;
  const published = typeof post.published === "string" ? post.published : "";
  const parsedDate = new Date(`${published}T00:00:00Z`);

  if (typeof post.slug !== "string" || !SLUG_PATTERN.test(post.slug)) {
    return "Enter a valid article slug using lowercase letters, numbers, and hyphens.";
  }
  if (typeof post.title !== "string" || post.title.trim().length === 0 || post.title.length > 180) {
    return "Enter an article title (up to 180 characters).";
  }
  if (typeof post.excerpt !== "string" || post.excerpt.trim().length === 0 || post.excerpt.length > 1_000) {
    return "Enter an article excerpt (up to 1,000 characters).";
  }
  if (typeof post.readTime !== "string" || post.readTime.length > 40) {
    return "Enter a reading time (up to 40 characters).";
  }
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(published) ||
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== published
  ) {
    return "Choose a valid publication date.";
  }
  if (typeof post.team !== "string" || post.team.length > 100) {
    return "Enter a team name (up to 100 characters).";
  }
  if (post.author !== undefined && (typeof post.author !== "string" || post.author.length > 180)) {
    return "Keep the author byline to 180 characters or fewer.";
  }
  if (typeof post.category !== "string" || !blogCategories.some((category) => category.slug === post.category)) {
    return "Choose a valid article category.";
  }
  if (!Array.isArray(post.topics) || post.topics.length > 20 || !post.topics.every((topic) => typeof topic === "string" && topic.length <= 100)) {
    return "Check the topics list. Each topic can be up to 100 characters, with at most 20 topics.";
  }
  if (!isImageSource(post.coverImage)) {
    return "Add a cover image by uploading one or entering an HTTPS image URL.";
  }
  if (typeof post.coverAlt !== "string" || post.coverAlt.length > 300) {
    return "Enter cover image alt text (up to 300 characters).";
  }
  if (!Array.isArray(post.relatedSlugs) || post.relatedSlugs.length > 50 || !post.relatedSlugs.every((slug) => typeof slug === "string" && SLUG_PATTERN.test(slug))) {
    return "Check the related article slugs. Use lowercase letters, numbers, and hyphens.";
  }
  if (post.showRelated !== undefined && typeof post.showRelated !== "boolean") {
    return "Choose whether related articles are visible on this article page.";
  }
  if (!Array.isArray(post.blocks) || post.blocks.length > 100) {
    return "An article can contain up to 100 text and image blocks.";
  }

  for (const [index, block] of post.blocks.entries()) {
    if (!block || typeof block !== "object") {
      return `Article block ${index + 1} is invalid.`;
    }
    const item = block as Record<string, unknown>;
    if (typeof item.id !== "string" || item.id.length > 100) {
      return `Article block ${index + 1} needs a valid block ID.`;
    }
    if (item.type === "paragraph") {
      if (typeof item.text !== "string" || item.text.length > 20_000) {
        return `Paragraph ${index + 1} must be 20,000 characters or fewer.`;
      }
      if (typeof item.fontSize !== "number" || !Number.isFinite(item.fontSize) || item.fontSize < 16 || item.fontSize > 34) {
        return `Set paragraph ${index + 1} font size between 16px and 34px.`;
      }
      continue;
    }
    if (item.type !== "image") {
      return `Article block ${index + 1} must be a paragraph or image.`;
    }
    if (!isImageSource(item.src)) {
      return `Upload an image or enter an HTTPS image URL for image block ${index + 1}.`;
    }
    if (typeof item.alt !== "string" || item.alt.length > 300) {
      return `Enter alt text of 300 characters or fewer for image block ${index + 1}.`;
    }
    if (item.caption !== undefined && (typeof item.caption !== "string" || item.caption.length > 500)) {
      return `Keep the caption for image block ${index + 1} to 500 characters or fewer.`;
    }
    if (item.width !== undefined && (typeof item.width !== "number" || !Number.isInteger(item.width) || item.width < 25 || item.width > 100)) {
      return `Set image block ${index + 1} width between 25% and 100%.`;
    }
    if (item.align !== undefined && !["left", "center", "right"].includes(item.align as string)) {
      return `Choose left, center, or right alignment for image block ${index + 1}.`;
    }
    if (item.frame !== undefined && typeof item.frame !== "boolean") {
      return `Choose whether image block ${index + 1} has a frame.`;
    }
  }

  return null;
}

async function checkAdminAccess() {
  const secret = process.env.ZYMORE_ADMIN_KEY;
  if (!secret) {
    return false;
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE)?.value;
  return verifyAdminSession(session, secret);
}

export async function GET() {
  const allowed = await checkAdminAccess();
  if (!allowed) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let posts: BlogPost[];
  try {
    posts = await getAllPosts();
  } catch (error) {
    logStorageFailure("load posts", error);
    return NextResponse.json({ message: "Blog storage is unavailable." }, { status: 503 });
  }
  return NextResponse.json(
    { posts, categories: blogCategories },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request: Request) {
  const allowed = await checkAdminAccess();
  if (!allowed) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  }

  const parsed = await readLimitedJson(request, 1_000_000);
  if (!parsed.ok) {
    const status = parsed.reason === "too-large" ? 413 : 400;
    return NextResponse.json({ message: "Invalid or oversized JSON payload." }, { status });
  }

  const validationError = getPostValidationError(parsed.value);
  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }
  const payload = parsed.value as BlogPost;

  let posts: BlogPost[];
  try {
    posts = await getAllPosts();
  } catch (error) {
    logStorageFailure("load posts before save", error);
    return NextResponse.json({ message: "Blog storage is unavailable." }, { status: 503 });
  }
  const nextPosts = [...posts];
  const index = nextPosts.findIndex((post) => post.slug === payload.slug);

  if (index >= 0) {
    nextPosts[index] = payload;
  } else {
    nextPosts.push(payload);
  }

  try {
    await savePosts(nextPosts);
  } catch (error) {
    logStorageFailure("save posts", error);
    return NextResponse.json({ message: "Could not save the article. Check the Vercel Blob connection." }, { status: 503 });
  }

  return NextResponse.json({ ok: true, post: payload });
}

export async function DELETE(request: Request) {
  const allowed = await checkAdminAccess();
  if (!allowed) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  }

  const parsed = await readLimitedJson(request, 2_000);
  if (!parsed.ok) {
    const status = parsed.reason === "too-large" ? 413 : 400;
    return NextResponse.json({ message: "Invalid delete request." }, { status });
  }

  const slug =
    parsed.value && typeof parsed.value === "object" && "slug" in parsed.value && typeof parsed.value.slug === "string"
      ? parsed.value.slug
      : "";
  if (!SLUG_PATTERN.test(slug)) {
    return NextResponse.json({ message: "Invalid article slug." }, { status: 400 });
  }

  let posts: BlogPost[];
  try {
    posts = await getAllPosts();
  } catch (error) {
    logStorageFailure("load posts before delete", error);
    return NextResponse.json({ message: "Blog storage is unavailable." }, { status: 503 });
  }

  if (!posts.some((post) => post.slug === slug)) {
    return NextResponse.json({ message: "Article not found." }, { status: 404 });
  }

  try {
    await savePosts(
      posts
        .filter((post) => post.slug !== slug)
        .map((post) => ({
          ...post,
          relatedSlugs: post.relatedSlugs.filter((relatedSlug) => relatedSlug !== slug),
        })),
    );
  } catch (error) {
    logStorageFailure("delete post", error);
    return NextResponse.json({ message: "Could not delete the article. Check the Vercel Blob connection." }, { status: 503 });
  }

  return NextResponse.json({ ok: true, deletedSlug: slug });
}
