
import { GoogleMap, DirectionsRenderer, useLoadScript } from "@react-google-maps/api";
import { useState, useEffect } from "react";

type PickupMapProps = {
  start: [number, number] | null, // [lat, lng]
  dest: [number, number] | null,  // [lat, lng]
};

// Move libraries array outside component to prevent reloading
const GOOGLE_MAPS_LIBRARIES: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

export default function PickupMap({ start, dest }: PickupMapProps) {
  const googleMapsApiKey = import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const [directionsResult, setDirectionsResult] = useState<google.maps.DirectionsResult | null>(null);

  // Debug logging
  console.log("Google Maps API Key:", googleMapsApiKey ? "Present" : "Missing");
  console.log("Start coords:", start);
  console.log("Dest coords:", dest);

  // All hooks MUST be called unconditionally, before any early returns
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Log any load errors
  useEffect(() => {
    if (loadError) {
      console.error("Google Maps load error:", loadError);
    }
  }, [loadError]);

  // Calculate directions when start/dest change
  useEffect(() => {
    if (isLoaded && start && dest && window.google) {
      console.log("Attempting to calculate directions...");
      const directionsService = new window.google.maps.DirectionsService();
      
      directionsService.route(
        {
          origin: { lat: start[0], lng: start[1] },
          destination: { lat: dest[0], lng: dest[1] },
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          console.log("Directions result:", { result, status });
          if (status === window.google.maps.DirectionsStatus.OK && result) {
            setDirectionsResult(result);
          } else {
            console.error("Directions request failed:", status);
            setDirectionsResult(null);
          }
        }
      );
    }
  }, [isLoaded, start, dest]);

  // Handle load error
  if (loadError) {
    return (
      <div className="bg-red-100 h-36 rounded-xl flex items-center justify-center text-red-600 p-4">
        <div className="text-center">
          <p className="font-semibold">Map failed to load</p>
          <p className="text-sm mt-1">Check API key and domain restrictions</p>
        </div>
      </div>
    );
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
      className="w-full rounded-xl overflow-hidden border border-gray-300 shadow mb-2"
      style={{ height: 300 }}
    >
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        zoom={13}
        center={{ lat: (start[0] + dest[0]) / 2, lng: (start[1] + dest[1]) / 2 }}
      >
        {/* Show directions route with default Google Maps styling */}
        {directionsResult && (
          <DirectionsRenderer
            directions={directionsResult}
            options={{
              suppressMarkers: false, // Show default Google Maps markers
              polylineOptions: {
                strokeColor: "#4285F4", // Google's default blue
                strokeWeight: 6,
                strokeOpacity: 0.8,
              },
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}
