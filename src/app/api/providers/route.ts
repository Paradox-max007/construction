import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { serializeProvider } from "@/lib/serialize";

// GET /api/providers
// Query params:
//   category (slug) — filter by category slug
//   search (string) — case-insensitive contains on companyName, tagline, description, services
//   minRating (number)
//   verified ("true"/"false")
//   premium ("true"/"false")
//   sort — rating | price_low | price_high | experience | reviews | newest
//   area (string) — case-insensitive contains on workingAreas
//   page (default 1), limit (default 9)
// Returns { providers, total, page, totalPages }.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const categorySlug = searchParams.get("category");
  const search = searchParams.get("search")?.trim() || "";
  const minRatingRaw = searchParams.get("minRating");
  const verifiedRaw = searchParams.get("verified");
  const premiumRaw = searchParams.get("premium");
  const sort = searchParams.get("sort") || "rating";
  const area = searchParams.get("area")?.trim() || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.max(1, Number(searchParams.get("limit")) || 9);

  // Build the Prisma `where` clause.
  const where: Prisma.ProviderWhereInput = {};

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (search) {
    // SQLite's LIKE is already case-insensitive for ASCII, so we don't need `mode`.
    where.OR = [
      { companyName: { contains: search } },
      { tagline: { contains: search } },
      { description: { contains: search } },
      { services: { contains: search } },
    ];
  }

  if (minRatingRaw !== null && minRatingRaw !== "") {
    const minRating = Number(minRatingRaw);
    if (!Number.isNaN(minRating)) {
      where.rating = { gte: minRating };
    }
  }

  if (verifiedRaw === "true") where.verified = true;
  if (verifiedRaw === "false") where.verified = false;
  if (premiumRaw === "true") where.premium = true;
  if (premiumRaw === "false") where.premium = false;

  if (area) {
    // SQLite's LIKE is already case-insensitive.
    where.workingAreas = { contains: area };
  }

  // Sort mapping.
  const orderBy: Prisma.ProviderOrderByWithRelationInput =
    sort === "price_low"
      ? { startingPrice: "asc" }
      : sort === "price_high"
        ? { startingPrice: "desc" }
        : sort === "experience"
          ? { experience: "desc" }
          : sort === "reviews"
            ? { reviewsCount: "desc" }
            : sort === "newest"
              ? { createdAt: "desc" }
              : { rating: "desc" }; // default: rating

  const [total, providers] = await Promise.all([
    db.provider.count({ where }),
    db.provider.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: { select: { id: true, name: true, slug: true, imageUrl: true, icon: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return NextResponse.json({
    providers: providers.map(serializeProvider),
    total,
    page,
    totalPages,
  });
}
