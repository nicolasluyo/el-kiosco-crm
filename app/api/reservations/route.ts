import { NextRequest, NextResponse } from "next/server";
import { db, reservations, customers } from "@/lib/db";
import { eq, desc, and } from "drizzle-orm";
import { sendReservationEmail } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const date = searchParams.get("date");

  const result = await db
    .select({
      id: reservations.id,
      customerName: reservations.customerName,
      phone: reservations.phone,
      date: reservations.date,
      time: reservations.time,
      guests: reservations.guests,
      occasion: reservations.occasion,
      notes: reservations.notes,
      status: reservations.status,
      createdAt: reservations.createdAt,
      updatedAt: reservations.updatedAt,
      customerId: reservations.customerId,
    })
    .from(reservations)
    .orderBy(desc(reservations.date), reservations.time);

  const filtered = result.filter((r) => {
    if (status && r.status !== status) return false;
    if (date && r.date !== date) return false;
    return true;
  });

  return NextResponse.json(filtered);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const [reservation] = await db
    .insert(reservations)
    .values({
      customerName: body.customerName,
      phone: body.phone,
      date: body.date,
      time: body.time,
      guests: body.guests,
      occasion: body.occasion,
      notes: body.notes,
      customerId: body.customerId,
      status: "confirmed",
    })
    .returning();

  await sendReservationEmail(reservation).catch(console.error);

  return NextResponse.json(reservation, { status: 201 });
}
