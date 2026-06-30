import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentCustomerId } from "@/lib/auth";

// GET /api/auth/customer/me — returns the authenticated customer with their
// submitted quote requests. 401 if not logged in.
export async function GET(request: NextRequest) {
  const customerId = getCurrentCustomerId(request);
  if (!customerId) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const customer = await db.customer.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      googleId: true,
      createdAt: true,
      updatedAt: true,
      quotes: {
        orderBy: { createdAt: "desc" },
        include: {
          provider: { select: { id: true, companyName: true, slug: true } },
        },
      },
    },
  });

  if (!customer) {
    const res = NextResponse.json({ authenticated: false }, { status: 401 });
    res.headers.set("Set-Cookie", "bc_customer=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
    return res;
  }

  return NextResponse.json({ authenticated: true, customer });
}
