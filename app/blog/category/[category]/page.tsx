import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import BlogCard from "@/components/blog-card";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { blogCategories, getCategoryBySlug } from "@/lib/blog-categories";
import { getPostsByCategory } from "@/lib/posts";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return blogCategories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const data = getCategoryBySlug(category);
  if (!data) {
    return { title: "Category Not Found" };
  }

  return {
    title: `${data.label} Articles`,
    description: data.description,
  };
}

export default async function BlogCategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  if (category === "overview") {
    redirect("/blog");
  }

  const categoryData = getCategoryBySlug(category);
  if (!categoryData) {
    notFound();
  }

  const posts = await getPostsByCategory(categoryData.slug);

  return (
    <div>
      <div className="site-shell">
        <SiteHeader active="blog" />
        <main>
          <section className="blog-overview-head reveal">
            <h1>{categoryData.label}</h1>
            <p className="lead">{categoryData.description}</p>
          </section>

          <section className="blog-filter-row reveal delay-1" aria-label="Category links">
            <Link href="/blog">All articles</Link>
            {blogCategories.map((item) => (
              <Link key={item.slug} href={`/blog/category/${item.slug}`}>
                {item.label}
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
