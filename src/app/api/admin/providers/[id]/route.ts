import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentAdminId } from "@/lib/auth";

// PATCH /api/admin/providers/[id]
// Toggle verified/premium/featured/approved flags + edit any field.
// Body: any subset of provider fields (verified, premium, featured, approved,
// companyName, tagline, description, email, phone, workingAreas[], etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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

  const existing = await db.provider.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  const num = (v: unknown) => (typeof v === "number" && !Number.isNaN(v) ? v : undefined);
  const arr = (v: unknown) => (Array.isArray(v) ? v.map(String).join(", ") : undefined);
  const bool = (v: unknown) => (typeof v === "boolean" ? v : undefined);

  // Flags
  if (body.verified !== undefined) data.verified = bool(body.verified);
  if (body.premium !== undefined) data.premium = bool(body.premium);
  if (body.featured !== undefined) data.featured = bool(body.featured);
  if (body.approved !== undefined) data.approved = bool(body.approved);

  // Editable text fields
  if (body.companyName !== undefined) data.companyName = str(body.companyName);
  if (body.tagline !== undefined) data.tagline = str(body.tagline);
  if (body.description !== undefined) data.description = str(body.description);
  if (body.about !== undefined) data.about = typeof body.about === "object" ? JSON.stringify(body.about) : null;
  if (body.email !== undefined) data.email = str(body.email);
  if (body.phone !== undefined) data.phone = str(body.phone);
  if (body.website !== undefined) data.website = str(body.website);
  if (body.officeAddress !== undefined) data.officeAddress = str(body.officeAddress);
  if (body.responseTime !== undefined) data.responseTime = str(body.responseTime);
  if (body.priceUnit !== undefined) data.priceUnit = str(body.priceUnit);

  // Array fields
  if (body.services !== undefined) data.services = arr(body.services);
  if (body.workingAreas !== undefined) data.workingAreas = arr(body.workingAreas);
  if (body.languages !== undefined) data.languages = arr(body.languages);
  if (body.certificates !== undefined) data.certificates = arr(body.certificates);
  if (body.documentUrls !== undefined) data.documentUrls = arr(body.documentUrls);
  if (body.packages !== undefined) {
    data.packages = Array.isArray(body.packages) ? JSON.stringify(body.packages) : "[]";
  }

  // Numeric fields
  if (body.experience !== undefined) data.experience = num(body.experience);
  if (body.employees !== undefined) data.employees = num(body.employees);
  if (body.startingPrice !== undefined) data.startingPrice = num(body.startingPrice);

  // Remove undefined entries so Prisma doesn't try to set them to undefined
  for (const k of Object.keys(data)) {
    if (data[k] === undefined) delete data[k];
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
  }

  const updated = await db.provider.update({
    where: { id },
    data,
    select: {
      id: true, companyName: true, slug: true, email: true, phone: true,
      verified: true, premium: true, featured: true, approved: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ success: true, provider: updated });
}

// DELETE /api/admin/providers/[id] — cascade-deletes the provider and all
// their related data (projects, reviews, quote requests, subscriptions).
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const adminId = getCurrentAdminId(request);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await db.provider.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  // Prisma's onDelete: Cascade on the relations handles the cleanup.
  await db.provider.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
