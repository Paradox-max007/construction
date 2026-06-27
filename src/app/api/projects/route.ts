import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentSlug } from "@/lib/auth";
import { serializeProject } from "@/lib/serialize";

// POST /api/projects
// Auth-gated: creates a new project for the logged-in provider.
// Body: {
//   title, description?, category?, budget?, area?, location?,
//   durationWeeks?, materials? (string[]), images? (string[]), clientName?,
//   clientReview?, clientRating?, tags? (string[]), featured?
// }
export async function POST(request: NextRequest) {
  const slug = getCurrentSlug(request);
  if (!slug) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const provider = await db.provider.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "Project title is required" }, { status: 400 });
  }

  const images = Array.isArray(body.images) ? body.images.map(String).filter(Boolean) : [];
  if (images.length === 0) {
    return NextResponse.json({ error: "At least one image is required" }, { status: 400 });
  }

  const materials = Array.isArray(body.materials) ? body.materials.map(String).filter(Boolean) : [];
  const tags = Array.isArray(body.tags) ? body.tags.map(String).filter(Boolean) : [];

  const project = await db.project.create({
    data: {
      providerId: provider.id,
      title,
      description: typeof body.description === "string" ? body.description.trim() || null : null,
      category: typeof body.category === "string" ? body.category.trim() || null : null,
      budget: typeof body.budget === "number" && !Number.isNaN(body.budget) ? body.budget : null,
      area: typeof body.area === "string" ? body.area.trim() || null : null,
      location: typeof body.location === "string" ? body.location.trim() || null : null,
      durationWeeks: typeof body.durationWeeks === "number" && !Number.isNaN(body.durationWeeks) ? body.durationWeeks : null,
      materials: materials.length ? materials.join(", ") : null,
      images: images.join(","),
      clientName: typeof body.clientName === "string" ? body.clientName.trim() || null : null,
      clientReview: typeof body.clientReview === "string" ? body.clientReview.trim() || null : null,
      clientRating: typeof body.clientRating === "number" && body.clientRating >= 1 && body.clientRating <= 5 ? body.clientRating : null,
      tags: tags.length ? tags.join(", ") : null,
      featured: !!body.featured,
    },
  });

  return NextResponse.json({ success: true, project: serializeProject(project) }, { status: 201 });
}
