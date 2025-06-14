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
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 18 });
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

  // Draw only a straight line
  const straightLine: [number, number][] = [start, dest];

  return (
    <div
      className="w-full rounded-xl overflow-hidden border border-blue-100 shadow mb-2 relative"
      style={{ height: 180 }}
    >
      <MapContainer
        style={{
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          filter: "contrast(1.08) saturate(0.88) brightness(1.08) grayscale(0.3)",
        }}
        zoom={18}
        center={[(start[0] + dest[0]) / 2, (start[1] + dest[1]) / 2]}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <Polyline
          positions={straightLine}
          pathOptions={{
            color: "#2563eb",
            weight: 7,
            opacity: 0.95,
            dashArray: "", // solid line
            lineCap: "round",
          }}
        />
        <Marker position={start} icon={startIcon} />
        <Marker position={dest} icon={storeIcon} />
        <MapFitter points={straightLine} />
      </MapContainer>
      {/* Soft white overlay for cartoon look */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(1.5px)",
          zIndex: 20,
        }}
      />
      {/* Keep markers above overlay (by raising pointerEvents) */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 30 }} />
    </div>
  );
}
