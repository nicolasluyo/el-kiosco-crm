"use client";

import { useEffect, useState, useRef } from "react";
import { Bot, User, AlertCircle, CheckCircle2, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  direction: "incoming" | "outgoing";
  content: string;
  sentAt: string;
}

interface ConversationDetail {
  id: number;
  status: string;
  agentEnabled: boolean;
  customer: {
    username: string | null;
    fullName: string | null;
    instagramUserId: string;
  };
  messages: Message[];
}

export default function ConversationDetailClient({ id }: { id: string }) {
  const [data, setData] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/conversations/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages]);

  async function toggleAgent() {
    if (!data) return;
    setToggling(true);
    const res = await fetch(`/api/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentEnabled: !data.agentEnabled }),
    });
    const updated = await res.json();
    setData((prev) => prev ? { ...prev, agentEnabled: updated.agentEnabled } : prev);
    setToggling(false);
  }

  if (loading) {
    return (
      <div className="flex-1 p-8 animate-pulse space-y-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-10 rounded-xl max-w-sm",
              i % 2 === 0 ? "bg-stone-100" : "bg-blue-50 ml-auto"
            )}
          />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center flex-1 text-stone-400">
        <AlertCircle className="w-6 h-6 mr-2" />
        Conversación no encontrada
      </div>
    );
  }

  const name = data.customer.fullName ?? data.customer.username ?? "Cliente";

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-8 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold text-sm">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-stone-800 text-sm">{name}</p>
            {data.customer.username && (
              <p className="text-xs text-stone-400">@{data.customer.username}</p>
            )}
          </div>
        </div>

        <button
          onClick={toggleAgent}
          disabled={toggling}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
            data.agentEnabled
              ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              : "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
          )}
        >
          {data.agentEnabled ? (
            <>
              <Bot className="w-4 h-4" />
              <ToggleRight className="w-4 h-4" />
              IA activa
            </>
          ) : (
            <>
              <User className="w-4 h-4" />
              <ToggleLeft className="w-4 h-4" />
              Modo manual
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-3">
        {data.messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.direction === "incoming" ? "justify-start" : "justify-end"
            )}
          >
            <div
              className={cn(
                "max-w-[70%] px-4 py-2.5 rounded-2xl text-sm",
                msg.direction === "incoming"
                  ? "bg-white border border-stone-200 text-stone-800 rounded-tl-sm"
                  : "bg-amber-600 text-white rounded-tr-sm"
              )}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <p
                className={cn(
                  "text-[10px] mt-1",
                  msg.direction === "incoming" ? "text-stone-400" : "text-amber-200"
                )}
              >
                {new Date(msg.sentAt).toLocaleTimeString("es-PE", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {msg.direction === "outgoing" && (
                  <span className="ml-1 inline-flex items-center gap-0.5">
                    · <Bot className="w-2.5 h-2.5 inline" /> IA
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
