import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import BlogExplorer from "@/components/blog-explorer";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { blogCategories, getCategoryBySlug } from "@/lib/blog-categories";
import { getAllPosts } from "@/lib/posts";

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

  const posts = await getAllPosts();
  const explorerPosts = posts.map(({ slug, title, excerpt, published, team, category, topics, coverImage, coverAlt }) => ({
    slug, title, excerpt, published, team, category, topics, coverImage, coverAlt,
  }));

  return (
    <div>
      <div className="site-shell blog-shell">
        <SiteHeader active="blog" />
        <main>
          <BlogExplorer
            posts={explorerPosts}
            categories={blogCategories}
            initialCategory={categoryData.slug}
            categoryTitle={categoryData.label}
          />
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
