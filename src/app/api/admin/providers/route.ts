import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentAdminId } from "@/lib/auth";

// GET /api/admin/providers — all providers (incl. unapproved), with
// subscription count + override info.
export async function GET(request: NextRequest) {
  const adminId = getCurrentAdminId(request);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providers = await db.provider.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      _count: { select: { subscriptions: true, quotes: true, reviews: true } },
      planOverrides: { select: { id: true, planType: true, customPrice: true, notes: true } },
    },
  });

  return NextResponse.json({
    providers: providers.map((p) => ({
      id: p.id,
      companyName: p.companyName,
      slug: p.slug,
      email: p.email,
      phone: p.phone,
      categoryId: p.categoryId,
      category: p.category,
      verified: p.verified,
      premium: p.premium,
      featured: p.featured,
      approved: p.approved,
      rating: p.rating,
      reviewsCount: p.reviewsCount,
      startingPrice: p.startingPrice,
      experience: p.experience,
      documentUrls: p.documentUrls ? p.documentUrls.split(",").map((s) => s.trim()).filter(Boolean) : [],
      certificates: p.certificates ? p.certificates.split(",").map((s) => s.trim()).filter(Boolean) : [],
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      subscriptionCount: p._count.subscriptions,
      quoteCount: p._count.quotes,
      reviewCount: p._count.reviews,
      planOverrides: p.planOverrides,
    })),
  });
}
