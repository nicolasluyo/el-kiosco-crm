import { CalendarDays, Clock, Users } from "lucide-react";

interface Reservation {
  id: number;
  customerName: string;
  time: string;
  guests: number;
  occasion?: string | null;
}

export default function ReservationsToday({ reservations }: { reservations: Reservation[] }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-stone-700">Reservas de hoy</h2>
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
          {reservations.length}
        </span>
      </div>

      {reservations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-stone-400">
          <CalendarDays className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-sm">Sin reservas para hoy</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto max-h-48">
          {reservations.map((r) => (
            <div
              key={r.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-stone-50 border border-stone-100"
            >
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-stone-800 truncate">{r.customerName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-stone-500">{r.time}</span>
                  <span className="text-stone-300">·</span>
                  <span className="text-xs text-stone-500 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {r.guests}
                  </span>
                </div>
                {r.occasion && (
                  <p className="text-xs text-amber-600 mt-0.5">{r.occasion}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
