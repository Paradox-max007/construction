import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";

// POST /api/offers/validate — validate an offer code (public).
// Body: { code, amount? } → returns valid + computed discount.
// Does NOT consume the offer — that happens when a subscription is actually
// created via POST /api/subscriptions.
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const amount = typeof body.amount === "number" ? body.amount : 0;

  if (!code) {
    return NextResponse.json({ error: "code is required" }, { status: 400 });
  }

  const offer = await db.offer.findUnique({ where: { code } });

  if (!offer || !offer.active) {
    return NextResponse.json({ valid: false, reason: "Invalid or inactive offer code" });
  }
  if (offer.expiresAt && offer.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ valid: false, reason: "This offer code has expired" });
  }
  if (offer.maxUses > 0 && offer.usedCount >= offer.maxUses) {
    return NextResponse.json({ valid: false, reason: "This offer code has reached its usage limit" });
  }

  const discount =
    offer.discountType === "fixed"
      ? Math.min(offer.discountValue, amount)
      : Math.round((amount * offer.discountValue) / 100);

  return NextResponse.json({
    valid: true,
    code: offer.code,
    description: offer.description,
    discountType: offer.discountType,
    discountValue: offer.discountValue,
    discount,
    finalAmount: Math.max(0, amount - discount),
    expiresAt: offer.expiresAt ? offer.expiresAt.toISOString() : null,
  });
}
