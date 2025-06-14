
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

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
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isTokenSet, setIsTokenSet] = useState(false);

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-97.7431, 30.2672], // Austin, TX coordinates
      zoom: 12
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Geocode and add markers for origin and destination
    geocodeAndAddRoute();
  };

  const geocodeAndAddRoute = async () => {
    if (!map.current || !mapboxToken) return;

    try {
      // Geocode origin
      const originResponse = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(origin)}.json?access_token=${mapboxToken}`
      );
      const originData = await originResponse.json();
      
      // Geocode destination
      const destResponse = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?access_token=${mapboxToken}`
      );
      const destData = await destResponse.json();

      if (originData.features.length > 0 && destData.features.length > 0) {
        const originCoords = originData.features[0].center;
        const destCoords = destData.features[0].center;

        // Add origin marker (blue)
        new mapboxgl.Marker({ color: '#3b82f6' })
          .setLngLat(originCoords)
          .setPopup(new mapboxgl.Popup().setHTML(`<div><strong>Origin</strong><br/>${origin}</div>`))
          .addTo(map.current!);

        // Add destination marker (red)
        new mapboxgl.Marker({ color: '#ef4444' })
          .setLngLat(destCoords)
          .setPopup(new mapboxgl.Popup().setHTML(`<div><strong>Destination</strong><br/>${destination}</div>`))
          .addTo(map.current!);

        // Get route
        const routeResponse = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${originCoords[0]},${originCoords[1]};${destCoords[0]},${destCoords[1]}?geometries=geojson&access_token=${mapboxToken}`
        );
        const routeData = await routeResponse.json();

        if (routeData.routes.length > 0) {
          const route = routeData.routes[0];
          
          // Add route line
          map.current!.on('load', () => {
            map.current!.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: route.geometry
              }
            });

            map.current!.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#3b82f6',
                'line-width': 5
              }
            });
          });

          // Fit map to show both points
          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend(originCoords);
          bounds.extend(destCoords);
          map.current!.fitBounds(bounds, { padding: 50 });

          // Calculate distance and duration
          const distance = (route.distance / 1609.34).toFixed(1); // Convert meters to miles
          const duration = Math.round(route.duration / 60); // Convert seconds to minutes
          
          if (onRouteCalculated) {
            onRouteCalculated(`${distance} miles`, `${duration} min`);
          }
        }
      }
    } catch (error) {
      console.error('Error geocoding or routing:', error);
    }
  };

  useEffect(() => {
    if (isTokenSet && mapboxToken) {
      initializeMap();
    }
    
    return () => {
      map.current?.remove();
    };
  }, [isTokenSet, mapboxToken, origin, destination]);

  if (!isTokenSet) {
    return (
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-500" />
          <Label className="text-lg font-medium">Map Configuration</Label>
        </div>
        <p className="text-sm text-gray-600">
          To display the interactive map, please enter your Mapbox public token. 
          You can get one free at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">mapbox.com</a>
        </p>
        <div className="space-y-2">
          <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
          <Input
            id="mapbox-token"
            type="text"
            placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsYW..."
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
          />
        </div>
        <Button 
          onClick={() => setIsTokenSet(true)}
          disabled={!mapboxToken.startsWith('pk.')}
          className="w-full"
        >
          Load Map
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-medium">Route Map</Label>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsTokenSet(false)}
        >
          Change Token
        </Button>
      </div>
      <div 
        ref={mapContainer} 
        className="w-full h-64 rounded-lg border shadow-sm"
        style={{ minHeight: '300px' }}
      />
      <div className="text-sm text-gray-600 text-center">
        Blue marker: Origin • Red marker: Destination • Blue line: Route
      </div>
    </div>
  );
};

export default MapboxMap;
