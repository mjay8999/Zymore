import BlogCard from "@/components/blog-card";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { blogCategories } from "@/lib/blog-categories";
import { getAllPosts } from "@/lib/posts";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div>
      <div className="site-shell">
        <SiteHeader active="blog" />
        <main>
          <section className="blog-overview-head reveal">
            <p className="eyebrow">The Zymore journal</p>
            <h1>Ideas for building more thoughtful AI systems.</h1>
            <p className="lead">Explore all of our research, practical guides, and perspectives.</p>
          </section>

          <section className="blog-filter-row reveal delay-1" aria-label="Blog categories">
            <span>{posts.length} articles</span>
            {blogCategories.map((category) => (
              <Link key={category.slug} href={`/blog/category/${category.slug}`}>
                {category.label}
              </Link>
            ))}
          </section>

          <section className="blog-gallery reveal delay-2">
            {posts.map((post, index) => (
              <BlogCard key={post.slug} post={post} index={index} />
            ))}
          </section>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
