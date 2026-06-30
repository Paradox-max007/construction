import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentAdminId } from "@/lib/auth";

// POST /api/admin/expire — auto-expires any subscription past its endDate.
// Returns the count of newly-expired subscriptions. Idempotent.
export async function POST(request: NextRequest) {
  const adminId = getCurrentAdminId(request);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find active subscriptions whose endDate has passed.
  const expired = await db.subscription.findMany({
    where: { status: "active", endDate: { lte: now } },
    select: { id: true, providerId: true, featureType: true },
  });

  if (expired.length === 0) {
    return NextResponse.json({ success: true, expiredCount: 0 });
  }

  // Mark them expired in a single transaction.
  await db.$transaction(async (tx) => {
    await tx.subscription.updateMany({
      where: { id: { in: expired.map((s) => s.id) } },
      data: { status: "expired" },
    });

    // For each provider: if they have no other active subscription that grants
    // the same feature, remove that feature flag.
    for (const s of expired) {
      const stillActive = await tx.subscription.findFirst({
        where: {
          providerId: s.providerId,
          status: "active",
          endDate: { gt: now },
          featureType: s.featureType === "both" ? undefined : { in: [s.featureType, "both"] },
        },
        select: { id: true },
      });
      // Special-case "both" → check both featured and premium.
      if (s.featureType === "both") {
        const activeFeatured = await tx.subscription.findFirst({
          where: {
            providerId: s.providerId,
            status: "active",
            endDate: { gt: now },
            featureType: { in: ["featured", "both"] },
          },
          select: { id: true },
        });
        const activePremium = await tx.subscription.findFirst({
          where: {
            providerId: s.providerId,
            status: "active",
            endDate: { gt: now },
            featureType: { in: ["premium", "both"] },
          },
          select: { id: true },
        });
        const update: { featured?: boolean; premium?: boolean } = {};
        if (!activeFeatured) update.featured = false;
        if (!activePremium) update.premium = false;
        if (Object.keys(update).length > 0) {
          await tx.provider.update({ where: { id: s.providerId }, data: update });
        }
      } else if (!stillActive) {
        await tx.provider.update({
          where: { id: s.providerId },
          data: s.featureType === "featured" ? { featured: false } : { premium: false },
        });
      }
    }
  });

  return NextResponse.json({ success: true, expiredCount: expired.length });
}
