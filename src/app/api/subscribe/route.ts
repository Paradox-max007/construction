import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";

// POST /api/subscribe — newsletter subscription.
// Body: { email, name? }
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body.name === "string" ? body.name.trim() : null;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  // Upsert — if already subscribed, just (maybe) update the name.
  const subscriber = await db.subscriber.upsert({
    where: { email },
    create: { email, name },
    update: name ? { name } : {},
    select: { id: true, email: true, name: true, createdAt: true },
  });

  const isNew = subscriber.createdAt.getTime() > Date.now() - 5_000;

  return NextResponse.json(
    {
      success: true,
      subscriber,
      message: isNew ? "Subscribed successfully" : "You're already subscribed",
    },
    { status: isNew ? 201 : 200 },
  );
}
