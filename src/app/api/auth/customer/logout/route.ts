import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// POST /api/auth/customer/logout — clears the customer session cookie.
export async function POST() {
  const res = NextResponse.json({ success: true });
  res.headers.set("Set-Cookie", auth.clearCustomerSessionCookie());
  return res;
}
