import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth, getCurrentCustomerId } from "@/lib/auth";

// PATCH /api/auth/customer/profile
// Body: { name?, phone?, password? }
// Updates the authenticated customer's profile.
export async function PATCH(request: NextRequest) {
  const customerId = getCurrentCustomerId(request);
  if (!customerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    data.name = name;
  }

  if (typeof body.phone === "string") {
    data.phone = body.phone.trim() || null;
  }

  if (typeof body.password === "string" && body.password.length > 0) {
    if (body.password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    data.password = auth.hashPassword(body.password);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No updatable fields provided (name, phone, password)" }, { status: 400 });
  }

  const updated = await db.customer.update({
    where: { id: customerId },
    data,
    select: { id: true, name: true, email: true, phone: true, avatar: true, googleId: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({ success: true, customer: updated });
}
