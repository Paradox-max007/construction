import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentSlug } from "@/lib/auth";

// GET /api/subscriptions — returns the authenticated provider's subscription
// history, newest first.
export async function GET(request: NextRequest) {
  const slug = getCurrentSlug(request);
  if (!slug) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const provider = await db.provider.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  const subscriptions = await db.subscription.findMany({
    where: { providerId: provider.id },
    orderBy: { createdAt: "desc" },
    include: {
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

// POST /api/subscriptions — provider pays for a plan.
// Body: { planType, featureType: "featured" | "premium" | "both", offerCode?, paymentMethod? }
// Looks up the plan, applies per-provider override if present, applies offer
// discount if valid, and creates an immutable subscription record + OfferUsage.
export async function POST(request: NextRequest) {
  const slug = getCurrentSlug(request);
  if (!slug) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const planType = typeof body.planType === "string" ? body.planType.trim() : "";
  const featureType = typeof body.featureType === "string" ? body.featureType.trim() : "";
  const offerCode = typeof body.offerCode === "string" ? body.offerCode.trim().toUpperCase() : "";
  const paymentMethod = typeof body.paymentMethod === "string" ? body.paymentMethod : "razorpay";

  if (!planType) return NextResponse.json({ error: "planType is required" }, { status: 400 });
  const allowedFeatures = ["featured", "premium", "both"];
  if (!allowedFeatures.includes(featureType)) {
    return NextResponse.json({ error: `featureType must be one of: ${allowedFeatures.join(", ")}` }, { status: 400 });
  }

  const provider = await db.provider.findUnique({
    where: { slug },
    select: { id: true, companyName: true, featured: true, premium: true },
  });
  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  const plan = await db.planConfig.findUnique({ where: { planType } });
  if (!plan || !plan.active) {
    return NextResponse.json({ error: "Invalid or inactive plan" }, { status: 400 });
  }

  // Base price depends on selected featureType.
  const basePrice =
    featureType === "featured"
      ? plan.featuredPrice
      : featureType === "premium"
        ? plan.premiumPrice
        : plan.bothPrice;
  if (basePrice <= 0) {
    return NextResponse.json({ error: `Selected feature not priced on this plan` }, { status: 400 });
  }

  // Per-provider override — if it exists, it overrides the base price.
  const override = await db.providerPlanOverride.findUnique({
    where: { providerId_planType: { providerId: provider.id, planType } },
  });
  const originalAmount = override ? override.customPrice : basePrice;
  let amount = originalAmount;

  // Offer code validation + discount calculation.
  let offerDiscount = 0;
  let offer: { id: string; code: string; discountType: string; discountValue: number; maxUses: number; usedCount: number; expiresAt: Date | null } | null = null;
  if (offerCode) {
    offer = await db.offer.findUnique({ where: { code: offerCode } });
    if (!offer || !offer.active) {
      return NextResponse.json({ error: "Invalid or inactive offer code" }, { status: 400 });
    }
    if (offer.expiresAt && offer.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "This offer code has expired" }, { status: 400 });
    }
    if (offer.maxUses > 0 && offer.usedCount >= offer.maxUses) {
      return NextResponse.json({ error: "This offer code has reached its usage limit" }, { status: 400 });
    }
    offerDiscount =
      offer.discountType === "fixed"
        ? Math.min(offer.discountValue, amount)
        : Math.round((amount * offer.discountValue) / 100);
    amount = Math.max(0, amount - offerDiscount);
  }

  // Generate a unique transaction reference.
  const transactionRef = `BC-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + plan.durationDays);

  // Create the subscription in a single transaction with offer usage + offer
  // increment (if an offer was applied).
  const subscription = await db.$transaction(async (tx) => {
    const sub = await tx.subscription.create({
      data: {
        transactionRef,
        providerId: provider.id,
        planType: plan.planType,
        planName: plan.name,
        amount,
        originalAmount,
        currency: "INR",
        durationDays: plan.durationDays,
        featureType,
        status: "active",
        startDate,
        endDate,
        paymentMethod,
        offerCode: offer ? offer.code : null,
        offerDiscount,
      },
    });

    if (offer) {
      await tx.offerUsage.create({
        data: {
          offerId: offer.id,
          subscriptionId: sub.id,
          providerId: provider.id,
          code: offer.code,
          discountAmount: offerDiscount,
        },
      });
      await tx.offer.update({
        where: { id: offer.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Apply the feature flags to the provider.
    if (featureType === "featured" || featureType === "both") {
      await tx.provider.update({
        where: { id: provider.id },
        data: { featured: true },
      });
    }
    if (featureType === "premium" || featureType === "both") {
      await tx.provider.update({
        where: { id: provider.id },
        data: { premium: true },
      });
    }

    return sub;
  });

  return NextResponse.json(
    {
      success: true,
      subscription: {
        ...subscription,
        startDate: subscription.startDate.toISOString(),
        endDate: subscription.endDate.toISOString(),
        createdAt: subscription.createdAt.toISOString(),
        updatedAt: subscription.updatedAt.toISOString(),
      },
    },
    { status: 201 },
  );
}
