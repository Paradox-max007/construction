// Lightweight auth utilities for BuildCraft providers.
// Uses Node's built-in crypto — no external dependencies.
// Passwords are hashed with scryptSync + salt; session tokens are HMAC-signed.

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SECRET = process.env.AUTH_SECRET || "buildcraft-dev-secret-change-in-production";
const COOKIE_NAME = "bc_session";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// ---- Password hashing --------------------------------------------------

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuf = Buffer.from(hash, "hex");
  const testBuf = scryptSync(password, salt, 64);
  if (hashBuf.length !== testBuf.length) return false;
  return timingSafeEqual(hashBuf, testBuf);
}

// ---- Session tokens ----------------------------------------------------
// Token format: base64url(payloadJson).hmacSignature
// Payload: { slug, iat }

function signToken(payload: Record<string, unknown>): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verifyToken(token: string | undefined | null): { slug: string; iat: number } | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expectedSig = createHmac("sha256", SECRET).update(body).digest("base64url");
  // timing-safe compare
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as { slug?: string; iat?: number };
    if (!payload.slug || !payload.iat) return null;
    // check expiry
    const age = Math.floor(Date.now() / 1000) - payload.iat;
    if (age > TOKEN_MAX_AGE) return null;
    return { slug: payload.slug, iat: payload.iat };
  } catch {
    return null;
  }
}

// ---- Cookie helpers (for API routes) -----------------------------------

function serializeCookie(name: string, value: string, maxAge: number): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

function clearCookie(name: string): string {
  return `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
}

// ---- Public API --------------------------------------------------------

export const auth = {
  COOKIE_NAME,
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  setSessionCookie(slug: string): string {
    const token = signToken({ slug, iat: Math.floor(Date.now() / 1000) });
    return serializeCookie(COOKIE_NAME, token, TOKEN_MAX_AGE);
  },
  clearSessionCookie(): string {
    return clearCookie(COOKIE_NAME);
  },
};

// ---- Route helper: get current provider slug from request cookies ------

import { NextRequest } from "next/server";

export function getCurrentSlug(request: NextRequest): string | null {
  const token = request.cookies.get(auth.COOKIE_NAME)?.value;
  const payload = auth.verifyToken(token);
  return payload?.slug ?? null;
}
