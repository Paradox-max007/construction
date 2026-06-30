import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentCustomerId } from "@/lib/auth";

// GET /api/quote-requests
//   ?providerId=<id>  → returns ALL leads for that provider (newest first)
//   (no providerId)   → admin view, 20 most recent across all providers
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const providerId = searchParams.get("providerId");

  if (providerId) {
    const quoteRequests = await db.quoteRequest.findMany({
      where: { providerId },
      orderBy: { createdAt: "desc" },
      include: {
        provider: { select: { id: true, companyName: true, slug: true } },
      },
    });
    return NextResponse.json({ quoteRequests });
  }

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
// Requires customer authentication. Customer's name/email/phone are pulled
// from their profile (the body may NOT set them). Phone is required.
// Body: { providerId, projectType, budget?, location?, timeline?, message? }
export async function POST(request: NextRequest) {
  const customerId = getCurrentCustomerId(request);
  if (!customerId) {
    return NextResponse.json(
      { error: "Please log in to request a quote" },
      { status: 401 },
    );
  }

  const customer = await db.customer.findUnique({
    where: { id: customerId },
    select: { id: true, name: true, email: true, phone: true },
  });
  if (!customer) {
    return NextResponse.json(
      { error: "Customer account not found" },
      { status: 401 },
    );
  }
  if (!customer.phone || customer.phone.trim().length < 6) {
    return NextResponse.json(
      { error: "A phone number is required on your profile to request quotes" },
      { status: 400 },
    );
  }

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
  const projectType = typeof body.projectType === "string" ? body.projectType.trim() : "";

  if (!providerId) {
    return NextResponse.json(
      { error: "providerId is required" },
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
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
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
