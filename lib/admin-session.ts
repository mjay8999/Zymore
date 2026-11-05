import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "zymore_admin_access";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 4;

function signature(secret: string, payload: string): Buffer {
  return createHmac("sha256", secret).update(payload).digest();
}

export function createAdminSession(secret: string): string {
  const nonce = randomBytes(32).toString("base64url");
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE;
  const payload = `${nonce}.${expiresAt}`;
  return `${payload}.${signature(secret, payload).toString("base64url")}`;
}

export function verifyAdminSession(token: string | undefined, secret: string | undefined): boolean {
  if (!token || !secret) return false;

  const [nonce, expiresAtValue, suppliedSignature, extra] = token.split(".");
  if (!nonce || !expiresAtValue || !suppliedSignature || extra !== undefined) return false;

  const expiresAt = Number(expiresAtValue);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now || expiresAt > now + ADMIN_SESSION_MAX_AGE + 30) {
    return false;
  }

  const payload = `${nonce}.${expiresAtValue}`;
  const expected = signature(secret, payload);
  const supplied = Buffer.from(suppliedSignature, "base64url");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export function matchesAdminSecret(input: string, secret: string): boolean {
  const inputBytes = Buffer.from(input);
  const secretBytes = Buffer.from(secret);
  return inputBytes.length === secretBytes.length && timingSafeEqual(inputBytes, secretBytes);
}
