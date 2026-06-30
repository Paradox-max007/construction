import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// POST /api/auth/admin/logout — clears the admin session cookie.
export async function POST() {
  const res = NextResponse.json({ success: true });
  res.headers.set("Set-Cookie", auth.clearAdminSessionCookie());
  return res;
}
