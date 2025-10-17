type BusStop = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  estimated_arrival: string;
  is_next_stop: boolean;
};

type Incident = {
  id: number;
  type: string;
  description: string;
  reported_by: string;
  reported_time: string;
  status: string;
  priority: string;
};

type Bus = {
  id: number;
  name: string;
  route_number: string;
  current_location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: string;
  passengers: {
    current: number;
    capacity: number;
    utilization_percentage: number;
  };
  driver: {
    name: string;
    id: string;
    shift_start: string;
    shift_end: string;
  };
  bus_stops: BusStop[];
  incidents: Incident[];
  vehicle_info: {
    license_plate: string;
    model: string;
    year: number;
    fuel_level: number;
    last_maintenance: string;
  };
  route_info: {
    total_distance: number;
    average_speed: number;
    estimated_completion: string;
    frequency_minutes: number;
  };
};

type ApiResponse = {
  message: string;
  company_info: {
    name: string;
    founded: string;
    headquarters: string;
    industry: string;
    description: string;
  };
  bus_lines: Bus[];
  operational_summary: {
    total_buses: number;
    active_buses: number;
    maintenance_buses: number;
    out_of_service_buses: number;
    total_capacity: number;
    current_passengers: number;
    average_utilization: number;
  };
  filters: unknown;
};

import { headers } from "next/headers";

async function fetchData(): Promise<ApiResponse> {
  // Build absolute URL for server-side fetch to internal route
  const h = headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const origin = host ? `${proto}://${host}` : "";
  const res = await fetch(`${origin}/api/transportation`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("فشل تحميل البيانات");
  }
  return res.json();
}

// Client wrapper for the map (handles dynamic import with ssr:false)
import MapClient from "./MapClient";
import FiltersPanel, { type Filters } from "./FiltersPanel";
import ClientSection from "./ClientSection";

export default async function Home() {
  let data: ApiResponse | null = null;
  try {
    data = await fetchData();
  } catch {
    // graceful UI fallback
  }
  if (!data) {
    return (
      <div className="min-h-screen p-6 sm:p-10 container">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Amana Transportation</h1>
        </header>
        <div className="rounded-xl card p-6">
          حدث خطأ في جلب البيانات. الرجاء المحاولة لاحقًا.
        </div>
      </div>
    );
  }
  const { company_info, operational_summary, bus_lines } = data;

  return (
    <div className="min-h-screen p-6 sm:p-10 container">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">{company_info.name}</h1>
        <p className="text-sm opacity-80 mt-1">{company_info.description}</p>
      </header>

      {/* Filters + Map */}
      <section className="mb-8">
        <ClientSection buses={bus_lines} />
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard title="الحافلات" value={operational_summary.total_buses} icon={<BusIcon />} />
        <StatCard title="النشطة" value={operational_summary.active_buses} icon={<ActiveIcon />} />
        <StatCard title="الصيانة" value={operational_summary.maintenance_buses} icon={<WrenchIcon />} />
        <StatCard title="الركاب الآن" value={operational_summary.current_passengers} icon={<UsersIcon />} />
      </section>

      {/* Fleet Health */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">صحة الأسطول</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {bus_lines.slice(0, 6).map((bus) => (
            <div key={bus.id} className="rounded-xl card p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">{bus.name}</div>
                <StatusBadge status={bus.status} />
              </div>
              <div className="text-sm opacity-70">المسار: {bus.route_number}</div>
              <div className="h-2 w-full bg-[rgba(20,184,166,0.15)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--accent)]"
                  style={{ width: `${bus.vehicle_info.fuel_level}%` }}
                />
              </div>
              <div className="text-xs opacity-70">الوقود: {bus.vehicle_info.fuel_level}% • آخر صيانة: {bus.vehicle_info.last_maintenance}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Bus list */}
      <section className="grid gap-6 md:grid-cols-2">
        {bus_lines.map((bus) => (
          <BusCard key={bus.id} bus={bus} />)
        )}
      </section>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl card p-4 flex items-center gap-3">
      {icon}
      <div>
        <div className="text-sm opacity-70 mb-1">{title}</div>
        <div className="text-2xl font-semibold">{value}</div>
      </div>
    </div>
  );
}

function BusCard({ bus }: { bus: Bus }) {
  return (
    <div className="rounded-2xl card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">{bus.name}</h3>
          <div className="text-sm opacity-70">رقم المسار: {bus.route_number}</div>
        </div>
        <StatusBadge status={bus.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="rounded-lg p-3" style={{ background: "var(--accent-muted)" }}>
          <div className="opacity-70">السائق</div>
          <div className="font-medium">{bus.driver.name}</div>
          <div className="opacity-70">{bus.driver.shift_start} - {bus.driver.shift_end}</div>
        </div>
        <div className="rounded-lg bg-black/5 dark:bg-white/5 p-3">
          <div className="opacity-70">الركاب</div>
          <div className="font-medium">{bus.passengers.current} / {bus.passengers.capacity}</div>
          <div className="opacity-70">نسبة الإشغال: {bus.passengers.utilization_percentage}%</div>
        </div>
      </div>

      <div className="text-sm">
        <div className="opacity-70 mb-2">الموقع الحالي</div>
        <div className="rounded-lg card p-3">
          {bus.current_location.address}
        </div>
      </div>

      <div>
        <div className="opacity-70 text-sm mb-2">محطات قادمة</div>
        <ul className="space-y-2">
          {bus.bus_stops.slice(0, 4).map((stop) => (
            <li key={stop.id} className="flex items-center justify-between rounded-lg bg-black/5 dark:bg-white/5 p-3">
              <span className="font-medium flex items-center gap-2">
                <StopIcon />
                {stop.name}
                {stop.is_next_stop && <span className="ml-2 text-xs px-2 py-0.5 rounded-full pill">التالية</span>}
              </span>
              <span className="opacity-70 text-sm">{stop.estimated_arrival}</span>
          </li>
          ))}
        </ul>
      </div>

      {bus.incidents.length > 0 && (
        <div>
          <div className="opacity-70 text-sm mb-2">الحوادث</div>
          <ul className="space-y-2">
            {bus.incidents.map((inc) => (
              <li key={inc.id} className="rounded-lg border border-amber-300/50 bg-amber-50/60 dark:bg-amber-900/20 p-3">
                <div className="text-sm font-medium flex items-center gap-2"><AlertIcon /> {inc.type} • {inc.priority}</div>
                <div className="text-sm opacity-80">{inc.description}</div>
                <div className="text-xs opacity-60 mt-1">{inc.reported_time} — {inc.status}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "Active" ? "bg-emerald-500" :
    status === "Maintenance" ? "bg-amber-500" :
    "bg-gray-400";
  return (
    <span className={`text-white text-sm px-3 py-1 rounded-full ${color}`}>
      {status}
    </span>
  );
}

// Inline icons
function BusIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="12" rx="2" fill="var(--accent)"/>
      <circle cx="7" cy="18" r="2" fill="#0f172a"/>
      <circle cx="17" cy="18" r="2" fill="#0f172a"/>
    </svg>
  );
}
function ActiveIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="var(--accent)"/>
      <path d="M8 12l2.5 2.5L16 9" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function WrenchIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 7a5 5 0 01-6.9 4.6l-7.5 7.5a2 2 0 11-2.8-2.8l7.5-7.5A5 5 0 111 7" fill="var(--accent)"/>
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="9" r="3" fill="var(--accent)"/>
      <circle cx="16" cy="9" r="3" fill="var(--accent)"/>
      <rect x="3" y="14" width="8" height="6" rx="3" fill="var(--accent)"/>
      <rect x="13" y="14" width="8" height="6" rx="3" fill="var(--accent)"/>
    </svg>
  );
}
function StopIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="var(--accent)"/>
      <rect x="8" y="8" width="8" height="8" rx="2" fill="#0f172a"/>
    </svg>
  );
}
function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2l10 18H2L12 2z" fill="#f59e0b"/>
      <rect x="11" y="9" width="2" height="5" fill="#0f172a"/>
      <rect x="11" y="15.5" width="2" height="2" fill="#0f172a"/>
    </svg>
  );
}

// Client subsection to manage filters and map layer
// Placed at end to keep server component clean
 
