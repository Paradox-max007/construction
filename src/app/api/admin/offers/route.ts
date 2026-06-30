import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentAdminId } from "@/lib/auth";
import { sendOfferNotificationToSubscribers } from "@/lib/email";

// GET /api/admin/offers — list all offers.
export async function GET(request: NextRequest) {
  const adminId = getCurrentAdminId(request);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const offers = await db.offer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { usages: true } } },
  });

  return NextResponse.json({
    offers: offers.map((o) => ({
      ...o,
      expiresAt: o.expiresAt ? o.expiresAt.toISOString() : null,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
      usageCount: o._count.usages,
    })),
  });
}

// POST /api/admin/offers — create a new offer.
// Body: {
//   code, description?, discountType: "percent" | "fixed", discountValue,
//   maxUses?, expiresAt?, active?, notifySubscribers?
// }
export async function POST(request: NextRequest) {
  const adminId = getCurrentAdminId(request);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const description = typeof body.description === "string" ? body.description.trim() : null;
  const discountType = typeof body.discountType === "string" ? body.discountType : "percent";
  const discountValue = typeof body.discountValue === "number" ? body.discountValue : 0;
  const maxUses = typeof body.maxUses === "number" ? body.maxUses : 0;
  const expiresAtRaw = typeof body.expiresAt === "string" ? body.expiresAt : null;
  const active = typeof body.active === "boolean" ? body.active : true;
  const notifySubscribers = typeof body.notifySubscribers === "boolean" ? body.notifySubscribers : false;

  if (!code) return NextResponse.json({ error: "code is required" }, { status: 400 });
  if (!["percent", "fixed"].includes(discountType)) {
    return NextResponse.json({ error: "discountType must be 'percent' or 'fixed'" }, { status: 400 });
  }
  if (discountValue < 0) {
    return NextResponse.json({ error: "discountValue must be ≥ 0" }, { status: 400 });
  }
  if (discountType === "percent" && discountValue > 100) {
    return NextResponse.json({ error: "percent discountValue cannot exceed 100" }, { status: 400 });
  }

  const dup = await db.offer.findUnique({ where: { code }, select: { id: true } });
  if (dup) {
    return NextResponse.json({ error: "Offer code already exists" }, { status: 409 });
  }

  let expiresAt: Date | null = null;
  if (expiresAtRaw) {
    const d = new Date(expiresAtRaw);
    if (!Number.isNaN(d.getTime())) expiresAt = d;
  }

  const offer = await db.offer.create({
    data: {
      code,
      description,
      discountType,
      discountValue,
      maxUses,
      expiresAt,
      active,
      createdBy: adminId,
    },
  });

  // Optionally notify all subscribers + customers.
  let notified = 0;
  if (notifySubscribers) {
    notified = await sendOfferNotificationToSubscribers(offer);
  }

  return NextResponse.json({
    success: true,
    offer: {
      ...offer,
      expiresAt: offer.expiresAt ? offer.expiresAt.toISOString() : null,
      createdAt: offer.createdAt.toISOString(),
      updatedAt: offer.updatedAt.toISOString(),
    },
    notified,
  }, { status: 201 });
}
