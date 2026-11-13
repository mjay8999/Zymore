import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";

export const metadata = {
  title: "Technical Capabilities",
  description: "Languages, infrastructure, orchestration, and content storage supporting Zymore's research and engineering work.",
};

const capabilityGroups = [
  {
    number: "01",
    title: "Machine learning and model adaptation",
    description: "Selecting and evaluating models against defined tasks, then adapting them with supervised and parameter-efficient fine-tuning where it improves measured performance.",
    items: ["Model evaluation", "Supervised fine-tuning", "LoRA / QLoRA", "PEFT", "Hugging Face Transformers", "Hugging Face Datasets", "TRL"],
  },
  {
    number: "02",
    title: "Computer vision",
    description: "Developing image and document understanding workflows, with model choice and evaluation matched to the actual data and operating environment.",
    items: ["Image classification", "Object detection", "OCR pipelines", "Vision-language models", "Hugging Face vision models"],
  },
  {
    number: "03",
    title: "Local LLMs and private inference",
    description: "Running open models on controlled infrastructure, measuring latency and quality, and using quantization when it fits the hardware and accuracy requirements.",
    items: ["Whisper large-v3", "CTranslate2", "Llama 3 8B Instruct", "AWQ quantization", "Local model hosting", "Inference APIs"],
  },
  {
    number: "04",
    title: "Workflow and agent orchestration",
    description: "Connecting services and coordinating multi-step workflows for LLM evaluation and applied research.",
    items: ["n8n", "Custom APIs", "Multi-agent workflows", "LLM evaluation pipelines"],
  },
  {
    number: "05",
    title: "Languages and application development",
    description: "Building web applications, research tools, and API integrations for dependable AI systems.",
    items: ["TypeScript", "JavaScript", "Python", "HTML", "CSS", "React", "Next.js", "Node.js"],
  },
  {
    number: "06",
    title: "Containers and deployment infrastructure",
    description: "Creating isolated, repeatable environments for running services, evaluations, and experiments.",
    items: ["Docker", "Kubernetes", "Vercel", "CI/CD"],
  },
];

export default function TechnicalCapabilitiesPage() {
  return (
    <div className="site-shell">
      <SiteHeader active="capabilities" />
      <main className="editorial-page capabilities-page">
        <header className="editorial-page-heading reveal">
          <p className="eyebrow">Methods · Infrastructure · Engineering</p>
          <h1>Technical Capabilities</h1>
          <p className="lead">
            Building scalable backend orchestration for LLM evaluation, deploying containerized evaluation
            environments, and developing custom API pipelines.
          </p>
        </header>

        <section className="capability-groups reveal delay-1" aria-label="Technical stack and capabilities">
          {capabilityGroups.map((group) => (
            <article className="capability-group" key={group.number}>
              <span className="capability-number">{group.number}</span>
              <div className="capability-group-copy">
                <h2>{group.title}</h2>
                <p>{group.description}</p>
              </div>
              <ul className="capability-tags">
                {group.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          ))}
        </section>

        <section className="hospital-case reveal delay-2" aria-labelledby="hospital-case-title">
          <div className="hospital-case-heading">
            <p className="eyebrow">Deployment case study · Client anonymized</p>
            <h2 id="hospital-case-title">Clinical documentation, running at the edge.</h2>
            <p>
              Zymore designed, built, tested, and implemented an on-premise AI documentation and hospital management system
              for a private hospital in Akola, Maharashtra. Local speech and language models support the workflow without
              depending on a cloud inference service.
            </p>
            <div className="hospital-case-metrics" aria-label="Reported deployment results">
              <div><strong>85% → 99.9%</strong><span>Previous vs reported local uptime</span></div>
              <div><strong>Under 1 sec</strong><span>Reported local document generation</span></div>
              <div><strong>4 months</strong><span>Live in production as reported</span></div>
            </div>
            <p className="hospital-case-note">Operational figures supplied by the project team; not clinical outcome or diagnostic accuracy measures.</p>
          </div>
          <a className="hospital-case-link" href="https://research.zymore.tech/projects/hospital-edge-ai" target="_blank" rel="noreferrer">
            <span>Read the full case study on Zymore Research</span><span aria-hidden="true">↗</span>
          </a>
        </section>

        <section className="storage-note reveal delay-2" aria-labelledby="storage-title">
          <div>
            <p className="eyebrow">Content storage</p>
            <h2 id="storage-title">Storage selected for the job.</h2>
          </div>
          <div className="storage-note-copy">
            <p><strong>Vercel Blob</strong> stores published blog content and uploaded media for the Zymore website. During local development, the site can read its article data from a JSON file.</p>
            <p>This site currently uses object storage for content and media; it does not use a relational SQL database.</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
