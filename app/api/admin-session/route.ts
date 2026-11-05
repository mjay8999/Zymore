import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSession,
  matchesAdminSecret,
} from "@/lib/admin-session";
import { readLimitedJson } from "@/lib/read-limited-json";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  }

  const parsed = await readLimitedJson(request, 2_000);
  if (!parsed.ok) {
    const status = parsed.reason === "too-large" ? 413 : 400;
    return NextResponse.json({ message: "Enter the admin key and try again." }, { status });
  }

  const secret = process.env.ZYMORE_ADMIN_KEY;
  if (!secret) {
    return NextResponse.json({ message: "Admin access is not configured." }, { status: 503 });
  }

  const accessKey =
    parsed.value && typeof parsed.value === "object" && "accessKey" in parsed.value && typeof parsed.value.accessKey === "string"
      ? parsed.value.accessKey
      : "";

  if (!accessKey || accessKey.length > 512 || !matchesAdminSecret(accessKey, secret)) {
    return NextResponse.json({ message: "The admin key is incorrect." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, createAdminSession(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });

  return NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}
