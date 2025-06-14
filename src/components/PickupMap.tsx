
import { GoogleMap, Marker, Polyline, useLoadScript } from "@react-google-maps/api";
import mapStyle from "./mapStyle.json";
import { useMemo } from "react";

// Put your emoji or custom marker images here
const houseEmoji = "🏠";
const storeImage = "/lovable-uploads/9b4bb088-c2c8-4cdf-90f7-bd262770965e.png";

type PickupMapProps = {
  start: [number, number] | null, // [lat, lng]
  dest: [number, number] | null,  // [lat, lng]
};

export default function PickupMap({ start, dest }: PickupMapProps) {
  // Important: require the user to set their API key in .env.local
  const googleMapsApiKey = import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded } = useLoadScript({
    googleMapsApiKey,
    mapIds: undefined,
  });

  // Only show once ready and both points are given
  if (!isLoaded || !start || !dest) {
    return (
      <div className="bg-gray-100 h-36 rounded-xl flex items-center justify-center text-gray-400">
        Map loading…
      </div>
    );
  }

  const center = useMemo(
    () => ({
      lat: (start[0] + dest[0]) / 2,
      lng: (start[1] + dest[1]) / 2,
    }),
    [start, dest]
  );

  const routePath = useMemo(
    () => [
      { lat: start[0], lng: start[1] },
      { lat: dest[0], lng: dest[1] }
    ],
    [start, dest]
  );

  // Highly zoom in
  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: true,
      zoomControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      restriction: {
        latLngBounds: {
          north: Math.max(start[0], dest[0]) + 0.003,
          south: Math.min(start[0], dest[0]) - 0.003,
          east: Math.max(start[1], dest[1]) + 0.003,
          west: Math.min(start[1], dest[1]) - 0.003
        },
        strictBounds: true
      },
      clickableIcons: false,
      styles: mapStyle,
      minZoom: 17,
      maxZoom: 21,
      gestureHandling: "none"
    }),
    [start, dest]
  );

  return (
    <div
      className="w-full rounded-xl overflow-hidden border border-blue-100 shadow mb-2 relative"
      style={{ height: 220, background: "#eaf3ff" }}
    >
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        options={mapOptions}
        zoom={19}
        center={center}
      >
        {/* Route */}
        <Polyline
          path={routePath}
          options={{
            strokeColor: "#3786F1",
            strokeWeight: 11,
            strokeOpacity: 0.98,
            zIndex: 2,
            icons: [],
          }}
        />
        {/* Start marker - emoji as label */}
        <Marker
          position={{ lat: start[0], lng: start[1] }}
          label={{
            text: houseEmoji,
            fontSize: "24px",
            fontWeight: "bold",
          }}
          icon={{
            path: "",
            anchor: { x: 16, y: 32 },
            labelOrigin: { x: 20, y: 20 },
            scaledSize: { width: 32, height: 32 },
          }}
        />
        {/* Dest marker - store icon */}
        <Marker
          position={{ lat: dest[0], lng: dest[1] }}
          icon={{
            url: storeImage,
            scaledSize: { width: 38, height: 38 },
            anchor: { x: 19, y: 38 }
          }}
        />
      </GoogleMap>
      <div className="absolute inset-0 border-[3px] border-blue-300 pointer-events-none rounded-xl" style={{ zIndex: 20, opacity: 0.23 }} />
    </div>
  );
}
