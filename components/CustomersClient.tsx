"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, AtSign, MessageSquare } from "lucide-react";

interface Customer {
  id: number;
  instagramUserId: string;
  username: string | null;
  fullName: string | null;
  profilePicUrl: string | null;
  createdAt: string;
  lastContactAt: string;
}

export default function CustomersClient() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/customers")
      .then((r) => r.json())
      .then(setCustomers)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 bg-white rounded-xl border border-stone-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone-400">
        <Users className="w-12 h-12 mb-3 opacity-30" />
        <p className="font-medium">Sin clientes aún</p>
        <p className="text-sm mt-1">Los clientes aparecerán cuando escriban por Instagram</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {customers.map((c) => {
        const name = c.fullName ?? c.username ?? "Cliente";
        return (
          <div
            key={c.id}
            className="bg-white rounded-xl border border-stone-200 p-5 flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              {c.profilePicUrl ? (
                <img
                  src={c.profilePicUrl}
                  alt={name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-stone-800 text-sm truncate">{name}</p>
                {c.username && (
                  <p className="text-xs text-stone-400 flex items-center gap-1">
                    <AtSign className="w-3 h-3" />{c.username}
                  </p>
                )}
              </div>
            </div>

            <div className="text-xs text-stone-500 space-y-1">
              <p>
                Primer contacto:{" "}
                {new Date(c.createdAt).toLocaleDateString("es-PE", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p>
                Último mensaje:{" "}
                {new Date(c.lastContactAt).toLocaleDateString("es-PE", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            <Link
              href={`/conversations?customer=${c.id}`}
              className="flex items-center justify-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg px-3 py-2 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Ver conversaciones
            </Link>
          </div>
        );
      })}
    </div>
  );
}
