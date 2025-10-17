"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";

type Props = {
  buses: Array<{
    id: number;
    name: string;
    route_number: string;
    current_location: { latitude: number; longitude: number; address: string };
    status: string;
    passengers: { current: number; capacity: number };
    bus_stops?: { id: number; name: string; latitude: number; longitude: number }[];
  }>;
};

const busIcon = L.icon({
  iconUrl: "/vercel.svg", // placeholder; can be replaced with a bus icon in /public
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

export default function MapView({ buses, tile = "osm" as "osm" | "sat", selectedBusId }: Props & { tile?: "osm" | "sat"; selectedBusId?: number }) {
  const center = buses.length
    ? [buses[0].current_location.latitude, buses[0].current_location.longitude]
    : [3.139, 101.6869];

  const selectedBus = typeof selectedBusId === "number" ? buses.find(b => b.id === selectedBusId) : undefined;
  const routeLatLngs = selectedBus?.bus_stops?.map(s => [s.latitude, s.longitude]) as any[] | undefined;

  return (
    <MapContainer center={center as any} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
      {tile === "osm" ? (
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      ) : (
        <TileLayer
          attribution='Tiles &copy; Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
      )}
      {buses.map((b) => (
        <Marker
          key={b.id}
          position={[b.current_location.latitude, b.current_location.longitude] as any}
          icon={busIcon}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">{b.name}</div>
              <div className="opacity-70">المسار: {b.route_number}</div>
              <div className="mt-1">{b.current_location.address}</div>
              <div className="opacity-70 mt-1">الركاب: {b.passengers.current}/{b.passengers.capacity}</div>
              <div className="opacity-70">الحالة: {b.status}</div>
            </div>
          </Popup>
        </Marker>
      ))}
      {routeLatLngs && routeLatLngs.length > 1 && (
        <Polyline positions={routeLatLngs as any} pathOptions={{ color: "#14b8a6", weight: 4 }} />
      )}
    </MapContainer>
  );
}


