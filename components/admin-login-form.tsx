"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus("");

    const form = event.currentTarget;
    const accessKey = String(new FormData(form).get("accessKey") ?? "");

    try {
      const response = await fetch("/api/admin-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessKey }),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        setStatus(result.message || "Admin sign-in failed.");
        setSubmitting(false);
        return;
      }

      router.push("/control-panel-zymore");
    } catch {
      setStatus("Could not sign in. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form className="admin-login-form" onSubmit={handleSubmit}>
      <label>
        Admin key
        <input name="accessKey" type="password" autoComplete="current-password" maxLength={512} required />
      </label>
      <button className="btn btn-primary" type="submit" disabled={submitting}>
        {submitting ? "Signing in..." : "Sign in"}
      </button>
      <p className="contact-status error" aria-live="polite" role="status">{status}</p>
    </form>
  );
}
