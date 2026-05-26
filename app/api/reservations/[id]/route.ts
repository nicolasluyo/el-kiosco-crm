import { NextRequest, NextResponse } from "next/server";
import { db, reservations } from "@/lib/db";
import { eq } from "drizzle-orm";
import { sendCancellationEmail } from "@/lib/notifications";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const [updated] = await db
    .update(reservations)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(reservations.id, parseInt(id)))
    .returning();

  if (body.status === "cancelled" && updated) {
    await sendCancellationEmail(updated).catch(console.error);
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [deleted] = await db
    .update(reservations)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(reservations.id, parseInt(id)))
    .returning();

  if (deleted) await sendCancellationEmail(deleted).catch(console.error);

  return NextResponse.json({ success: true });
}
