import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentAdminId } from "@/lib/auth";

// PATCH /api/admin/plans/[id]
// Body: any subset of { name, price, featuredPrice, premiumPrice, bothPrice,
//   durationDays, description, features[], active }
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

  const existing = await db.planConfig.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  const num = (v: unknown) => (typeof v === "number" && !Number.isNaN(v) ? v : undefined);
  const bool = (v: unknown) => (typeof v === "boolean" ? v : undefined);

  if (body.name !== undefined) data.name = str(body.name);
  if (body.price !== undefined) data.price = num(body.price);
  if (body.featuredPrice !== undefined) data.featuredPrice = num(body.featuredPrice);
  if (body.premiumPrice !== undefined) data.premiumPrice = num(body.premiumPrice);
  if (body.bothPrice !== undefined) data.bothPrice = num(body.bothPrice);
  if (body.durationDays !== undefined) data.durationDays = num(body.durationDays);
  if (body.description !== undefined) data.description = str(body.description);
  if (body.active !== undefined) data.active = bool(body.active);
  if (body.features !== undefined) {
    data.features = Array.isArray(body.features) ? JSON.stringify(body.features) : null;
  }

  for (const k of Object.keys(data)) {
    if (data[k] === undefined) delete data[k];
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
  }

  const updated = await db.planConfig.update({
    where: { id },
    data,
  });

  return NextResponse.json({
    success: true,
    plan: {
      ...updated,
      features: updated.features ? safeParseArray(updated.features) : [],
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    },
  });
}

function safeParseArray(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}
