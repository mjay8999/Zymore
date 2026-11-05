import Link from "next/link";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";

export const metadata = {
  title: "About Us",
  description: "Learn why Zymore exists and meet the founder behind the studio.",
};

export default function AboutPage() {
  return (
    <div className="site-shell">
      <SiteHeader active="about" />
      <main className="about-page">
        <section className="about-hero reveal">
          <p className="eyebrow">About Zymore</p>
          <h1>Good technology should make work feel more human.</h1>
          <p className="lead">
            Zymore is an AI automation and workflow studio helping B2B teams move past fragile manual processes
            with thoughtful, dependable systems.
          </p>
        </section>

        <section className="about-story reveal delay-1">
          <p className="meta">How Zymore began</p>
          <div>
            <h2>Built from a desire to do better work.</h2>
            <p>
              Zymore was founded by Jay Mehta after he saw how much potential AI automation had to improve
              everyday work. Jay graduated with a Bachelor of Computer Applications in 2025 and began his career
              as an AI automation and workflow developer.
            </p>
            <p>
              During a nine-month internship, he saw projects where the technical depth and care were not matching
              what clients were paying for. He also felt his own skills could be put to better use. That experience
              gave him a clear reason to start Zymore: build practical systems with more thought, stronger execution,
              and real value for the people using them.
            </p>
            <p>
              Today, Zymore is a focused five-person team. We work closely across each project, taking time to
              understand the workflow before we automate it and keeping people in control as the system grows.
            </p>
          </div>
        </section>

        <section className="about-founder reveal delay-2">
          <div>
            <p className="meta">The person behind the work</p>
            <h2>Meet Jay Mehta</h2>
            <p>
              Learn more about Jay&apos;s path into automation and the experience that led him to start Zymore.
            </p>
            <Link className="about-founder-link" href="/founder">
              Read the founder story <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          <div className="about-founder-mark" aria-hidden="true">
            <span>Z</span>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
