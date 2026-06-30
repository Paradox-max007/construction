import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentAdminId } from "@/lib/auth";

// GET /api/admin/plans — all plans (including inactive).
export async function GET(request: NextRequest) {
  const adminId = getCurrentAdminId(request);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plans = await db.planConfig.findMany({
    orderBy: { durationDays: "asc" },
  });

  return NextResponse.json({
    plans: plans.map((p) => ({
      ...p,
      features: p.features ? safeParseArray(p.features) : [],
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
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
