import { issueSignedToken } from "@vercel/blob";
import { handleUploadPresigned, type HandleUploadPresignedBody } from "@vercel/blob/client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-session";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

function hasBlobConnection(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      (process.env.BLOB_STORE_ID &&
        (process.env.VERCEL === "1" || process.env.VERCEL_OIDC_TOKEN)),
  );
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  }

  const secret = process.env.ZYMORE_ADMIN_KEY;
  const cookieStore = await cookies();
  if (!verifyAdminSession(cookieStore.get(ADMIN_COOKIE)?.value, secret)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!hasBlobConnection()) {
    return NextResponse.json({ message: "Connect Vercel Blob before uploading images." }, { status: 503 });
  }

  try {
    const body = (await request.json()) as HandleUploadPresignedBody;
    const result = await handleUploadPresigned({
      body,
      request,
      getSignedToken: async (pathname) => {
        if (!/^articles\/[a-zA-Z0-9._-]{1,150}$/.test(pathname)) {
          throw new Error("Invalid image path.");
        }
        const token = await issueSignedToken({
          pathname,
          operations: ["put"],
          allowedContentTypes: ALLOWED_IMAGE_TYPES,
          maximumSizeInBytes: MAX_IMAGE_SIZE,
          validUntil: Date.now() + 15 * 60 * 1000,
        });

        return {
          token,
          urlOptions: {
            allowedContentTypes: ALLOWED_IMAGE_TYPES,
            maximumSizeInBytes: MAX_IMAGE_SIZE,
          },
        };
      },
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ message: "Image upload could not be authorized." }, { status: 400 });
  }
}
