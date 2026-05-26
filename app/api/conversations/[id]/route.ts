import { NextRequest, NextResponse } from "next/server";
import { db, conversations, messages, customers } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const convId = parseInt(id);

  const [conv] = await db
    .select({
      id: conversations.id,
      status: conversations.status,
      agentEnabled: conversations.agentEnabled,
      messageCount: conversations.messageCount,
      lastMessageAt: conversations.lastMessageAt,
      createdAt: conversations.createdAt,
      customer: {
        id: customers.id,
        username: customers.username,
        fullName: customers.fullName,
        profilePicUrl: customers.profilePicUrl,
        instagramUserId: customers.instagramUserId,
      },
    })
    .from(conversations)
    .innerJoin(customers, eq(conversations.customerId, customers.id))
    .where(eq(conversations.id, convId));

  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, convId))
    .orderBy(messages.sentAt);

  return NextResponse.json({ ...conv, messages: msgs });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const convId = parseInt(id);
  const body = await req.json();

  const [updated] = await db
    .update(conversations)
    .set(body)
    .where(eq(conversations.id, convId))
    .returning();

  return NextResponse.json(updated);
}
