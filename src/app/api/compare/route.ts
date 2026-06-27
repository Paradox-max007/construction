import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { serializeProvider } from "@/lib/serialize";

// GET /api/compare?ids=id1,id2,id3 → { providers: ProviderWithCategory[] }
// Returns the requested providers (max 4), preserving the order of `ids`.
// If `ids` is missing/empty, returns an empty array.
export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids") || "";
  const ids = idsParam
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 4);

  if (ids.length === 0) {
    return NextResponse.json({ providers: [] });
  }

  const providers = await db.provider.findMany({
    where: { id: { in: ids } },
    include: {
      category: { select: { id: true, name: true, slug: true, imageUrl: true, icon: true } },
    },
  });

  // Re-order to match the order of `ids` (Prisma.findMany does not preserve order).
  const byId = new Map(providers.map((p) => [p.id, p]));
  const ordered = ids
    .map((id) => byId.get(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return NextResponse.json({ providers: ordered.map(serializeProvider) });
}
