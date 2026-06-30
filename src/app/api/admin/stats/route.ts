import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentAdminId } from "@/lib/auth";

// GET /api/admin/stats — platform stats for the admin dashboard.
export async function GET(request: NextRequest) {
  const adminId = getCurrentAdminId(request);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const [
    providers,
    approvedProviders,
    pendingApprovals,
    pendingVerifications,
    customers,
    quotes,
    newQuotes,
    activeSubscriptions,
    totalRevenue,
    offers,
    activeOffers,
    plans,
  ] = await Promise.all([
    db.provider.count(),
    db.provider.count({ where: { approved: true } }),
    db.provider.count({ where: { approved: false } }),
    db.provider.count({ where: { verified: false, approved: true } }),
    db.customer.count(),
    db.quoteRequest.count(),
    db.quoteRequest.count({ where: { status: "new" } }),
    db.subscription.count({ where: { status: "active", endDate: { gt: now } } }),
    db.subscription.aggregate({
      where: { status: { in: ["active", "expired"] } },
      _sum: { amount: true },
    }),
    db.offer.count(),
    db.offer.count({ where: { active: true } }),
    db.planConfig.count(),
  ]);

  // Active featured / premium providers (subscriptions still in effect).
  const featuredProviders = await db.provider.count({ where: { featured: true } });
  const premiumProviders = await db.provider.count({ where: { premium: true } });

  return NextResponse.json({
    stats: {
      providers,
      approvedProviders,
      pendingApprovals,
      pendingVerifications,
      customers,
      quotes,
      newQuotes,
      activeSubscriptions,
      totalRevenue: totalRevenue._sum.amount ?? 0,
      offers,
      activeOffers,
      plans,
      featuredProviders,
      premiumProviders,
    },
  });
}
