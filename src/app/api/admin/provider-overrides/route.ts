import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentAdminId } from "@/lib/auth";

// GET /api/admin/provider-overrides — list all per-provider pricing overrides.
export async function GET(request: NextRequest) {
  const adminId = getCurrentAdminId(request);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const overrides = await db.providerPlanOverride.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      provider: { select: { id: true, companyName: true, slug: true } },
    },
  });

  return NextResponse.json({
    overrides: overrides.map((o) => ({
      ...o,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    })),
  });
}

// POST /api/admin/provider-overrides — create a per-provider pricing override.
// Body: { providerId, planType, customPrice, notes? }
export async function POST(request: NextRequest) {
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

  const providerId = typeof body.providerId === "string" ? body.providerId : "";
  const planType = typeof body.planType === "string" ? body.planType.trim() : "";
  const customPrice = typeof body.customPrice === "number" ? body.customPrice : 0;
  const notes = typeof body.notes === "string" ? body.notes.trim() : null;

  if (!providerId) return NextResponse.json({ error: "providerId is required" }, { status: 400 });
  if (!planType) return NextResponse.json({ error: "planType is required" }, { status: 400 });
  if (customPrice < 0) return NextResponse.json({ error: "customPrice must be ≥ 0" }, { status: 400 });

  const provider = await db.provider.findUnique({ where: { id: providerId }, select: { id: true } });
  if (!provider) return NextResponse.json({ error: "Provider not found" }, { status: 404 });

  // Upsert — if an override for (providerId, planType) already exists, replace it.
  const override = await db.providerPlanOverride.upsert({
    where: { providerId_planType: { providerId, planType } },
    create: { providerId, planType, customPrice, notes },
    update: { customPrice, notes },
  });

  return NextResponse.json({
    success: true,
    override: {
      ...override,
      createdAt: override.createdAt.toISOString(),
      updatedAt: override.updatedAt.toISOString(),
    },
  }, { status: 201 });
}

// DELETE /api/admin/provider-overrides?id=<id> — delete a single override.
export async function DELETE(request: NextRequest) {
  const adminId = getCurrentAdminId(request);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id query param is required" }, { status: 400 });
  }

  const existing = await db.providerPlanOverride.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Override not found" }, { status: 404 });
  }

  await db.providerPlanOverride.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
