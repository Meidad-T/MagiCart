
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// @ts-ignore - leaflet-routing-machine doesn't have perfect TypeScript support
import 'leaflet-routing-machine';
import { Label } from "@/components/ui/label";

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapboxMapProps {
  origin?: string;
  destination?: string;
  onRouteCalculated?: (distance: string, duration: string) => void;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ 
  origin = "Austin, TX", 
  destination = "Austin, TX",
  onRouteCalculated 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const routingControl = useRef<any>(null);

  const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const initializeMap = async () => {
    if (!mapContainer.current) return;

    // Initialize map centered on Austin, TX
    map.current = L.map(mapContainer.current).setView([30.2672, -97.7431], 12);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.current);

    // Geocode addresses and add routing
    const originCoords = await geocodeAddress(origin);
    const destCoords = await geocodeAddress(destination);

    if (originCoords && destCoords && map.current) {
      // Remove existing routing control if it exists
      if (routingControl.current) {
        map.current.removeControl(routingControl.current);
      }

      // Add routing control
      routingControl.current = (L as any).Routing.control({
        waypoints: [
          L.latLng(originCoords[0], originCoords[1]),
          L.latLng(destCoords[0], destCoords[1])
        ],
        routeWhileDragging: false,
        show: false, // Hide the routing instructions panel
        createMarker: function(i: number, waypoint: any) {
          const color = i === 0 ? '#3b82f6' : '#ef4444';
          const title = i === 0 ? `Origin: ${origin}` : `Destination: ${destination}`;
          
          return L.marker(waypoint.latLng, {
            title: title
          }).bindPopup(title);
        }
      }).on('routesfound', function(e: any) {
        const routes = e.routes;
        if (routes.length > 0) {
          const route = routes[0];
          const distance = (route.summary.totalDistance / 1609.34).toFixed(1); // Convert meters to miles
          const duration = Math.round(route.summary.totalTime / 60); // Convert seconds to minutes
          
          if (onRouteCalculated) {
            onRouteCalculated(`${distance} miles`, `${duration} min`);
          }
        }
      }).addTo(map.current);

      // Fit map to show both points
      const group = new L.FeatureGroup([
        L.marker(originCoords),
        L.marker(destCoords)
      ]);
      map.current.fitBounds(group.getBounds().pad(0.1));
    }
  };

  useEffect(() => {
    initializeMap();
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [origin, destination]);

  return (
    <div className="space-y-4">
      <Label className="text-lg font-medium">Route Map</Label>
      <div 
        ref={mapContainer} 
        className="w-full h-64 rounded-lg border shadow-sm"
        style={{ minHeight: '300px' }}
      />
      <div className="text-sm text-gray-600 text-center">
        Blue marker: Origin • Red marker: Destination • Route shown in blue
      </div>
    </div>
  );
};

export default MapboxMap;
