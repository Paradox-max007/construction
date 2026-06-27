import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { serializeProvider } from "@/lib/serialize";

// GET /api/providers/featured → { providers: ProviderWithCategory[] }
// Returns up to 6 featured providers, sorted by rating desc.
export async function GET() {
  const providers = await db.provider.findMany({
    where: { featured: true },
    orderBy: { rating: "desc" },
    take: 6,
    include: {
      category: { select: { id: true, name: true, slug: true, imageUrl: true, icon: true } },
    },
  });

  return NextResponse.json({
    providers: providers.map(serializeProvider),
  });
}
