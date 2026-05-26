import { MessageSquare, CalendarDays, Users, AlertCircle } from "lucide-react";

interface MetricsCardsProps {
  metrics: {
    totalCustomers: number;
    activeConversations: number;
    needsHuman: number;
    todayMessages: number;
    weekMessages: number;
    confirmedReservations: number;
  };
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      label: "Mensajes hoy",
      value: metrics.todayMessages,
      sub: `${metrics.weekMessages} esta semana`,
      icon: MessageSquare,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Conversaciones activas",
      value: metrics.activeConversations,
      sub: "En curso ahora",
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Reservas confirmadas",
      value: metrics.confirmedReservations,
      sub: "Total en sistema",
      icon: CalendarDays,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Necesitan atención",
      value: metrics.needsHuman,
      sub: "Requieren humano",
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map(({ label, value, sub, icon: Icon, color, bg }) => (
        <div
          key={label}
          className="bg-white rounded-xl border border-stone-200 p-5 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-500 font-medium">{label}</span>
            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-stone-900">{value}</p>
            <p className="text-xs text-stone-400 mt-1">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
