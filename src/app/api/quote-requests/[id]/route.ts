import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";

// PATCH /api/quote-requests/[id]
// Body: { status: "new" | "contacted" | "quoted" | "won" | "lost" }
// Updates the status of a single lead and returns the updated record.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const status = typeof body.status === "string" ? body.status : "";
  const allowed = ["new", "contacted", "quoted", "won", "lost"];
  if (!allowed.includes(status)) {
    return NextResponse.json(
      { error: `status must be one of: ${allowed.join(", ")}` },
      { status: 400 },
    );
  }

  const existing = await db.quoteRequest.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const updated = await db.quoteRequest.update({
    where: { id },
    data: { status },
    include: {
      provider: { select: { id: true, companyName: true, slug: true } },
    },
  });

  return NextResponse.json({ success: true, quoteRequest: updated });
}

// GET /api/quote-requests/[id] → single lead (handy for detail views)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const quoteRequest = await db.quoteRequest.findUnique({
    where: { id },
    include: {
      provider: { select: { id: true, companyName: true, slug: true } },
    },
  });
  if (!quoteRequest) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }
  return NextResponse.json({ quoteRequest });
}
