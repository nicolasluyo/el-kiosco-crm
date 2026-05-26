import { NextResponse } from "next/server";
import { db, messages, conversations, reservations, customers } from "@/lib/db";
import { eq, gte, sql, count, and } from "drizzle-orm";

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [totalCustomers] = await db.select({ count: count() }).from(customers);

  const [totalConversations] = await db.select({ count: count() }).from(conversations);

  const [activeConversations] = await db
    .select({ count: count() })
    .from(conversations)
    .where(eq(conversations.status, "active"));

  const [needsHuman] = await db
    .select({ count: count() })
    .from(conversations)
    .where(eq(conversations.status, "needs_human"));

  const [todayMessages] = await db
    .select({ count: count() })
    .from(messages)
    .where(gte(messages.sentAt, today));

  const [weekMessages] = await db
    .select({ count: count() })
    .from(messages)
    .where(gte(messages.sentAt, weekAgo));

  const todayStr = today.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replace(/\//g, "/");

  const todayReservations = await db
    .select()
    .from(reservations)
    .where(
      and(
        eq(reservations.date, todayStr),
        eq(reservations.status, "confirmed")
      )
    );

  const upcomingReservations = await db
    .select()
    .from(reservations)
    .where(eq(reservations.status, "confirmed"))
    .orderBy(reservations.date, reservations.time)
    .limit(10);

  // Mensajes por día últimos 7 días
  const dailyMessages = await db
    .select({
      day: sql<string>`DATE(${messages.sentAt})`,
      total: count(),
      incoming: sql<number>`SUM(CASE WHEN ${messages.direction} = 'incoming' THEN 1 ELSE 0 END)`,
      outgoing: sql<number>`SUM(CASE WHEN ${messages.direction} = 'outgoing' THEN 1 ELSE 0 END)`,
    })
    .from(messages)
    .where(gte(messages.sentAt, weekAgo))
    .groupBy(sql`DATE(${messages.sentAt})`)
    .orderBy(sql`DATE(${messages.sentAt})`);

  const [totalReservations] = await db.select({ count: count() }).from(reservations);
  const [confirmedReservations] = await db
    .select({ count: count() })
    .from(reservations)
    .where(eq(reservations.status, "confirmed"));

  return NextResponse.json({
    totalCustomers: totalCustomers.count,
    totalConversations: totalConversations.count,
    activeConversations: activeConversations.count,
    needsHuman: needsHuman.count,
    todayMessages: todayMessages.count,
    weekMessages: weekMessages.count,
    todayReservations,
    upcomingReservations,
    dailyMessages,
    totalReservations: totalReservations.count,
    confirmedReservations: confirmedReservations.count,
  });
}
