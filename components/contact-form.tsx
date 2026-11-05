"use client";

import { useState, type FormEvent } from "react";

type FormStatus = {
  kind: "success" | "error";
  message: string;
} | null;

export default function ContactForm() {
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<FormStatus>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setStatus(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      company: String(formData.get("company") ?? ""),
      service: String(formData.get("service") ?? ""),
      message: String(formData.get("message") ?? ""),
      website: String(formData.get("website") ?? ""),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || "We couldn't send your message. Please try again.");
      }

      form.reset();
      setStatus({ kind: "success", message: result.message || "Thanks. Your message is with our team." });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-form-row">
        <label>
          Your name <span aria-hidden="true">*</span>
          <input name="name" autoComplete="name" maxLength={100} required />
        </label>
        <label>
          Work email <span aria-hidden="true">*</span>
          <input name="email" type="email" autoComplete="email" maxLength={254} required />
        </label>
      </div>

      <div className="contact-form-row">
        <label>
          Company
          <input name="company" autoComplete="organization" maxLength={120} />
        </label>
        <label>
          What can we help with?
          <select name="service" defaultValue="">
            <option value="">Choose an area</option>
            <option value="AI workflow architecture">AI workflow architecture</option>
            <option value="Automation engineering">Automation engineering</option>
            <option value="Process optimization">Process optimization</option>
            <option value="Something else">Something else</option>
          </select>
        </label>
      </div>

      <label>
        Tell us a little about what you have in mind <span aria-hidden="true">*</span>
        <textarea name="message" rows={5} minLength={10} maxLength={5000} required />
      </label>

      <label className="contact-honeypot" aria-hidden="true">
        Leave this field empty
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>

      <div className="contact-submit-row">
        <button className="btn btn-primary" type="submit" disabled={sending}>
          {sending ? "Sending..." : "Send your message"}
          {!sending && <span aria-hidden="true">&rarr;</span>}
        </button>
        <p>We&apos;ll get back to you by email.</p>
      </div>

      <p className={`contact-status ${status?.kind ?? ""}`} aria-live="polite" role="status">
        {status?.message ?? ""}
      </p>
    </form>
  );
}
