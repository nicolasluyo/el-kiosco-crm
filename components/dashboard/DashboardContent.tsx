import MetricsCards from "./MetricsCards";
import ActivityChart from "./ActivityChart";
import ReservationsToday from "./ReservationsToday";
import RecentConversations from "./RecentConversations";

async function getMetrics() {
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const res = await fetch(`${base}/api/metrics`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function DashboardContent() {
  const metrics = await getMetrics();

  if (!metrics) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800">
        <p className="font-medium">Base de datos no configurada</p>
        <p className="text-sm mt-1">Configure DATABASE_URL en .env.local y ejecute las migraciones.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MetricsCards metrics={metrics} />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <ActivityChart data={metrics.dailyMessages} />
        </div>
        <div>
          <ReservationsToday reservations={metrics.todayReservations} />
        </div>
      </div>
      <RecentConversations />
    </div>
  );
}
