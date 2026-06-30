import { NextResponse } from "next/server";

import { db } from "@/lib/db";

// GET /api/plans — public. Returns active plan configs sorted by duration asc.
export async function GET() {
  const plans = await db.planConfig.findMany({
    where: { active: true },
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
