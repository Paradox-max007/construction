import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentSlug, getCurrentAdminId } from "@/lib/auth";

// PATCH /api/quote-requests/[id]
// Requires provider auth (the lead's owning provider) or admin auth.
// Body: {
//   status?: "new" | "contacted" | "quoted" | "won" | "lost",
//   projectStatus?: "not_started" | "in_progress" | "on_hold" | "completed" | "cancelled",
//   projectNotes?: string
// }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const currentSlug = getCurrentSlug(request);
  const adminId = getCurrentAdminId(request);
  if (!currentSlug && !adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const existing = await db.quoteRequest.findUnique({
    where: { id },
    include: { provider: { select: { slug: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  // If a provider is making the request (not an admin), ensure they own the lead.
  if (!adminId && currentSlug !== existing.provider.slug) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data: Record<string, unknown> = {};

  if (typeof body.status === "string") {
    const allowed = ["new", "contacted", "quoted", "won", "lost"];
    if (!allowed.includes(body.status)) {
      return NextResponse.json(
        { error: `status must be one of: ${allowed.join(", ")}` },
        { status: 400 },
      );
    }
    data.status = body.status;
  }

  if (typeof body.projectStatus === "string") {
    const allowedProject = ["not_started", "in_progress", "on_hold", "completed", "cancelled"];
    if (!allowedProject.includes(body.projectStatus)) {
      return NextResponse.json(
        { error: `projectStatus must be one of: ${allowedProject.join(", ")}` },
        { status: 400 },
      );
    }
    data.projectStatus = body.projectStatus;
    data.projectUpdatedAt = new Date();
  }

  if (typeof body.projectNotes === "string") {
    data.projectNotes = body.projectNotes;
    data.projectUpdatedAt = new Date();
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "No updatable fields provided (status, projectStatus, projectNotes)" },
      { status: 400 },
    );
  }

  const updated = await db.quoteRequest.update({
    where: { id },
    data,
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
