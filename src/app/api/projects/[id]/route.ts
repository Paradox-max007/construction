import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentSlug } from "@/lib/auth";
import { serializeProject } from "@/lib/serialize";

// Helper: verify the logged-in provider owns the project.
async function getOwnedProject(request: NextRequest, id: string) {
  const slug = getCurrentSlug(request);
  if (!slug) return { error: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };
  const provider = await db.provider.findUnique({ where: { slug }, select: { id: true } });
  if (!provider) return { error: NextResponse.json({ error: "Provider not found" }, { status: 404 }) };
  const project = await db.project.findUnique({ where: { id } });
  if (!project) return { error: NextResponse.json({ error: "Project not found" }, { status: 404 }) };
  if (project.providerId !== provider.id) {
    return { error: NextResponse.json({ error: "You don't have permission to modify this project" }, { status: 403 }) };
  }
  return { project, providerId: provider.id };
}

// PATCH /api/projects/[id] — update a project (auth-gated, owner only).
// Body (all optional): same fields as POST.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const owned = await getOwnedProject(request, id);
  if ("error" in owned) return owned.error;
  const existing = owned.project!;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  const str = (v: unknown) => (typeof v === "string" ? v.trim() || null : undefined);
  const num = (v: unknown) => (typeof v === "number" && !Number.isNaN(v) ? v : undefined);
  const arr = (v: unknown) => (Array.isArray(v) ? v.map(String).filter(Boolean).join(", ") || null : undefined);

  if (body.title !== undefined) data.title = typeof body.title === "string" ? body.title.trim() : existing.title;
  if (body.description !== undefined) data.description = str(body.description);
  if (body.category !== undefined) data.category = str(body.category);
  if (body.budget !== undefined) data.budget = num(body.budget);
  if (body.area !== undefined) data.area = str(body.area);
  if (body.location !== undefined) data.location = str(body.location);
  if (body.durationWeeks !== undefined) data.durationWeeks = num(body.durationWeeks);
  if (body.materials !== undefined) data.materials = arr(body.materials);
  if (body.tags !== undefined) data.tags = arr(body.tags);
  if (body.images !== undefined) {
    const imgs = Array.isArray(body.images) ? body.images.map(String).filter(Boolean) : [];
    if (imgs.length === 0) {
      return NextResponse.json({ error: "A project must have at least one image" }, { status: 400 });
    }
    data.images = imgs.join(",");
  }
  if (body.clientName !== undefined) data.clientName = str(body.clientName);
  if (body.clientReview !== undefined) data.clientReview = str(body.clientReview);
  if (body.clientRating !== undefined) {
    data.clientRating = typeof body.clientRating === "number" && body.clientRating >= 1 && body.clientRating <= 5 ? body.clientRating : null;
  }
  if (body.featured !== undefined) data.featured = !!body.featured;

  for (const k of Object.keys(data)) {
    if (data[k] === undefined) delete data[k];
  }

  const updated = await db.project.update({ where: { id }, data });
  return NextResponse.json({ success: true, project: serializeProject(updated) });
}

// DELETE /api/projects/[id] — delete a project (auth-gated, owner only).
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const owned = await getOwnedProject(request, id);
  if ("error" in owned) return owned.error;

  await db.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
