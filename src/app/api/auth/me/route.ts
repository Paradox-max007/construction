import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentSlug } from "@/lib/auth";
import { serializeProvider } from "@/lib/serialize";

// GET /api/auth/me — returns the currently logged-in provider (or 401).
export async function GET(request: NextRequest) {
  const slug = getCurrentSlug(request);
  if (!slug) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const provider = await db.provider.findUnique({
    where: { slug },
    include: {
      category: { select: { id: true, name: true, slug: true, imageUrl: true, icon: true } },
      projects: { orderBy: { createdAt: "desc" } },
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!provider) {
    const res = NextResponse.json({ authenticated: false }, { status: 401 });
    res.headers.set("Set-Cookie", "bc_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
    return res;
  }

  return NextResponse.json({
    authenticated: true,
    provider: serializeProvider(provider),
  });
}
