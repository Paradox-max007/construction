import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/auth/login
// Body: { email, password }
// Sets an httpOnly session cookie and returns the provider's slug + name.
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const provider = await db.provider.findFirst({
    where: { email: { equals: email } },
    select: { id: true, slug: true, companyName: true, password: true, email: true },
  });

  // Generic error to avoid leaking which field is wrong
  if (!provider || !provider.password) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  if (!auth.verifyPassword(password, provider.password)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const res = NextResponse.json({
    success: true,
    provider: { slug: provider.slug, companyName: provider.companyName, email: provider.email },
  });
  res.headers.set("Set-Cookie", auth.setSessionCookie(provider.slug));
  return res;
}
