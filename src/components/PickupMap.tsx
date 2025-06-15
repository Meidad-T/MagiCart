
import { GoogleMap, DirectionsRenderer, useLoadScript } from "@react-google-maps/api";
import { useState, useEffect } from "react";

type PickupMapProps = {
  start: [number, number] | null, // [lat, lng] - work location
  dest: [number, number] | null,  // [lat, lng] - home location
  storeLocation?: [number, number] | null; // [lat, lng] - store location
  storeName?: string;
};

// Move libraries array outside component to prevent reloading
const GOOGLE_MAPS_LIBRARIES: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

export default function PickupMap({ start, dest, storeLocation, storeName }: PickupMapProps) {
  const googleMapsApiKey = import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const [directionsResult, setDirectionsResult] = useState<google.maps.DirectionsResult | null>(null);

  // Debug logging
  console.log("Google Maps API Key:", googleMapsApiKey ? "Present" : "Missing");
  console.log("Work coords:", start);
  console.log("Home coords:", dest);
  console.log("Store coords:", storeLocation);

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

  // Calculate directions when start/dest/store change
  useEffect(() => {
    if (isLoaded && start && dest && storeLocation && window.google) {
      console.log("Attempting to calculate multi-stop route...");
      const directionsService = new window.google.maps.DirectionsService();
      
      // Create route: Work → Store → Home
      directionsService.route(
        {
          origin: { lat: start[0], lng: start[1] },
          destination: { lat: dest[0], lng: dest[1] },
          waypoints: [
            {
              location: { lat: storeLocation[0], lng: storeLocation[1] },
              stopover: true
            }
          ],
          travelMode: window.google.maps.TravelMode.DRIVING,
          optimizeWaypoints: true,
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
  }, [isLoaded, start, dest, storeLocation]);

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
  if (!isLoaded || !start || !dest || !storeLocation) {
    return (
      <div className="bg-gray-100 h-36 rounded-xl flex items-center justify-center text-gray-400">
        Map loading…
      </div>
    );
  }

  // Calculate center point for all three locations
  const centerLat = (start[0] + dest[0] + storeLocation[0]) / 3;
  const centerLng = (start[1] + dest[1] + storeLocation[1]) / 3;

  return (
    <div
      className="w-full rounded-xl overflow-hidden border border-gray-300 shadow mb-2"
      style={{ height: 300 }}
    >
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        zoom={12}
        center={{ lat: centerLat, lng: centerLng }}
      >
        {/* Show optimized route with custom styling */}
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
