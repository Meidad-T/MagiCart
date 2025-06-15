import { GoogleMap, DirectionsRenderer, useLoadScript, MarkerF, Polyline } from "@react-google-maps/api";
import { useState, useEffect, useMemo, useCallback } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MapPin } from "lucide-react";
import mapStyle from "./mapStyle.json";
import { supabase } from "@/integrations/supabase/client";

type PickupMapProps = {
  start: [number, number] | null;
  dest: [number, number] | null;
  storeLocation?: [number, number] | null;
  storeName?: string;
  routeOptimization: boolean;
  storeLogoUrl?: string;
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

const getStoreColor = (storeName?: string): string => {
    if (!storeName) return '#cc0000'; // Fallback red
    const lowerCaseName = storeName.toLowerCase();
    if (lowerCaseName.includes('kroger')) return '#00549f';
    if (lowerCaseName.includes('h-e-b') || lowerCaseName.includes('heb')) return '#e51937';
    if (lowerCaseName.includes('target')) return '#cc0000';
    if (lowerCaseName.includes("sam's club")) return '#0071ce';
    if (lowerCaseName.includes('aldi')) return '#f8971d';
    return '#cc0000';
};

const getStoreIconUrl = (logo_url?: string, storeName?: string) => {
  const maybeLogo = getSupabaseLogoUrl(logo_url);
  if (maybeLogo) {
    return maybeLogo;
  }
  const storeColor = getStoreColor(storeName);
  return createLucideIcon(<MapPin size={48} color="white" strokeWidth={1.5} fill={storeColor} />);
};

const GOOGLE_MAPS_LIBRARIES: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

const PickupMapContent = ({ start, dest, storeLocation, storeName, apiKey, storeLogoUrl, routeOptimization }: PickupMapProps & { apiKey: string }) => {
  const [directionsResult, setDirectionsResult] = useState<google.maps.DirectionsResult | null>(null);
  const [simplifiedPath, setSimplifiedPath] = useState<google.maps.LatLng[]>([]);
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
  const startPinUrl = useMemo(() => createLucideIcon(<MapPin size={48} color="white" strokeWidth={1.5} fill="#8e44ad" />), []); // Purple for starting point
  const homePinUrl = useMemo(() => createLucideIcon(<MapPin size={48} color="white" strokeWidth={1.5} fill="#34c759" />), []); // Green for home
  const storeIconUrl = useMemo(() => getStoreIconUrl(storeLogoUrl, storeName), [storeLogoUrl, storeName]);

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
            if (result.routes?.[0]?.overview_path) {
              setSimplifiedPath(result.routes[0].overview_path);
            }
          } else {
            console.error("Directions request failed:", status);
            setDirectionsResult(null);
            setSimplifiedPath([]);
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
      className="relative w-full rounded-xl overflow-hidden border border-gray-300 shadow mb-2"
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
              suppressPolylines: true, // Hide default route to draw our own
            }}
          />
        )}
        
        {/* Custom, simplified polyline */}
        {simplifiedPath.length > 0 && (
          <Polyline
            path={simplifiedPath}
            options={{
              strokeColor: "#007aff", // Apple-style blue
              strokeWeight: 6,
              strokeOpacity: 0.8,
            }}
          />
        )}


        {/* Custom Markers */}
        {start && window.google && (
          <MarkerF 
            position={{ lat: start[0], lng: start[1] }} 
            icon={{ 
              url: routeOptimization ? startPinUrl : homePinUrl,
              scaledSize: new window.google.maps.Size(48, 48)
            }} 
          />
        )}
        
        {dest && !isSameStartDest && window.google && (
          <MarkerF 
            position={{ lat: dest[0], lng: dest[1] }} 
            icon={{ 
              url: homePinUrl,
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
      <div className="absolute bottom-2 left-2 bg-white/80 p-2 rounded-lg shadow-md backdrop-blur-sm text-xs">
        <h4 className="font-bold mb-1 text-gray-800">Legend</h4>
        <ul className="space-y-1">
          {routeOptimization ? (
              <>
                  {start && (
                      <li className="flex items-center">
                          <img src={startPinUrl} alt="Starting point" className="w-5 h-5 mr-1.5" />
                          <span className="text-gray-700">Starting point</span>
                      </li>
                  )}
                  {dest && (
                      <li className="flex items-center">
                          <img src={homePinUrl} alt="Home" className="w-5 h-5 mr-1.5" />
                          <span className="text-gray-700">Destination (Home)</span>
                      </li>
                  )}
              </>
          ) : (
              <>
                  {start && (
                      <li className="flex items-center">
                          <img src={homePinUrl} alt="Home" className="w-5 h-5 mr-1.5" />
                          <span className="text-gray-700">Home</span>
                      </li>
                  )}
              </>
          )}
          {storeLocation && (
            <li className="flex items-center">
              <img src={storeIconUrl} alt={storeName || 'Store'} className="w-5 h-5 mr-1.5 object-contain" />
              <span className="text-gray-700">{storeName || 'Store'}</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

// Exported PickupMap with logo support
export default function PickupMap(props: PickupMapProps) {
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

  return <PickupMapContent {...props} apiKey={apiKey} />;
}
