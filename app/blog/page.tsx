import BlogExplorer from "@/components/blog-explorer";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { blogCategories } from "@/lib/blog-categories";
import { getAllPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getAllPosts();
  const explorerPosts = posts.map(({ slug, title, excerpt, published, team, category, topics, coverImage, coverAlt }) => ({
    slug, title, excerpt, published, team, category, topics, coverImage, coverAlt,
  }));

  return (
    <div>
      <div className="site-shell blog-shell">
        <SiteHeader active="blog" />
        <main>
          <BlogExplorer posts={explorerPosts} categories={blogCategories} />
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
