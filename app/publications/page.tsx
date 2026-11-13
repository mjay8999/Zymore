import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";

export const metadata = {
  title: "Publications",
  description: "Papers and publications from Zymore Research.",
};

const publications = [
  {
    title: "Outsourced Executive Function: Cognitive Offloading, Generative AI Dependence, and the Developing Adolescent Mind.",
    author: "Jay Mehta",
    orcid: "0009-0008-0375-0268",
    doi: "10.5281/zenodo.24000466",
    topics: ["Generative AI", "Cognitive offloading", "Adolescent development"],
  },
];

export default function PublicationsPage() {
  return (
    <div className="site-shell">
      <SiteHeader active="publications" />
      <main className="editorial-page">
        <header className="editorial-page-heading reveal">
          <p className="eyebrow">Zymore Research · Archive</p>
          <h1>Publications</h1>
          <p className="lead">Research and writing on the human, technical, and institutional dimensions of AI.</p>
        </header>
        <section className="publication-list reveal delay-1" aria-label="Published research papers">
          {publications.map((publication, index) => (
            <article className="publication-card" key={publication.doi}>
              <div className="publication-mark" aria-hidden="true"><span>{String(index + 1).padStart(2, "0")}</span></div>
              <div className="publication-copy">
                <p className="meta">Research paper · {publication.topics.join(" · ")}</p>
                <h2>{publication.title}</h2>
                <div className="publication-byline">
                  <span>{publication.author}</span>
                  <a href={`https://orcid.org/${publication.orcid}`} target="_blank" rel="noreferrer">ORCID {publication.orcid}</a>
                </div>
              </div>
              <a className="publication-link" href={`https://doi.org/${publication.doi}`} target="_blank" rel="noreferrer">
                Read on Zenodo <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
