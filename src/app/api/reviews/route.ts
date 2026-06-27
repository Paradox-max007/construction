import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { serializeReview } from "@/lib/serialize";

// GET /api/reviews?providerId=<id> → { reviews }
// Returns reviews for a provider, newest first.
export async function GET(request: NextRequest) {
  const providerId = request.nextUrl.searchParams.get("providerId") || "";

  if (!providerId) {
    return NextResponse.json(
      { error: "providerId query param is required" },
      { status: 400 },
    );
  }

  const reviews = await db.review.findMany({
    where: { providerId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ reviews: reviews.map(serializeReview) });
}

// POST /api/reviews → { success, review }
// Body: { providerId, customerName, rating (1-5), title?, review, projectType? }
// After creating, recomputes the provider's aggregate rating & reviewsCount.
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const providerId = typeof body.providerId === "string" ? body.providerId : "";
  const customerName =
    typeof body.customerName === "string" ? body.customerName.trim() : "";
  const reviewText = typeof body.review === "string" ? body.review.trim() : "";
  const ratingRaw = Number(body.rating);

  if (!providerId) {
    return NextResponse.json(
      { error: "providerId is required" },
      { status: 400 },
    );
  }
  if (!customerName) {
    return NextResponse.json(
      { error: "customerName is required" },
      { status: 400 },
    );
  }
  if (!reviewText) {
    return NextResponse.json(
      { error: "review is required" },
      { status: 400 },
    );
  }
  if (
    Number.isNaN(ratingRaw) ||
    !Number.isInteger(ratingRaw) ||
    ratingRaw < 1 ||
    ratingRaw > 5
  ) {
    return NextResponse.json(
      { error: "rating must be an integer between 1 and 5" },
      { status: 400 },
    );
  }

  const provider = await db.provider.findUnique({
    where: { id: providerId },
    select: { id: true },
  });
  if (!provider) {
    return NextResponse.json(
      { error: "Provider not found" },
      { status: 404 },
    );
  }

  // Create the review.
  const review = await db.review.create({
    data: {
      providerId,
      customerName,
      rating: ratingRaw,
      title: typeof body.title === "string" ? body.title : null,
      review: reviewText,
      projectType: typeof body.projectType === "string" ? body.projectType : null,
    },
  });

  // Recompute aggregate rating + review count for the provider.
  const aggregates = await db.review.aggregate({
    where: { providerId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const avgRating = aggregates._avg.rating ?? 0;
  const count = aggregates._count.rating ?? 0;

  await db.provider.update({
    where: { id: providerId },
    data: {
      rating: Math.round(avgRating * 10) / 10, // 1 decimal place
      reviewsCount: count,
    },
  });

  return NextResponse.json(
    { success: true, review: serializeReview(review) },
    { status: 201 },
  );
}
