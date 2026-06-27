import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/auth/register
// Creates a new provider with login credentials and logs them in.
// Body: {
//   companyName, categorySlug, description, email, phone, password,
//   services[], workingAreas[], experience, startingPrice, priceUnit,
//   officeAddress?
// }
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const companyName = typeof body.companyName === "string" ? body.companyName.trim() : "";
  const categorySlug = typeof body.categorySlug === "string" ? body.categorySlug.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const officeAddress = typeof body.officeAddress === "string" ? body.officeAddress.trim() : "";

  // Validation
  if (!companyName) return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  if (!categorySlug) return NextResponse.json({ error: "Please select a category" }, { status: 400 });
  if (description.length < 20) return NextResponse.json({ error: "Description must be at least 20 characters" }, { status: 400 });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  if (phone.length < 6) return NextResponse.json({ error: "A valid phone number is required" }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

  const services = Array.isArray(body.services) ? body.services.map(String).filter(Boolean) : [];
  const workingAreas = Array.isArray(body.workingAreas) ? body.workingAreas.map(String).filter(Boolean) : [];
  if (services.length === 0) return NextResponse.json({ error: "Add at least one service" }, { status: 400 });
  if (workingAreas.length === 0) return NextResponse.json({ error: "Add at least one working area" }, { status: 400 });

  const experience = typeof body.experience === "number" ? body.experience : 0;
  const startingPrice = typeof body.startingPrice === "number" ? body.startingPrice : 0;
  const priceUnit = typeof body.priceUnit === "string" ? body.priceUnit : "sqft";

  // Check email uniqueness
  const existing = await db.provider.findFirst({ where: { email: { equals: email } }, select: { id: true } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists. Please log in instead." }, { status: 409 });
  }

  // Resolve category
  const category = await db.category.findUnique({ where: { slug: categorySlug }, select: { id: true } });
  if (!category) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  // Generate a slug from company name
  let baseSlug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!baseSlug) baseSlug = "provider";
  let slug = baseSlug;
  let suffix = 1;
  while (await db.provider.findUnique({ where: { slug }, select: { id: true } })) {
    suffix++;
    slug = `${baseSlug}-${suffix}`;
  }

  const provider = await db.provider.create({
    data: {
      companyName,
      slug,
      description,
      categoryId: category.id,
      services: services.join(", "),
      experience,
      startingPrice,
      priceUnit,
      workingAreas: workingAreas.join(", "),
      officeAddress: officeAddress || null,
      email,
      phone,
      password: auth.hashPassword(password),
      verified: false,
      premium: false,
      featured: false,
      views: 0,
      profileViews: 0,
    },
    select: { id: true, slug: true, companyName: true, email: true },
  });

  const res = NextResponse.json({
    success: true,
    provider: { slug: provider.slug, companyName: provider.companyName, email: provider.email },
  }, { status: 201 });
  res.headers.set("Set-Cookie", auth.setSessionCookie(provider.slug));
  return res;
}
