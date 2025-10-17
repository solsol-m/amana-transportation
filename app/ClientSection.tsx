"use client";

import { useMemo, useState } from "react";
import FiltersPanel, { type Filters } from "./FiltersPanel";
import MapClient from "./MapClient";

type Bus = {
  id: number;
  name: string;
  route_number: string;
  status: string;
  current_location: { latitude: number; longitude: number; address: string };
  passengers: { current: number; capacity: number };
  bus_stops?: { id: number; name: string; latitude: number; longitude: number }[];
};

export default function ClientSection({ buses }: { buses: Bus[] }) {
  const [filters, setFilters] = useState<Filters>({ status: null, route: null, tile: "osm", selectedBusId: null });

  const filtered = useMemo(() => {
    return buses.filter((b) => {
      if (filters.status && b.status !== filters.status) return false;
      if (filters.route && b.route_number !== filters.route) return false;
      return true;
    });
  }, [buses, filters]);

  return (
    <>
      <FiltersPanel buses={buses} initial={filters} onChange={setFilters} />
      <div className="h-[360px] w-full rounded-2xl overflow-hidden card mt-3">
        <MapClient buses={filtered} tile={filters.tile} selectedBusId={filters.selectedBusId ?? undefined} />
      </div>
    </>
  );
}


