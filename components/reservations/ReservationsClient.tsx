"use client";

import { useEffect, useState } from "react";
import { RESTAURANT_INFO } from "@/lib/constants";
import {
  CalendarDays,
  Clock,
  Users,
  Phone,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Reservation {
  id: number;
  customerName: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  occasion: string | null;
  notes: string | null;
  status: "pending" | "confirmed" | "cancelled" | "modified";
  createdAt: string;
}

const statusStyles: Record<string, { label: string; cls: string }> = {
  confirmed: { label: "Confirmada", cls: "bg-emerald-100 text-emerald-700" },
  pending: { label: "Pendiente", cls: "bg-yellow-100 text-yellow-700" },
  cancelled: { label: "Cancelada", cls: "bg-red-100 text-red-700" },
  modified: { label: "Modificada", cls: "bg-blue-100 text-blue-700" },
};

export default function ReservationsClient() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetch_ = async () => {
    setLoading(true);
    const url =
      statusFilter === "all"
        ? "/api/reservations"
        : `/api/reservations?status=${statusFilter}`;
    const res = await fetch(url);
    setReservations(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetch_(); }, [statusFilter]);

  async function cancelReservation(id: number) {
    if (!confirm("¿Cancelar esta reserva?")) return;
    await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    fetch_();
  }

  async function confirmReservation(id: number) {
    await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "confirmed" }),
    });
    fetch_();
  }

  const filters = [
    { value: "all", label: "Todas" },
    { value: "confirmed", label: "Confirmadas" },
    { value: "pending", label: "Pendientes" },
    { value: "cancelled", label: "Canceladas" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                statusFilter === f.value
                  ? "bg-amber-600 text-white"
                  : "text-stone-600 hover:bg-stone-100 bg-white border border-stone-200"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nueva reserva
        </button>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-stone-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-stone-400">
            <CalendarDays className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">Sin reservas</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th className="text-left px-4 py-3 font-medium text-stone-500">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-stone-500">Fecha y hora</th>
                <th className="text-left px-4 py-3 font-medium text-stone-500">Personas</th>
                <th className="text-left px-4 py-3 font-medium text-stone-500">Ocasión</th>
                <th className="text-left px-4 py-3 font-medium text-stone-500">Estado</th>
                <th className="text-right px-4 py-3 font-medium text-stone-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {reservations.map((r) => {
                const s = statusStyles[r.status] ?? statusStyles.confirmed;
                return (
                  <tr key={r.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-stone-800">{r.customerName}</p>
                      <p className="text-xs text-stone-400 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {r.phone}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-stone-700">
                        <CalendarDays className="w-3.5 h-3.5 text-stone-400" />
                        {r.date}
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-500 text-xs mt-0.5">
                        <Clock className="w-3 h-3" />
                        {r.time}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-stone-700">
                        <Users className="w-3.5 h-3.5 text-stone-400" />
                        {r.guests}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {r.occasion ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-1 rounded-full font-medium", s.cls)}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {r.status === "pending" && (
                          <button
                            onClick={() => confirmReservation(r.id)}
                            className="text-emerald-600 hover:text-emerald-800 p-1 rounded"
                            title="Confirmar"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {r.status !== "cancelled" && (
                          <button
                            onClick={() => cancelReservation(r.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded"
                            title="Cancelar"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <NewReservationModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); fetch_(); }}
        />
      )}
    </div>
  );
}

function NewReservationModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    date: "",
    time: "19:00",
    guests: 2,
    occasion: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    onCreated();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-5 border-b border-stone-200">
          <h2 className="font-semibold text-stone-900">Nueva reserva</h2>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-stone-600 mb-1">
                Nombre completo *
              </label>
              <input
                required
                value={form.customerName}
                onChange={(e) => set("customerName", e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Teléfono *</label>
              <input
                required
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Personas *</label>
              <input
                type="number"
                required
                min={1}
                max={30}
                value={form.guests}
                onChange={(e) => set("guests", parseInt(e.target.value))}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Fecha *</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Hora *</label>
              <select
                value={form.time}
                onChange={(e) => set("time", e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {RESTAURANT_INFO.capacity.timeSlots.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-stone-600 mb-1">Ocasión</label>
              <select
                value={form.occasion}
                onChange={(e) => set("occasion", e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">No especificada</option>
                {RESTAURANT_INFO.occasions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-stone-600 mb-1">Notas</label>
              <textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={2}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-stone-200 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Crear reserva"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
