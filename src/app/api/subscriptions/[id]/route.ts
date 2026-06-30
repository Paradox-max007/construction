import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentSlug, getCurrentAdminId } from "@/lib/auth";

// GET /api/subscriptions/[id] — single subscription.
// Read-only — no PATCH or DELETE (immutable log). Provider can read their own;
// admin can read any.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const slug = getCurrentSlug(request);
  const adminId = getCurrentAdminId(request);
  if (!slug && !adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await db.subscription.findUnique({
    where: { id },
    include: {
      provider: { select: { id: true, companyName: true, slug: true } },
      offerUsage: { select: { id: true, code: true, discountAmount: true } },
    },
  });

  if (!subscription) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  }

  // If a provider is requesting (not admin), enforce ownership.
  if (!adminId && slug !== subscription.provider.slug) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    subscription: {
      ...subscription,
      startDate: subscription.startDate.toISOString(),
      endDate: subscription.endDate.toISOString(),
      createdAt: subscription.createdAt.toISOString(),
      updatedAt: subscription.updatedAt.toISOString(),
    },
  });
}
