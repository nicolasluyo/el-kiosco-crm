import { NextRequest, NextResponse } from "next/server";
import { db, conversations, customers, messages } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const query = db
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
    .orderBy(desc(conversations.lastMessageAt));

  const result = await query;

  const filtered = status
    ? result.filter((c) => c.status === status)
    : result;

  return NextResponse.json(filtered);
}
