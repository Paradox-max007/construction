import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentAdminId } from "@/lib/auth";

// GET /api/admin/customers — all customers (newest first).
export async function GET(request: NextRequest) {
  const adminId = getCurrentAdminId(request);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customers = await db.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { quotes: true, reviews: true } },
    },
  });

  return NextResponse.json({
    customers: customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      avatar: c.avatar,
      googleId: c.googleId,
      hasPassword: Boolean(c.password),
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      quoteCount: c._count.quotes,
      reviewCount: c._count.reviews,
    })),
  });
}
