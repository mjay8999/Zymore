import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/lib/posts";
import { formatPublishedDate } from "@/lib/posts";

type BlogCardProps = {
  post: BlogPost;
  index?: number;
};

function canOptimizeImage(src: string): boolean {
  try {
    const hostname = new URL(src).hostname;
    return hostname === "images.unsplash.com" || hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return src.startsWith("/") && !src.startsWith("//");
  }
}

export default function BlogCard({ post, index = 0 }: BlogCardProps) {
  const cardClass = index % 3 === 1 ? "blog-gallery-card wide" : "blog-gallery-card";

  return (
    <article className={cardClass}>
      <Link href={`/blog/${post.slug}`} className="blog-image-link" aria-label={post.title}>
        <Image
          src={post.coverImage}
          alt={post.coverAlt}
          width={960}
          height={720}
          sizes="(max-width: 680px) 100vw, (max-width: 1000px) 50vw, 33vw"
          unoptimized={!canOptimizeImage(post.coverImage)}
        />
      </Link>
      <div className="blog-gallery-body">
        <p className="meta">
          {post.category.replace(/-/g, " ")} | {formatPublishedDate(post.published)}
        </p>
        <h3>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        <p>{post.excerpt}</p>
      </div>
    </article>
  );
}
