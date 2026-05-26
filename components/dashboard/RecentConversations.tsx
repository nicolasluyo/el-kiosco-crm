import Link from "next/link";
import { db, conversations, customers } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { MessageSquare, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const statusLabels: Record<string, { label: string; cls: string }> = {
  active: { label: "Activa", cls: "bg-emerald-100 text-emerald-700" },
  closed: { label: "Cerrada", cls: "bg-stone-100 text-stone-600" },
  needs_human: { label: "Necesita atención", cls: "bg-red-100 text-red-700" },
};

export default async function RecentConversations() {
  let recent: Array<{
    id: number;
    status: "active" | "closed" | "needs_human";
    messageCount: number;
    lastMessageAt: Date;
    customer: { username: string | null; fullName: string | null };
  }> = [];

  try {
    const rows = await db
      .select({
        id: conversations.id,
        status: conversations.status,
        messageCount: conversations.messageCount,
        lastMessageAt: conversations.lastMessageAt,
        customer: {
          username: customers.username,
          fullName: customers.fullName,
        },
      })
      .from(conversations)
      .innerJoin(customers, eq(conversations.customerId, customers.id))
      .orderBy(desc(conversations.lastMessageAt))
      .limit(5);
    recent = rows;
  } catch {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-stone-700">Conversaciones recientes</h2>
        <Link
          href="/conversations"
          className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
        >
          Ver todas <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-stone-400">
          <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-sm">Sin conversaciones aún</p>
        </div>
      ) : (
        <div className="divide-y divide-stone-100">
          {recent.map((conv) => {
            const s = statusLabels[conv.status] ?? statusLabels.active;
            const name = conv.customer.fullName ?? conv.customer.username ?? "Cliente";
            return (
              <Link
                key={conv.id}
                href={`/conversations/${conv.id}`}
                className="flex items-center justify-between py-3 hover:bg-stone-50 px-2 rounded-lg transition-colors -mx-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center text-xs font-semibold text-stone-600">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-800">
                      {name.length > 20 ? name.slice(0, 20) + "…" : name}
                    </p>
                    <p className="text-xs text-stone-400">
                      {conv.messageCount} mensajes ·{" "}
                      {new Date(conv.lastMessageAt).toLocaleDateString("es-PE")}
                    </p>
                  </div>
                </div>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", s.cls)}>
                  {s.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
