import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <div className="site-shell">
        <SiteHeader active="home" />
        <main>
          <section className="home-hero reveal">
            <div className="hero-orbit" aria-hidden="true"><span /><span /><span /></div>
            <div className="hero-center">
              <p className="eyebrow">AI systems, made useful.</p>
              <h1>Make work move.</h1>
              <p className="lead">
                We design and build thoughtful AI automation for the work that matters&mdash;so your team can spend less time
                managing processes and more time moving forward.
              </p>
              <div className="hero-cta center">
                <Link className="btn btn-primary" href="/contact">
                  Talk with our team <span aria-hidden="true">&rarr;</span>
                </Link>
                <Link className="btn btn-ghost" href="/blog">
                  Explore our thinking
                </Link>
              </div>
              <p className="hero-note">A technology partner for ambitious teams</p>
            </div>
          </section>

          <section className="news-row reveal delay-1">
            <article className="news-card">
              <p className="meta">01 / Understand</p>
              <h3>Find the useful work.</h3>
              <p>We look closely at how your team works today and where better systems can make a real difference.</p>
            </article>
            <article className="news-card">
              <p className="meta">02 / Design</p>
              <h3>Make technology fit.</h3>
              <p>We shape clear, dependable workflows around your people, your tools, and your goals.</p>
            </article>
            <article className="news-card">
              <p className="meta">03 / Build</p>
              <h3>Keep people in control.</h3>
              <p>We build, refine, and support systems that earn trust as they take on more of the everyday.</p>
            </article>
          </section>

          <section className="links-showcase reveal delay-2">
            <div className="link-heading">
              <div><p className="eyebrow">The Zymore point of view</p><h2>Technology should feel like progress.</h2></div>
              <Link href="/blog">Read our insights <span aria-hidden="true">&rarr;</span></Link>
            </div>
            <div className="link-grid">
              <article className="feature-card feature-card-1">
                <span className="visual visual-1" />
                <p className="meta">Our approach</p><h4>Thoughtful by design.</h4>
                <p>Good automation starts with a clear understanding of people, not a list of tools.</p>
              </article>
              <article className="feature-card feature-card-2">
                <span className="visual visual-2" />
                <p className="meta">Our craft</p><h4>Built for real work.</h4>
                <p>We connect the systems you already use and make the handoffs feel effortless.</p>
              </article>
              <article className="feature-card feature-card-3">
                <span className="visual visual-3" />
                <p className="meta">Our standard</p><h4>Trust, built in.</h4>
                <p>Clear boundaries, thoughtful safeguards, and people in the loop where it counts.</p>
              </article>
              <article className="feature-card feature-card-4">
                <span className="visual visual-4" />
                <p className="meta">Our belief</p><h4>Better, over time.</h4>
                <p>Useful systems make room for your team to learn, adapt, and do its best work.</p>
              </article>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
