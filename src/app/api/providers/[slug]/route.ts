import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { serializeProvider } from "@/lib/serialize";

// GET /api/providers/[slug] → { provider: ProviderFull }
// In Next.js 16 App Router, dynamic route params are a Promise and must be awaited.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const provider = await db.provider.findUnique({
    where: { slug },
    include: {
      category: { select: { id: true, name: true, slug: true, imageUrl: true, icon: true } },
      projects: { orderBy: { createdAt: "desc" } },
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!provider) {
    return NextResponse.json(
      { error: "Provider not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ provider: serializeProvider(provider) });
}
