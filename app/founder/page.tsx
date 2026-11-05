import Link from "next/link";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";

export const metadata = {
  title: "Jay Mehta, Founder",
  description: "Meet Jay Mehta, founder of Zymore, and learn what led him to build the studio.",
};

export default function FounderPage() {
  return (
    <div className="site-shell">
      <SiteHeader active="about" />
      <main className="about-page founder-page">
        <section className="about-hero reveal">
          <p className="eyebrow">Founder, Zymore</p>
          <h1>Jay Mehta</h1>
          <p className="lead">
            An AI automation and workflow developer building a studio around careful execution and useful outcomes.
          </p>
        </section>

        <section className="about-story reveal delay-1">
          <p className="meta">The beginning</p>
          <div>
            <h2>A first-hand view of the gap between promise and delivery.</h2>
            <p>
              Jay graduated with a Bachelor of Computer Applications in 2025 and began his career as an AI
              automation and workflow developer. His nine-month internship brought him close to the details of
              building and delivering automation for clients.
            </p>
            <p>
              He saw how projects could fall short of their potential when they lacked technical depth or careful
              execution. Clients were investing in solutions that could have served them better, and Jay knew he
              had more to contribute. Rather than accept that as the standard, he decided to build something of
              his own.
            </p>
            <p>
              That decision became Zymore: a studio focused on understanding the work first, building with care,
              and delivering automation that makes a meaningful difference to the people who rely on it.
            </p>
          </div>
        </section>

        <section className="founder-values reveal delay-2">
          <div>
            <p className="meta">Building Zymore</p>
            <h2>Small team. Close to the work.</h2>
          </div>
          <p>
            Jay leads a focused five-person team. Staying compact helps the team work closely, keep communication
            direct, and give each project the attention it deserves.
          </p>
        </section>

        <p className="founder-back-link"><Link href="/about">&larr; Back to About Us</Link></p>
      </main>
      <SiteFooter />
    </div>
  );
}
