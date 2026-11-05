import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { readLimitedJson } from "@/lib/read-limited-json";

type ContactSubmission = {
  name: string;
  email: string;
  company: string;
  service: string;
  message: string;
  website: string;
};

function readField(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length <= maxLength ? trimmed : null;
}

function parseSubmission(raw: unknown): ContactSubmission | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const name = readField(data.name, 100);
  const email = readField(data.email, 254);
  const company = readField(data.company ?? "", 120);
  const service = readField(data.service ?? "", 120);
  const message = readField(data.message, 5000);
  const website = readField(data.website ?? "", 200);

  if (
    !name ||
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    company === null ||
    service === null ||
    !message ||
    message.length < 10 ||
    website === null
  ) {
    return null;
  }

  return { name, email, company, service, message, website };
}

async function saveLocalInquiry(submission: ContactSubmission) {
  const filePath = path.join(process.cwd(), "data", "contact-inquiries.json");
  let records: Array<ContactSubmission & { submittedAt: string }> = [];

  try {
    records = JSON.parse(await readFile(filePath, "utf8")) as typeof records;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  records.push({
    name: submission.name,
    email: submission.email,
    company: submission.company,
    service: submission.service,
    message: submission.message,
    website: "",
    submittedAt: new Date().toISOString(),
  });
  await writeFile(filePath, JSON.stringify(records, null, 2), "utf8");
}

export async function POST(request: Request) {
  const parsed = await readLimitedJson(request, 16_000);
  if (!parsed.ok) {
    const status = parsed.reason === "too-large" ? 413 : 400;
    return Response.json({ message: "Please check the form and submit it again." }, { status });
  }

  const submission = parseSubmission(parsed.value);
  if (!submission) {
    return Response.json({ message: "Please check the required fields and try again." }, { status: 400 });
  }

  // Silently discard likely bot submissions caught by the honeypot field.
  if (submission.website) {
    return Response.json({ message: "Thanks. Your message is with our team." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL || "support@zymore.tech";

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "production") {
      return Response.json(
        { message: "The contact form is not configured yet. Please email support@zymore.tech directly." },
        { status: 503 },
      );
    }

    try {
      await saveLocalInquiry(submission);
      return Response.json({ message: "Message saved locally. Email delivery still needs to be configured." });
    } catch {
      return Response.json({ message: "We couldn't save your message. Please email support@zymore.tech." }, { status: 500 });
    }
  }

  const text = [
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    `Company: ${submission.company || "Not provided"}`,
    `Area: ${submission.service || "Not specified"}`,
    "",
    "Project details:",
    submission.message,
  ].join("\n");

  try {
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: submission.email,
        subject: `New project enquiry from ${submission.name.replace(/[\r\n]/g, " ")}`,
        text,
      }),
    });

    if (!emailResponse.ok) {
      return Response.json({ message: "We couldn't send your message right now. Please try again or email us directly." }, { status: 502 });
    }

    return Response.json({ message: "Thanks. Your message has been sent to our team." });
  } catch {
    return Response.json({ message: "We couldn't send your message right now. Please try again or email us directly." }, { status: 502 });
  }
}
