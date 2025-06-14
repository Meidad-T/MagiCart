
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

// Cute custom icons
const startIcon = L.divIcon({
  html: '🏠',
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});
const storeIcon = L.divIcon({
  html: '<div style="background: white; border-radius: 50%; box-shadow: 0 1px 6px #888; display:inline-block"><img src="/lovable-uploads/9b4bb088-c2c8-4cdf-90f7-bd262770965e.png" alt="Store" style="width:32px; height:32px; vertical-align:middle; border-radius:50%;" /></div>',
  className: '',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

function fitRoute(map: any, points: [number, number][]) {
  if (map && points.length > 1) {
    const bounds = L.latLngBounds(points[0], points[points.length - 1]);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
  }
}

function MapFitter({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    fitRoute(map, points);
  }, [map, points]);
  return null;
}

type PickupMapProps = {
  start: [number, number] | null, // [lat, lng]
  dest: [number, number] | null,  // [lat, lng]
};

export default function PickupMap({ start, dest }: PickupMapProps) {
  if (!start || !dest)
    return (
      <div className="bg-gray-100 h-36 rounded-xl flex items-center justify-center text-gray-400">
        Map loading…
      </div>
    );

  // Explicitly type as [number, number][]
  const curve: [number, number][] = [
    start,
    [
      start[0] + (dest[0] - start[0]) * 0.33 + 0.002,
      start[1] + (dest[1] - start[1]) * 0.33 - 0.002,
    ],
    [
      start[0] + (dest[0] - start[0]) * 0.66 - 0.002,
      start[1] + (dest[1] - start[1]) * 0.66 + 0.002,
    ],
    dest,
  ];

  return (
    <div
      className="w-full rounded-xl overflow-hidden border border-blue-100 shadow mb-2"
      style={{ height: 180 }}
    >
      <MapContainer
        style={{
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          filter: "contrast(1.13) saturate(1.1) brightness(1.05)",
        }}
        zoom={15}
        center={[(start[0] + dest[0]) / 2, (start[1] + dest[1]) / 2]}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <Polyline
          positions={curve}
          pathOptions={{
            color: "#2563eb",
            weight: 5,
            opacity: 0.85,
            dashArray: "10 14",
            lineCap: "round",
          }}
        />
        <Marker position={start} icon={startIcon} />
        <Marker position={dest} icon={storeIcon} />
        <MapFitter points={[start, dest]} />
      </MapContainer>
    </div>
  );
}
