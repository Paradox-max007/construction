// Lightweight auth utilities for BuildCraft providers, customers, and admins.
// Uses Node's built-in crypto — no external dependencies.
// Passwords are hashed with scryptSync + salt; session tokens are HMAC-signed.

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";

const SECRET = process.env.AUTH_SECRET || "buildcraft-dev-secret-change-in-production";

// Cookie names for each session type
export const PROVIDER_COOKIE_NAME = "bc_session";
export const CUSTOMER_COOKIE_NAME = "bc_customer";
export const ADMIN_COOKIE_NAME = "bc_admin";

// Back-compat alias
const COOKIE_NAME = PROVIDER_COOKIE_NAME;
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
// Payload shape varies by session type:
//   provider  → { slug, iat }
//   customer  → { cid, iat }
//   admin     → { aid, iat }

function signToken(payload: Record<string, unknown>): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

type TokenPayload =
  | { slug: string; iat: number }
  | { cid: string; iat: number }
  | { aid: string; iat: number }
  | null;

function verifyToken(token: string | undefined | null): TokenPayload {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expectedSig = createHmac("sha256", SECRET).update(body).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as Record<string, unknown>;
    const iat = Number(payload.iat);
    if (!iat || Number.isNaN(iat)) return null;
    const age = Math.floor(Date.now() / 1000) - iat;
    if (age > TOKEN_MAX_AGE) return null;
    if (typeof payload.slug === "string") return { slug: payload.slug, iat };
    if (typeof payload.cid === "string") return { cid: payload.cid, iat };
    if (typeof payload.aid === "string") return { aid: payload.aid, iat };
    return null;
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
  // Provider session
  setSessionCookie(slug: string): string {
    const token = signToken({ slug, iat: Math.floor(Date.now() / 1000) });
    return serializeCookie(COOKIE_NAME, token, TOKEN_MAX_AGE);
  },
  clearSessionCookie(): string {
    return clearCookie(COOKIE_NAME);
  },
  // Customer session
  setCustomerSessionCookie(customerId: string): string {
    const token = signToken({ cid: customerId, iat: Math.floor(Date.now() / 1000) });
    return serializeCookie(CUSTOMER_COOKIE_NAME, token, TOKEN_MAX_AGE);
  },
  clearCustomerSessionCookie(): string {
    return clearCookie(CUSTOMER_COOKIE_NAME);
  },
  // Admin session
  setAdminSessionCookie(adminId: string): string {
    const token = signToken({ aid: adminId, iat: Math.floor(Date.now() / 1000) });
    return serializeCookie(ADMIN_COOKIE_NAME, token, TOKEN_MAX_AGE);
  },
  clearAdminSessionCookie(): string {
    return clearCookie(ADMIN_COOKIE_NAME);
  },
};

// ---- Route helpers: get current authenticated entity from cookies -------

/** Returns the provider's slug from the bc_session cookie (or null). */
export function getCurrentSlug(request: NextRequest): string | null {
  const token = request.cookies.get(auth.COOKIE_NAME)?.value;
  const payload = auth.verifyToken(token);
  if (payload && "slug" in payload) return payload.slug;
  return null;
}

/** Returns the customer's id from the bc_customer cookie (or null). */
export function getCurrentCustomerId(request: NextRequest): string | null {
  const token = request.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
  const payload = auth.verifyToken(token);
  if (payload && "cid" in payload) return payload.cid;
  return null;
}

/** Returns the admin's id from the bc_admin cookie (or null). */
export function getCurrentAdminId(request: NextRequest): string | null {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const payload = auth.verifyToken(token);
  if (payload && "aid" in payload) return payload.aid;
  return null;
}
