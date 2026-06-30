import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentAdminId } from "@/lib/auth";

// GET /api/admin/revenue?period=day|month|year&from=&to=
// Revenue report — groups active/expired/cancelled subscriptions by period.
export async function GET(request: NextRequest) {
  const adminId = getCurrentAdminId(request);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "month"; // day | month | year
  const fromRaw = searchParams.get("from");
  const toRaw = searchParams.get("to");

  const where: { createdAt?: { gte?: Date; lte?: Date } } = {};
  if (fromRaw) {
    const d = new Date(fromRaw);
    if (!Number.isNaN(d.getTime())) where.createdAt = { ...(where.createdAt || {}), gte: d };
  }
  if (toRaw) {
    const d = new Date(toRaw);
    if (!Number.isNaN(d.getTime())) where.createdAt = { ...(where.createdAt || {}), lte: d };
  }

  // Pull all relevant subscriptions.
  const subscriptions = await db.subscription.findMany({
    where,
    orderBy: { createdAt: "asc" },
    include: {
      provider: { select: { id: true, companyName: true, slug: true } },
    },
  });

  // Group by period key (YYYY-MM-DD / YYYY-MM / YYYY).
  const buckets = new Map<string, { count: number; amount: number; discount: number }>();
  let totalAmount = 0;
  let totalDiscount = 0;
  for (const s of subscriptions) {
    const d = new Date(s.createdAt);
    let key: string;
    if (period === "day") {
      key = d.toISOString().slice(0, 10);
    } else if (period === "year") {
      key = String(d.getUTCFullYear());
    } else {
      key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    }
    const b = buckets.get(key) ?? { count: 0, amount: 0, discount: 0 };
    b.count += 1;
    b.amount += s.amount;
    b.discount += s.offerDiscount;
    buckets.set(key, b);
    totalAmount += s.amount;
    totalDiscount += s.offerDiscount;
  }

  const breakdown = Array.from(buckets.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, v]) => ({ period: key, count: v.count, amount: v.amount, discount: v.discount }));

  // Breakdown by status & featureType.
  const byStatus = new Map<string, { count: number; amount: number }>();
  const byFeature = new Map<string, { count: number; amount: number }>();
  for (const s of subscriptions) {
    const st = byStatus.get(s.status) ?? { count: 0, amount: 0 };
    st.count += 1; st.amount += s.amount;
    byStatus.set(s.status, st);
    const ft = byFeature.get(s.featureType) ?? { count: 0, amount: 0 };
    ft.count += 1; ft.amount += s.amount;
    byFeature.set(s.featureType, ft);
  }

  return NextResponse.json({
    period,
    totalSubscriptions: subscriptions.length,
    totalAmount,
    totalDiscount,
    breakdown,
    byStatus: Array.from(byStatus.entries()).map(([k, v]) => ({ status: k, ...v })),
    byFeature: Array.from(byFeature.entries()).map(([k, v]) => ({ feature: k, ...v })),
  });
}
