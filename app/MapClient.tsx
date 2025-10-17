"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

type Bus = {
  id: number;
  name: string;
  route_number: string;
  current_location: { latitude: number; longitude: number; address: string };
  status: string;
  passengers: { current: number; capacity: number };
  bus_stops?: { id: number; name: string; latitude: number; longitude: number }[];
};

const MapView = dynamic(() => import("./MapView"), { ssr: false }) as ComponentType<{ buses: Bus[]; tile?: "osm" | "sat"; selectedBusId?: number }>;

export default function MapClient({ buses, tile, selectedBusId }: { buses: Bus[]; tile?: "osm" | "sat"; selectedBusId?: number }) {
  return <MapView buses={buses} tile={tile} selectedBusId={selectedBusId} />;
}


