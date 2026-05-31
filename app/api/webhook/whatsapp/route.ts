import { NextRequest, NextResponse } from "next/server";
import { db, customers, conversations, messages } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { runAgent } from "@/lib/agent";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

// GET — verificación del webhook por Meta
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = (process.env.WHATSAPP_VERIFY_TOKEN ?? "el_kiosco_whatsapp_2024").trim();
  if (mode === "subscribe" && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// POST — recibe mensajes de WhatsApp
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.object !== "whatsapp_business_account") {
    return NextResponse.json({ status: "ignored" });
  }

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value?.messages) continue;

      for (const msg of value.messages) {
        if (msg.type !== "text") continue;
        const senderPhone = msg.from;
        const text = msg.text?.body;
        if (!senderPhone || !text) continue;

        await processIncomingMessage(senderPhone, text, msg.id, value.contacts?.[0]);
      }
    }
  }

  return NextResponse.json({ status: "ok" });
}

async function processIncomingMessage(
  phone: string,
  text: string,
  messageId: string,
  contact?: { profile?: { name?: string }; wa_id?: string }
) {
  // 1. Buscar o crear cliente
  let [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.instagramUserId, phone));

  if (!customer) {
    const [newCustomer] = await db
      .insert(customers)
      .values({
        instagramUserId: phone,
        username: phone,
        fullName: contact?.profile?.name ?? null,
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
    instagramMessageId: messageId,
  });

  await db
    .update(conversations)
    .set({ messageCount: conversation.messageCount + 1, lastMessageAt: new Date() })
    .where(eq(conversations.id, conversation.id));

  if (!conversation.agentEnabled) return;

  // 4. Cargar historial
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

  // 5. Correr agente IA
  const agentResponse = await runAgent({
    conversationId: conversation.id,
    customerId: customer.id,
    messageHistory,
    newMessage: text,
  });

  // 6. Guardar respuesta
  await db.insert(messages).values({
    conversationId: conversation.id,
    direction: "outgoing",
    content: agentResponse,
  });

  await db
    .update(conversations)
    .set({ messageCount: conversation.messageCount + 2, lastMessageAt: new Date() })
    .where(eq(conversations.id, conversation.id));

  // 7. Enviar por WhatsApp
  await sendWhatsAppMessage(phone, agentResponse).catch((err) =>
    console.error("WhatsApp send error:", err)
  );
}
