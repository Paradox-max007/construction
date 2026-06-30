import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { auth, getCurrentAdminId } from "@/lib/auth";

// PATCH /api/admin/customers/[id]
// Body: { name?, email?, phone?, avatar?, password? }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const adminId = getCurrentAdminId(request);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const existing = await db.customer.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    data.name = name;
  }
  if (typeof body.email === "string") {
    const email = body.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    const dup = await db.customer.findUnique({ where: { email }, select: { id: true } });
    if (dup && dup.id !== id) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
    data.email = email;
  }
  if (typeof body.phone === "string") {
    data.phone = body.phone.trim() || null;
  }
  if (typeof body.avatar === "string") {
    data.avatar = body.avatar.trim() || null;
  }
  if (typeof body.password === "string" && body.password.length > 0) {
    if (body.password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    data.password = auth.hashPassword(body.password);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
  }

  const updated = await db.customer.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, phone: true, avatar: true, googleId: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({ success: true, customer: updated });
}

// DELETE /api/admin/customers/[id] — deletes the customer. Reviews &
// quote-requests they submitted stay (their customerId is set to null per
// the schema's onDelete: SetNull rule).
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const adminId = getCurrentAdminId(request);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await db.customer.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  await db.customer.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
