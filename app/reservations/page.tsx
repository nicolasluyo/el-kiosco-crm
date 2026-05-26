import ReservationsClient from "@/components/reservations/ReservationsClient";

export const dynamic = "force-dynamic";

export default function ReservationsPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Reservas</h1>
        <p className="text-stone-500 text-sm mt-1">
          Gestión de reservas creadas por el agente IA y manualmente
        </p>
      </div>
      <ReservationsClient />
    </div>
  );
}
