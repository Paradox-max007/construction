import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { serializeCategory } from "@/lib/serialize";

// GET /api/categories → { categories: Category[] }
// Returns all categories sorted by `sortOrder` ascending.
export async function GET() {
  const categories = await db.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({
    categories: categories.map(serializeCategory),
  });
}
