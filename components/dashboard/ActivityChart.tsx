"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DayData {
  day: string;
  total: number;
  incoming: number;
  outgoing: number;
}

export default function ActivityChart({ data }: { data: DayData[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.day).toLocaleDateString("es-PE", { weekday: "short", day: "numeric" }),
  }));

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6">
      <h2 className="text-sm font-semibold text-stone-700 mb-6">
        Mensajes últimos 7 días
      </h2>
      {formatted.length === 0 ? (
        <div className="h-52 flex items-center justify-center text-stone-400 text-sm">
          Sin datos aún
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={formatted} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="incoming" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="outgoing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97706" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#78716c" }} />
            <YAxis tick={{ fontSize: 11, fill: "#78716c" }} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e7e5e4" }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="incoming"
              name="Recibidos"
              stroke="#2563eb"
              fill="url(#incoming)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="outgoing"
              name="Enviados (IA)"
              stroke="#d97706"
              fill="url(#outgoing)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
