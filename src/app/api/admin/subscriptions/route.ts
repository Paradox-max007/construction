import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentAdminId } from "@/lib/auth";

// GET /api/admin/subscriptions — all subscriptions (immutable log).
export async function GET(request: NextRequest) {
  const adminId = getCurrentAdminId(request);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscriptions = await db.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      provider: { select: { id: true, companyName: true, slug: true } },
      offerUsage: { select: { id: true, code: true, discountAmount: true } },
    },
  });

  return NextResponse.json({
    subscriptions: subscriptions.map((s) => ({
      ...s,
      startDate: s.startDate.toISOString(),
      endDate: s.endDate.toISOString(),
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
  });
}
