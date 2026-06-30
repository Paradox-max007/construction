import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentSlug, getCurrentAdminId } from "@/lib/auth";
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

  if (!provider || !provider.approved) {
    return NextResponse.json(
      { error: "Provider not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ provider: serializeProvider(provider) });
}

// PATCH /api/providers/[slug]
// Body (all fields optional): {
//   companyName?, tagline?, description?, about? (object),
//   services? (string[]), workingAreas? (string[]), languages? (string[]),
//   experience?, employees?, startingPrice?, priceUnit?, responseTime?,
//   officeAddress?, email?, phone?, website?, certificates? (string[]),
//   packages? (object[])
// }
// Arrays are joined to csv strings for SQLite storage.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  // Only the provider themselves (or an admin) may edit this profile.
  const currentSlug = getCurrentSlug(request);
  const adminId = getCurrentAdminId(request);
  if (!currentSlug || currentSlug !== slug) {
    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const existing = await db.provider.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};

  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  const num = (v: unknown) => (typeof v === "number" && !Number.isNaN(v) ? v : undefined);
  const arr = (v: unknown) => (Array.isArray(v) ? v.map(String).join(", ") : undefined);

  if (body.companyName !== undefined) data.companyName = str(body.companyName);
  if (body.tagline !== undefined) data.tagline = str(body.tagline);
  if (body.description !== undefined) data.description = str(body.description);
  if (body.about !== undefined) data.about = typeof body.about === "object" ? JSON.stringify(body.about) : null;
  if (body.services !== undefined) data.services = arr(body.services);
  if (body.workingAreas !== undefined) data.workingAreas = arr(body.workingAreas);
  if (body.languages !== undefined) data.languages = arr(body.languages);
  if (body.certificates !== undefined) data.certificates = arr(body.certificates);
  if (body.experience !== undefined) data.experience = num(body.experience);
  if (body.employees !== undefined) data.employees = num(body.employees);
  if (body.startingPrice !== undefined) data.startingPrice = num(body.startingPrice);
  if (body.priceUnit !== undefined) data.priceUnit = str(body.priceUnit);
  if (body.responseTime !== undefined) data.responseTime = str(body.responseTime);
  if (body.officeAddress !== undefined) data.officeAddress = str(body.officeAddress);
  if (body.email !== undefined) data.email = str(body.email);
  if (body.phone !== undefined) data.phone = str(body.phone);
  if (body.website !== undefined) data.website = str(body.website);
  if (body.packages !== undefined) {
    data.packages = Array.isArray(body.packages) ? JSON.stringify(body.packages) : "[]";
  }

  // Remove undefined entries so Prisma doesn't try to set them to undefined
  for (const k of Object.keys(data)) {
    if (data[k] === undefined) delete data[k];
  }

  const updated = await db.provider.update({
    where: { slug },
    data,
    include: {
      category: { select: { id: true, name: true, slug: true, imageUrl: true, icon: true } },
      projects: { orderBy: { createdAt: "desc" } },
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });

  return NextResponse.json({ success: true, provider: serializeProvider(updated) });
}
