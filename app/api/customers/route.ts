import { NextResponse } from "next/server";
import { db, customers, conversations, reservations } from "@/lib/db";
import { eq, count, desc } from "drizzle-orm";

export async function GET() {
  const result = await db
    .select()
    .from(customers)
    .orderBy(desc(customers.lastContactAt));

  return NextResponse.json(result);
}
