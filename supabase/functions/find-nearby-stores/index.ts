
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng, keyword } = await req.json();
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    
    if (!apiKey) {
      throw new Error("Google Maps API key not configured");
    }
    if (!lat || !lng || !keyword) {
      throw new Error("Missing required parameters: lat, lng, keyword");
    }

    const radius = 19312; // 12 miles in meters
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`;

    const apiRes = await fetch(url);
    if (!apiRes.ok) {
      const errMsg = await apiRes.text();
      console.error("Error from Google Places API:", errMsg);
      throw new Error(`Google Places API error: ${apiRes.statusText}`);
    }

    const data = await apiRes.json();

    const stores = data.results.map((place: any) => ({
      id: place.place_id,
      name: place.name,
      address_line1: place.vicinity,
      city: null,
      state: null,
      zip_code: null,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      chain: keyword,
      location_id: null,
      store_number: null,
      division_number: null,
      address_line2: null,
      county: null,
      phone: null,
      geolocation: null,
      hours: null,
      departments: null,
      created_at: null,
    }));

    return new Response(JSON.stringify({ stores }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[EdgeFn] error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
