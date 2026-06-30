import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentAdminId } from "@/lib/auth";

// PATCH /api/admin/offers/[id]
// Body: any subset of { description, discountType, discountValue, maxUses,
//   expiresAt, active }
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

  const existing = await db.offer.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.description === "string") data.description = body.description || null;
  if (typeof body.discountType === "string") {
    if (!["percent", "fixed"].includes(body.discountType)) {
      return NextResponse.json({ error: "discountType must be 'percent' or 'fixed'" }, { status: 400 });
    }
    data.discountType = body.discountType;
  }
  if (typeof body.discountValue === "number") data.discountValue = body.discountValue;
  if (typeof body.maxUses === "number") data.maxUses = body.maxUses;
  if (typeof body.active === "boolean") data.active = body.active;
  if (typeof body.expiresAt === "string") {
    const d = new Date(body.expiresAt);
    data.expiresAt = Number.isNaN(d.getTime()) ? null : d;
  } else if (body.expiresAt === null) {
    data.expiresAt = null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
  }

  const updated = await db.offer.update({ where: { id }, data });

  return NextResponse.json({
    success: true,
    offer: {
      ...updated,
      expiresAt: updated.expiresAt ? updated.expiresAt.toISOString() : null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    },
  });
}

// DELETE /api/admin/offers/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const adminId = getCurrentAdminId(request);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await db.offer.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  }

  await db.offer.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
