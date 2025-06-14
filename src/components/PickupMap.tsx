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
    // Heavily pad the bounds to keep everything tight and cute
    map.fitBounds(bounds, { padding: [90, 90], maxZoom: 19, animate: false });
    // Lock bounds and zoom tight, so user can't move out
    map.setMinZoom(18);
    map.setMaxZoom(20);
    map.setMaxBounds(bounds.pad(0.7));
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

  const straightLine: [number, number][] = [start, dest];

  return (
    <div
      className="w-full rounded-xl overflow-hidden border border-blue-100 shadow mb-2 relative"
      style={{ height: 220, background: "#eaf3ff" }}
    >
      <MapContainer
        style={{
          width: "100%",
          height: "100%",
          transition: "filter 0.2s",
        }}
        zoom={19}
        minZoom={18}
        maxZoom={20}
        center={[(start[0] + dest[0]) / 2, (start[1] + dest[1]) / 2]}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        zoomControl={false}
        attributionControl={false}
        closePopupOnClick={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <Polyline
          positions={straightLine}
          pathOptions={{
            color: "#3786F1",
            weight: 13,
            opacity: 0.94,
            dashArray: "",
            lineCap: "round",
            className: "pickup-cute-route"
          }}
        />
        <Marker position={start} icon={startIcon} />
        <Marker position={dest} icon={storeIcon} />
        <MapFitter points={straightLine} />
      </MapContainer>
      {/* Remove white overlay for a more vibrant, Waze-like view */}
      {/* marker layer is already prominent */}
      {/* Border for nice modern look */}
      <div className="absolute inset-0 border-[3px] border-blue-300 pointer-events-none rounded-xl" style={{ zIndex: 20, opacity: 0.23 }} />
    </div>
  );
}
