import { NextRequest, NextResponse } from "next/server";
import { db, customers, conversations, messages } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { runAgent } from "@/lib/agent";
import { sendInstagramMessage, getInstagramUserProfile } from "@/lib/instagram";

// GET — verificación del webhook por Meta
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.INSTAGRAM_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// POST — recibe mensajes de Instagram
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Validar que es un evento de Instagram
  if (body.object !== "instagram") {
    return NextResponse.json({ status: "ignored" });
  }

  for (const entry of body.entry ?? []) {
    for (const event of entry.messaging ?? []) {
      const senderId = event.sender?.id;
      const messageText = event.message?.text;

      if (!senderId || !messageText || event.message?.is_echo) continue;

      await processIncomingMessage(senderId, messageText, event.message?.mid);
    }
  }

  return NextResponse.json({ status: "ok" });
}

async function processIncomingMessage(
  instagramUserId: string,
  text: string,
  instagramMessageId?: string
) {
  // 1. Buscar o crear cliente
  let [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.instagramUserId, instagramUserId));

  if (!customer) {
    const profile = await getInstagramUserProfile(instagramUserId);
    const [newCustomer] = await db
      .insert(customers)
      .values({
        instagramUserId,
        username: profile?.username,
        fullName: profile?.name,
        profilePicUrl: profile?.profile_pic,
      })
      .returning();
    customer = newCustomer;
  } else {
    await db
      .update(customers)
      .set({ lastContactAt: new Date() })
      .where(eq(customers.id, customer.id));
  }

  // 2. Buscar o crear conversación activa
  let [conversation] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.customerId, customer.id),
        eq(conversations.status, "active")
      )
    );

  if (!conversation) {
    const [newConv] = await db
      .insert(conversations)
      .values({ customerId: customer.id })
      .returning();
    conversation = newConv;
  }

  // 3. Guardar mensaje entrante
  await db.insert(messages).values({
    conversationId: conversation.id,
    direction: "incoming",
    content: text,
    instagramMessageId,
  });

  await db
    .update(conversations)
    .set({
      messageCount: conversation.messageCount + 1,
      lastMessageAt: new Date(),
    })
    .where(eq(conversations.id, conversation.id));

  // 4. Si el agente está deshabilitado para esta conversación, salir
  if (!conversation.agentEnabled) return;

  // 5. Cargar historial de mensajes (últimos 20)
  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversation.id))
    .orderBy(messages.sentAt)
    .limit(20);

  const messageHistory = history.slice(0, -1).map((m) => ({
    role: m.direction === "incoming" ? ("user" as const) : ("assistant" as const),
    content: m.content,
  }));

  // 6. Correr agente IA
  const agentResponse = await runAgent({
    conversationId: conversation.id,
    customerId: customer.id,
    messageHistory,
    newMessage: text,
  });

  // 7. Guardar respuesta del agente
  await db.insert(messages).values({
    conversationId: conversation.id,
    direction: "outgoing",
    content: agentResponse,
  });

  await db
    .update(conversations)
    .set({
      messageCount: conversation.messageCount + 2,
      lastMessageAt: new Date(),
    })
    .where(eq(conversations.id, conversation.id));

  // 8. Enviar respuesta por Instagram
  await sendInstagramMessage(instagramUserId, agentResponse);
}
