import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentAdminId } from "@/lib/auth";

// GET /api/admin/leads — all quote requests across all providers.
export async function GET(request: NextRequest) {
  const adminId = getCurrentAdminId(request);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const quoteRequests = await db.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      provider: { select: { id: true, companyName: true, slug: true } },
      customer: { select: { id: true, name: true, email: true, phone: true } },
    },
  });

  return NextResponse.json({
    quoteRequests: quoteRequests.map((q) => ({
      ...q,
      createdAt: q.createdAt.toISOString(),
      projectUpdatedAt: q.projectUpdatedAt ? q.projectUpdatedAt.toISOString() : null,
    })),
  });
}
