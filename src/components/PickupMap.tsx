import { GoogleMap, DirectionsRenderer, useLoadScript, MarkerF } from "@react-google-maps/api";
import { useState, useEffect, useMemo, useCallback } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MapPin } from "lucide-react";
import mapStyle from "./mapStyle.json";
import { supabase } from "@/integrations/supabase/client";

type PickupMapProps = {
  start: [number, number] | null; // [lat, lng] - work or home location
  dest: [number, number] | null;  // [lat, lng] - home location
  storeLocation?: [number, number] | null; // [lat, lng] - store location
  storeName?: string;
};

// Helper to create a data URI from a React component (for map markers)
const createLucideIcon = (icon: React.ReactElement) => {
  const svg = renderToStaticMarkup(icon);
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

// Helper to build public Supabase logo URLs
const getSupabaseLogoUrl = (logo_url?: string) => {
  if (!logo_url) return null;
  // Example URL structure for Supabase Storage public asset:
  // https://xuwfaljqzvjbxhhrjara.supabase.co/storage/v1/object/public/store-logos/mylogo.png
  if (logo_url.startsWith("http")) return logo_url;
  return `https://xuwfaljqzvjbxhhrjara.supabase.co/storage/v1/object/public/store-logos/${logo_url}`;
};

const getStoreIconUrl = (logo_url?: string) => {
  const maybeLogo = getSupabaseLogoUrl(logo_url);
  if (maybeLogo) {
    return maybeLogo;
  }
  // Fallback to a red map pin icon as requested.
  return createLucideIcon(<MapPin size={48} color="white" strokeWidth={1.5} fill="#cc0000" />);
};

const GOOGLE_MAPS_LIBRARIES: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

const PickupMapContent = ({ start, dest, storeLocation, storeName, apiKey, storeLogoUrl }: PickupMapProps & { apiKey: string, storeLogoUrl?: string }) => {
  const [directionsResult, setDirectionsResult] = useState<google.maps.DirectionsResult | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  console.log("Work/Start coords:", start);
  console.log("Home coords:", dest);
  console.log("Store coords:", storeLocation);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
    id: "google-map-script-pickup", // Unique ID for the script
  });

  const isSameStartDest = useMemo(() => 
    start && dest && start[0] === dest[0] && start[1] === dest[1],
    [start, dest]
  );

  // Memoize icons to prevent re-creating them on each render
  const workPinUrl = useMemo(() => createLucideIcon(<MapPin size={48} color="white" strokeWidth={1.5} fill="#007aff" />), []);
  const homePinUrl = useMemo(() => createLucideIcon(<MapPin size={48} color="white" strokeWidth={1.5} fill="#34c759" />), []);
  const storeIconUrl = useMemo(() => getStoreIconUrl(storeLogoUrl), [storeLogoUrl]);

  const startIconUrl = isSameStartDest ? homePinUrl : workPinUrl;
  const destIconUrl = homePinUrl;

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    if (loadError) {
      console.error("Google Maps load error:", loadError);
    }
  }, [loadError]);

  useEffect(() => {
    if (isLoaded && start && dest && storeLocation && window.google) {
      console.log("Attempting to calculate multi-stop route...");
      const directionsService = new window.google.maps.DirectionsService();
      
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

  useEffect(() => {
    if (map && directionsResult?.routes?.[0]?.bounds) {
      map.fitBounds(directionsResult.routes[0].bounds);
    }
  }, [map, directionsResult]);

  if (loadError) {
    return (
      <div className="bg-red-100 h-36 rounded-xl flex items-center justify-center text-red-600 p-4">
        <div className="text-center">
          <p className="font-semibold">Map failed to load</p>
          <p className="text-sm mt-1">Something went wrong. We'll try to fix this soon!</p>
        </div>
      </div>
    );
  }

  if (!isLoaded || !start || !dest || !storeLocation) {
    return (
      <div className="bg-gray-100 h-36 rounded-xl flex items-center justify-center text-gray-400">
        Map loading…
      </div>
    );
  }

  const centerLat = (start[0] + dest[0] + storeLocation[0]) / 3;
  const centerLng = (start[1] + dest[1] + storeLocation[1]) / 3;

  return (
    <div
      className="w-full rounded-xl overflow-hidden border border-gray-300 shadow mb-2"
      style={{ height: 300 }}
    >
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        zoom={11} // Adjusted zoom for a better overview
        center={{ lat: centerLat, lng: centerLng }}
        options={{
          styles: mapStyle,
          disableDefaultUI: true,
        }}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {directionsResult && (
          <DirectionsRenderer
            directions={directionsResult}
            options={{
              suppressMarkers: true, // Hide default markers to use custom ones
              polylineOptions: {
                strokeColor: "#007aff", // Apple-style blue
                strokeWeight: 5,
              },
            }}
          />
        )}

        {/* Custom Markers */}
        {start && window.google && (
          <MarkerF 
            position={{ lat: start[0], lng: start[1] }} 
            icon={{ 
              url: startIconUrl,
              scaledSize: new window.google.maps.Size(48, 48)
            }} 
          />
        )}
        
        {dest && !isSameStartDest && window.google && (
          <MarkerF 
            position={{ lat: dest[0], lng: dest[1] }} 
            icon={{ 
              url: destIconUrl,
              scaledSize: new window.google.maps.Size(48, 48)
            }} 
          />
        )}
        
        {storeLocation && window.google && (
          <MarkerF 
            position={{ lat: storeLocation[0], lng: storeLocation[1] }} 
            icon={{ 
              url: storeIconUrl,
              scaledSize: new window.google.maps.Size(40, 40) // Adjusted size for logos
            }} 
          />
        )}
      </GoogleMap>
    </div>
  );
}

// Exported PickupMap with logo support
export default function PickupMap({ start, dest, storeLocation, storeName, storeLogoUrl }: PickupMapProps & { storeLogoUrl?: string }) {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-google-maps-key');
        if (error) throw error;
        if (data.apiKey) {
          setApiKey(data.apiKey);
          console.log("Successfully fetched Google Maps API Key for client-side map.");
        }
      } catch (error) {
        console.error("Failed to fetch Google Maps API key:", error);
      }
    };
    fetchKey();
  }, []);

  if (!apiKey) {
    return (
      <div className="bg-gray-100 h-36 rounded-xl flex items-center justify-center text-gray-400">
        Map loading…
      </div>
    );
  }

  return <PickupMapContent {...{ start, dest, storeLocation, storeName, apiKey, storeLogoUrl }} />;
}
