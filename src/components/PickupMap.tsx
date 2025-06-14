
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
  const googleMapsApiKey = import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  // All hooks MUST be called unconditionally, before any early returns
  const { isLoaded } = useLoadScript({
    googleMapsApiKey,
    mapIds: undefined,
  });

  // Fallbacks if start/dest are not provided yet
  // Default to Austin, TX center if missing
  const safeStart = start ?? [30.2672, -97.7431];
  const safeDest = dest ?? [30.2672, -97.7431];

  const center = useMemo(
    () => ({
      lat: (safeStart[0] + safeDest[0]) / 2,
      lng: (safeStart[1] + safeDest[1]) / 2,
    }),
    [safeStart, safeDest]
  );

  const routePath = useMemo(
    () => [
      { lat: safeStart[0], lng: safeStart[1] },
      { lat: safeDest[0], lng: safeDest[1] }
    ],
    [safeStart, safeDest]
  );

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: true,
      zoomControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      restriction: {
        latLngBounds: {
          north: Math.max(safeStart[0], safeDest[0]) + 0.003,
          south: Math.min(safeStart[0], safeDest[0]) - 0.003,
          east: Math.max(safeStart[1], safeDest[1]) + 0.003,
          west: Math.min(safeStart[1], safeDest[1]) - 0.003
        },
        strictBounds: true
      },
      clickableIcons: false,
      styles: mapStyle,
      minZoom: 17,
      maxZoom: 21,
      gestureHandling: "none"
    }),
    [safeStart, safeDest]
  );

  // Utility to safely create Google Maps objects for marker icons
  function getHouseIcon() {
    if (
      typeof window !== "undefined" &&
      typeof window.google !== "undefined" &&
      window.google.maps
    ) {
      return {
        path: "",
        anchor: new window.google.maps.Point(16, 32),
        labelOrigin: new window.google.maps.Point(20, 20),
        scaledSize: new window.google.maps.Size(32, 32),
      };
    }
    return undefined;
  }
  function getStoreIcon() {
    if (
      typeof window !== "undefined" &&
      typeof window.google !== "undefined" &&
      window.google.maps
    ) {
      return {
        url: storeImage,
        scaledSize: new window.google.maps.Size(38, 38),
        anchor: new window.google.maps.Point(19, 38),
      };
    }
    return undefined;
  }

  // Now it's safe to conditionally render
  if (!isLoaded || !start || !dest) {
    return (
      <div className="bg-gray-100 h-36 rounded-xl flex items-center justify-center text-gray-400">
        Map loading…
      </div>
    );
  }

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
          position={{ lat: safeStart[0], lng: safeStart[1] }}
          label={{
            text: houseEmoji,
            fontSize: "24px",
            fontWeight: "bold",
          }}
          icon={getHouseIcon()}
        />
        {/* Dest marker - store icon */}
        <Marker
          position={{ lat: safeDest[0], lng: safeDest[1] }}
          icon={getStoreIcon()}
        />
      </GoogleMap>
      <div className="absolute inset-0 border-[3px] border-blue-300 pointer-events-none rounded-xl" style={{ zIndex: 20, opacity: 0.23 }} />
    </div>
  );
}
