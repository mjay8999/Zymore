import Link from "next/link";
import Image from "next/image";

type SiteHeaderProps = {
  active: "home" | "about" | "blog" | "none";
};

export default function SiteHeader({ active }: SiteHeaderProps) {
  return (
    <header className="site-header reveal">
      <nav className="nav nav-left" aria-label="Primary">
        <Link href="/" data-active={active === "home"}>
          Home
        </Link>
        <Link href="/about" data-active={active === "about"}>
          About Us
        </Link>
        <Link href="/blog" data-active={active === "blog"}>
          Blog
        </Link>
      </nav>

      <Link className="brand" href="/" aria-label="Zymore home">
        <Image src="/zymore-mark.png" alt="" width={38} height={28} priority />
        <span>ZYMORE</span>
      </Link>

      <div className="nav-right">
        <Link className="utility-pill" href="/contact">
          Let&apos;s talk <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </header>
  );
}
