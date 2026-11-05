import ContactForm from "@/components/contact-form";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";

export const metadata = {
  title: "Talk with Our Team",
  description: "Tell Zymore about your team, workflow, or automation challenge.",
};

export default function ContactPage() {
  return (
    <div className="site-shell">
      <SiteHeader active="none" />
      <main className="contact-page">
        <section className="contact-intro reveal">
          <p className="eyebrow">Start a conversation</p>
          <h1>Tell us what you&apos;re working on.</h1>
          <p className="lead">
            Share a little about your team and the workflow you want to improve. We&apos;ll follow up by email to
            learn more.
          </p>
          <div className="contact-direct">
            <span className="meta">Prefer email?</span>
            <a href="mailto:support@zymore.tech">support@zymore.tech</a>
          </div>
        </section>

        <section className="contact-form-wrap reveal delay-1" aria-label="Project enquiry form">
          <ContactForm />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
