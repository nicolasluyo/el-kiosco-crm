"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MessageSquare, AlertCircle, CheckCircle2, Bot, User } from "lucide-react";

type ConvStatus = "active" | "closed" | "needs_human";

interface Conversation {
  id: number;
  status: ConvStatus;
  agentEnabled: boolean;
  messageCount: number;
  lastMessageAt: string;
  customer: {
    id: number;
    username: string | null;
    fullName: string | null;
    instagramUserId: string;
  };
}

const filters: { value: string; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Activas" },
  { value: "needs_human", label: "Necesita atención" },
  { value: "closed", label: "Cerradas" },
];

const statusIcon: Record<ConvStatus, React.ReactNode> = {
  active: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
  closed: <CheckCircle2 className="w-3.5 h-3.5 text-stone-400" />,
  needs_human: <AlertCircle className="w-3.5 h-3.5 text-red-500" />,
};

export default function ConversationsClient() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = filter === "all" ? "/api/conversations" : `/api/conversations?status=${filter}`;
    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then(setConversations)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-8 py-4 flex items-center gap-2 border-b border-stone-100 bg-white">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              filter === f.value
                ? "bg-amber-600 text-white"
                : "text-stone-600 hover:bg-stone-100"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-stone-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400">
            <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">Sin conversaciones</p>
            <p className="text-sm mt-1">Los mensajes de Instagram aparecerán aquí</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {conversations.map((conv) => {
              const name = conv.customer.fullName ?? conv.customer.username ?? "Cliente desconocido";
              return (
                <Link
                  key={conv.id}
                  href={`/conversations/${conv.id}`}
                  className="flex items-center gap-4 px-8 py-4 hover:bg-stone-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-stone-800 text-sm truncate">{name}</p>
                      {conv.customer.username && (
                        <span className="text-xs text-stone-400">@{conv.customer.username}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {statusIcon[conv.status]}
                      <span className="text-xs text-stone-500">{conv.messageCount} mensajes</span>
                      <span className="text-xs text-stone-400">
                        {new Date(conv.lastMessageAt).toLocaleDateString("es-PE", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {conv.agentEnabled ? (
                      <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                        <Bot className="w-3 h-3" /> IA activa
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">
                        <User className="w-3 h-3" /> Manual
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
