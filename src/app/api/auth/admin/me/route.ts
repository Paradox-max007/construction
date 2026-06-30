import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentAdminId } from "@/lib/auth";

// GET /api/auth/admin/me — returns the authenticated admin.
export async function GET(request: NextRequest) {
  const adminId = getCurrentAdminId(request);
  if (!adminId) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const admin = await db.admin.findUnique({
    where: { id: adminId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  if (!admin) {
    const res = NextResponse.json({ authenticated: false }, { status: 401 });
    res.headers.set("Set-Cookie", "bc_admin=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
    return res;
  }

  return NextResponse.json({ authenticated: true, admin });
}
