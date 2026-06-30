import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/auth/customer/login
// Body: { email, password }
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

  const customer = await db.customer.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, phone: true, avatar: true, password: true },
  });

  if (!customer || !customer.password) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  if (!auth.verifyPassword(password, customer.password)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const res = NextResponse.json({
    success: true,
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      avatar: customer.avatar,
    },
  });
  res.headers.set("Set-Cookie", auth.setCustomerSessionCookie(customer.id));
  return res;
}
