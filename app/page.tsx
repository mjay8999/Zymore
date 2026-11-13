import FeaturedArticles from "@/components/featured-articles";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { getAllPosts } from "@/lib/posts";
import Link from "next/link";

export default async function HomePage() {
  const posts = await getAllPosts();
  const articles = posts.slice(0, 8).map(({ slug, title, excerpt, published, category, coverImage, coverAlt }) => ({
    slug, title, excerpt, published, category, coverImage, coverAlt,
  }));

  return (
    <div className="site-shell">
      <SiteHeader active="home" />
      <main>
        <section className="home-hero research-hero reveal">
          <div className="hero-orbit" aria-hidden="true"><span /><span /><span /></div>
          <div className="hero-center">
            <p className="eyebrow">Independent research · Applied safety</p>
            <h1>Zymore Research: Independent Technical AI Governance &amp; Applied Safety.</h1>
            <p className="lead">
              Deploying secure LLM infrastructure, conducting empirical AI welfare research, and
              architecting multi-agent governance frameworks.
            </p>
            <div className="hero-cta center">
              <a className="btn btn-primary" href="#our-work">
                Check out our work <span aria-hidden="true">↓</span>
              </a>
              <Link className="btn btn-ghost" href="/publications">Explore publications <span aria-hidden="true">→</span></Link>
            </div>
            <p className="hero-note">Research for safer, more accountable AI systems</p>
          </div>
        </section>

        <section className="work-section reveal delay-1" id="our-work" aria-labelledby="work-title">
          <div className="work-heading">
            <p className="eyebrow">Research and experimentation</p>
            <h2 id="work-title">Check out our work</h2>
            <p>Explore the research and experimental projects developed across Zymore.</p>
          </div>
          <div className="work-grid">
            <a className="work-card work-card-research" href="https://research.zymore.tech" target="_blank" rel="noreferrer">
              <span className="work-card-index">01 / Research</span>
              <span className="work-card-mark" aria-hidden="true">R</span>
              <span className="work-card-title">Zymore Research</span>
              <span className="work-card-description">Research papers and writing on AI safety, governance, and emerging technology.</span>
              <span className="work-card-link">Visit research.zymore.tech <span aria-hidden="true">↗</span></span>
            </a>
            <a className="work-card work-card-labs" href="https://labs.zymore.tech" target="_blank" rel="noreferrer">
              <span className="work-card-index">02 / Experiments</span>
              <span className="work-card-mark" aria-hidden="true">L</span>
              <span className="work-card-title">Zymore Labs</span>
              <span className="work-card-description">Experimental projects in AI safety, red teaming, and applied systems.</span>
              <span className="work-card-link">Visit labs.zymore.tech <span aria-hidden="true">↗</span></span>
            </a>
          </div>
        </section>

        <FeaturedArticles articles={articles} />

        <section className="home-resources reveal delay-2" aria-label="Explore more from Zymore">
          <Link className="home-resource-link" href="/publications">
            <span><span className="meta">Research archive</span><strong>Publications</strong></span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link className="home-resource-link" href="/technical-capabilities">
            <span><span className="meta">Methods and infrastructure</span><strong>Technical capabilities</strong></span>
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
