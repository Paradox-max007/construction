import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

type GoogleTokenInfo = {
  email?: string;
  email_verified?: string;
  name?: string;
  picture?: string;
  sub?: string;
};

// POST /api/auth/customer/google
// Body: { credential } — Google ID token (from Google Sign-In button)
// Verifies via Google's tokeninfo endpoint, creates or logs in the customer.
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const credential = typeof body.credential === "string" ? body.credential.trim() : "";
  if (!credential) {
    return NextResponse.json({ error: "Google credential is required" }, { status: 400 });
  }

  // Verify the ID token via Google's tokeninfo endpoint.
  // (Acceptable for dev/low-volume; for high-volume use google-auth-library.)
  let info: GoogleTokenInfo;
  try {
    const r = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
      { method: "GET" },
    );
    if (!r.ok) {
      return NextResponse.json({ error: "Invalid Google credential" }, { status: 401 });
    }
    info = (await r.json()) as GoogleTokenInfo;
  } catch {
    return NextResponse.json({ error: "Failed to verify Google credential" }, { status: 502 });
  }

  if (!info.email || info.email_verified !== "true") {
    return NextResponse.json({ error: "Google account email not verified" }, { status: 400 });
  }

  const email = info.email.toLowerCase();
  const googleId = info.sub ?? null;
  const name = info.name || email.split("@")[0]!;
  const avatar = info.picture ?? null;

  // Find existing customer by email first.
  let customer = await db.customer.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, phone: true, avatar: true, googleId: true },
  });

  if (!customer) {
    // Create a new customer with the Google identity (no password — they
    // log in via Google).
    customer = await db.customer.create({
      data: {
        name,
        email,
        googleId: googleId ?? undefined,
        avatar,
      },
      select: { id: true, name: true, email: true, phone: true, avatar: true, googleId: true },
    });
  } else if (!customer.googleId && googleId) {
    // Link Google ID to an existing email-based account.
    customer = await db.customer.update({
      where: { id: customer.id },
      data: { googleId, avatar: avatar ?? customer.avatar },
      select: { id: true, name: true, email: true, phone: true, avatar: true, googleId: true },
    });
  }

  const res = NextResponse.json({
    success: true,
    customer: {
      id: customer!.id,
      name: customer!.name,
      email: customer!.email,
      phone: customer!.phone,
      avatar: customer!.avatar,
    },
  });
  res.headers.set("Set-Cookie", auth.setCustomerSessionCookie(customer!.id));
  return res;
}
