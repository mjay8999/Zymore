import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { blogCategories } from "@/lib/blog-categories";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-session";
import { getAllPosts, savePosts, type BlogPost } from "@/lib/posts";
import { readLimitedJson } from "@/lib/read-limited-json";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validatePost(raw: unknown): raw is BlogPost {
  if (!raw || typeof raw !== "object") {
    return false;
  }

  const post = raw as Partial<BlogPost>;

  const isImageSource = (value: unknown): value is string => {
    if (typeof value !== "string" || value.length > 2_000) return false;
    if (value.startsWith("/") && !value.startsWith("//")) return true;
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  };

  const isBlock = (block: unknown) => {
    if (!block || typeof block !== "object") return false;
    const item = block as Record<string, unknown>;
    if (typeof item.id !== "string" || item.id.length > 100) return false;

    if (item.type === "paragraph") {
      return (
        typeof item.text === "string" &&
        item.text.length <= 20_000 &&
        typeof item.fontSize === "number" &&
        Number.isFinite(item.fontSize) &&
        item.fontSize >= 16 &&
        item.fontSize <= 34
      );
    }

    return (
      item.type === "image" &&
      isImageSource(item.src) &&
      typeof item.alt === "string" &&
      item.alt.length <= 300 &&
      (item.caption === undefined || (typeof item.caption === "string" && item.caption.length <= 500))
    );
  };

  const published = typeof post.published === "string" ? post.published : "";
  const parsedDate = new Date(`${published}T00:00:00Z`);

  return (
    typeof post.slug === "string" && SLUG_PATTERN.test(post.slug) &&
    typeof post.title === "string" && post.title.trim().length > 0 && post.title.length <= 180 &&
    typeof post.excerpt === "string" && post.excerpt.trim().length > 0 && post.excerpt.length <= 1_000 &&
    typeof post.readTime === "string" && post.readTime.length <= 40 &&
    /^\d{4}-\d{2}-\d{2}$/.test(published) &&
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === published &&
    typeof post.team === "string" && post.team.length <= 100 &&
    typeof post.category === "string" && blogCategories.some((category) => category.slug === post.category) &&
    Array.isArray(post.topics) && post.topics.length <= 20 && post.topics.every((topic) => typeof topic === "string" && topic.length <= 100) &&
    isImageSource(post.coverImage) && typeof post.coverAlt === "string" && post.coverAlt.length <= 300 &&
    Array.isArray(post.relatedSlugs) && post.relatedSlugs.length <= 50 && post.relatedSlugs.every((slug) => typeof slug === "string" && SLUG_PATTERN.test(slug)) &&
    Array.isArray(post.blocks) && post.blocks.length <= 100 && post.blocks.every(isBlock)
  );
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
  } catch {
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

  const payload = parsed.value;
  if (!validatePost(payload)) {
    return NextResponse.json({ message: "Invalid post payload" }, { status: 400 });
  }

  let posts: BlogPost[];
  try {
    posts = await getAllPosts();
  } catch {
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
  } catch {
    return NextResponse.json({ message: "Could not save the article. Check the Vercel Blob connection." }, { status: 503 });
  }

  return NextResponse.json({ ok: true, post: payload });
}
