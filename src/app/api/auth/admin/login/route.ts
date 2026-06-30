import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/auth/admin/login
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

  const admin = await db.admin.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, role: true, password: true },
  });

  if (!admin || !admin.password) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  if (!auth.verifyPassword(password, admin.password)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const res = NextResponse.json({
    success: true,
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
  });
  res.headers.set("Set-Cookie", auth.setAdminSessionCookie(admin.id));
  return res;
}
