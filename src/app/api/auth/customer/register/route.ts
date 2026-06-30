import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/auth/customer/register
// Body: { name, email, password, phone? }
// Creates a customer account and sets the bc_customer session cookie.
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  // Email uniqueness check.
  const existing = await db.customer.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const customer = await db.customer.create({
    data: {
      name,
      email,
      phone: phone || null,
      password: auth.hashPassword(password),
    },
    select: { id: true, name: true, email: true, phone: true, avatar: true, googleId: true, createdAt: true },
  });

  const res = NextResponse.json(
    { success: true, customer },
    { status: 201 },
  );
  res.headers.set("Set-Cookie", auth.setCustomerSessionCookie(customer.id));
  return res;
}
