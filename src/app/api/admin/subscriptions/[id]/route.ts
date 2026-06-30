import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentAdminId } from "@/lib/auth";

// PATCH /api/admin/subscriptions/[id]
// Only adminNotes + status (for cancellation) can be edited.
// Body: { adminNotes?, status?: "active" | "expired" | "cancelled", cancelledBy? }
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

  const existing = await db.subscription.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};

  if (typeof body.adminNotes === "string") {
    data.adminNotes = body.adminNotes || null;
  }
  if (typeof body.status === "string") {
    const allowed = ["active", "expired", "cancelled"];
    if (!allowed.includes(body.status)) {
      return NextResponse.json({ error: `status must be one of: ${allowed.join(", ")}` }, { status: 400 });
    }
    data.status = body.status;
    if (body.status === "cancelled") {
      data.cancelledBy = "admin";
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Only adminNotes and status can be updated" }, { status: 400 });
  }

  const updated = await db.subscription.update({
    where: { id },
    data,
    include: {
      provider: { select: { id: true, companyName: true, slug: true } },
      offerUsage: { select: { id: true, code: true, discountAmount: true } },
    },
  });

  return NextResponse.json({
    success: true,
    subscription: {
      ...updated,
      startDate: updated.startDate.toISOString(),
      endDate: updated.endDate.toISOString(),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    },
  });
}
