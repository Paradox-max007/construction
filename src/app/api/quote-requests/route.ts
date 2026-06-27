import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";

// GET /api/quote-requests → { quoteRequests }
// Admin-style view of the 20 most recent quote requests, with the provider name.
export async function GET() {
  const quoteRequests = await db.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      provider: { select: { id: true, companyName: true, slug: true } },
    },
  });

  return NextResponse.json({ quoteRequests });
}

// POST /api/quote-requests → { success, quoteRequest }
// Body: { providerId, customerName, customerEmail?, customerPhone?, projectType, budget?, location?, timeline?, message? }
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const providerId = typeof body.providerId === "string" ? body.providerId : "";
  const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
  const projectType = typeof body.projectType === "string" ? body.projectType.trim() : "";

  if (!providerId) {
    return NextResponse.json(
      { error: "providerId is required" },
      { status: 400 },
    );
  }
  if (!customerName) {
    return NextResponse.json(
      { error: "customerName is required" },
      { status: 400 },
    );
  }
  if (!projectType) {
    return NextResponse.json(
      { error: "projectType is required" },
      { status: 400 },
    );
  }

  const provider = await db.provider.findUnique({
    where: { id: providerId },
    select: { id: true },
  });
  if (!provider) {
    return NextResponse.json(
      { error: "Provider not found" },
      { status: 404 },
    );
  }

  const quoteRequest = await db.quoteRequest.create({
    data: {
      providerId,
      customerName,
      customerEmail: typeof body.customerEmail === "string" ? body.customerEmail : null,
      customerPhone: typeof body.customerPhone === "string" ? body.customerPhone : null,
      projectType,
      budget: typeof body.budget === "string" ? body.budget : null,
      location: typeof body.location === "string" ? body.location : null,
      timeline: typeof body.timeline === "string" ? body.timeline : null,
      message: typeof body.message === "string" ? body.message : null,
    },
    include: {
      provider: { select: { id: true, companyName: true, slug: true } },
    },
  });

  return NextResponse.json({ success: true, quoteRequest }, { status: 201 });
}
