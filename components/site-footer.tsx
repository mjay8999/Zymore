import Image from "next/image";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer reveal delay-3">
      <div className="footer-top">
        <div className="footer-intro">
          <Image className="footer-mark" src="/zymore-wordmark-light.png" alt="Zymore" width={150} height={72} />
          <p className="eyebrow">Independent research · Applied safety</p>
          <h2>Building the evidence and systems for safer AI.</h2>
        </div>

        <div className="footer-action">
          <p className="footer-title">Have a research question?</p>
          <Link className="footer-cta" href="/contact">
            Let&apos;s talk <span aria-hidden="true">&rarr;</span>
          </Link>
          <a className="footer-email" href="mailto:support@zymore.tech">support@zymore.tech</a>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="muted">&copy; {new Date().getFullYear()} Zymore Technologies</p>
        <nav className="footer-links" aria-label="Footer">
          <Link href="/">Home</Link>
          <Link href="/about">About Us</Link>
          <Link href="/publications">Publications</Link>
          <Link href="/technical-capabilities">Capabilities</Link>
          <Link href="/blog">Articles</Link>
          <a href="https://research.zymore.tech" target="_blank" rel="noreferrer">Research</a>
          <a href="https://labs.zymore.tech" target="_blank" rel="noreferrer">Labs</a>
        </nav>
      </div>
    </footer>
  );
}
