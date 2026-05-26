import { Suspense } from "react";
import DashboardContent from "@/components/dashboard/DashboardContent";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-stone-500 text-sm mt-1">
          Resumen de actividad — El Kiosco Café Bar
        </p>
      </div>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-white rounded-xl border border-stone-200" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 h-72 bg-white rounded-xl border border-stone-200" />
        <div className="h-72 bg-white rounded-xl border border-stone-200" />
      </div>
    </div>
  );
}
