"use client";

import { useMemo, useState } from "react";

type Bus = {
  id: number;
  name: string;
  route_number: string;
  status: string;
};

export type Filters = {
  status: string | null;
  route: string | null;
  tile: "osm" | "sat";
  selectedBusId?: number | null;
};

export default function FiltersPanel({
  buses,
  onChange,
  initial,
}: {
  buses: Bus[];
  onChange: (f: Filters) => void;
  initial?: Filters;
}) {
  const routeOptions = useMemo(() => Array.from(new Set(buses.map(b => b.route_number))), [buses]);
  const [filters, setFilters] = useState<Filters>(initial ?? { status: null, route: null, tile: "osm", selectedBusId: null });

  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    const next = { ...filters, [key]: value } as Filters;
    setFilters(next);
    onChange(next);
  }

  const filteredCount = buses.filter((b) => {
    if (filters.status && b.status !== filters.status) return false;
    if (filters.route && b.route_number !== filters.route) return false;
    return true;
  }).length;

  return (
    <div className="rounded-xl card p-4 flex flex-col lg:flex-row gap-3 items-center justify-between">
      <div className="flex gap-3 items-center w-full lg:w-auto">
        <select
          className="rounded-lg border px-3 py-2 text-sm bg-white text-[#0f172a] font-medium shadow-sm border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] hover:border-[var(--accent)]"
          value={filters.status ?? ""}
          onChange={(e) => update("status", e.target.value || null)}
        >
          <option value="">كل الحالات</option>
          <option value="Active">نشطة</option>
          <option value="Maintenance">صيانة</option>
          <option value="Out of Service">خارج الخدمة</option>
        </select>
        <select
          className="rounded-lg border px-3 py-2 text-sm bg-white text-[#0f172a] font-medium shadow-sm border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] hover:border-[var(--accent)]"
          value={filters.route ?? ""}
          onChange={(e) => update("route", e.target.value || null)}
        >
          <option value="">كل المسارات</option>
          {routeOptions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          className="rounded-lg border px-3 py-2 text-sm bg-white text-[#0f172a] font-medium shadow-sm border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] hover:border-[var(--accent)]"
          value={filters.selectedBusId ?? ""}
          onChange={(e) => update("selectedBusId", e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">كل الحافلات</option>
          {buses.map((b) => (
            <option key={b.id} value={b.id}>{b.name} ({b.route_number})</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          className={`px-3 py-2 rounded-lg text-sm hover-scale ${filters.tile === "osm" ? "pill" : "card"}`}
          onClick={() => update("tile", "osm")}
        >خريطة عادية</button>
        <button
          className={`px-3 py-2 rounded-lg text-sm hover-scale ${filters.tile === "sat" ? "pill" : "card"}`}
          onClick={() => update("tile", "sat")}
        >قمر صناعي</button>
        <span className="text-sm opacity-70 ml-2">النتائج: {filteredCount}</span>
        <button
          className="px-3 py-2 rounded-lg text-sm card hover-scale"
          onClick={() => {
            const next: Filters = { ...filters, status: null, route: null };
            setFilters(next);
            onChange(next);
          }}
        >إعادة تعيين</button>
      </div>
    </div>
  );
}


